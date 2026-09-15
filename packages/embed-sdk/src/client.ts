import type { EmbedRole, EmbedSessionMode, ChildMessage, ParentMessage } from './protocol.js';
import { isParentMessage } from './protocol.js';
import { SharedMap } from './shared-map.js';
import { SharedText } from './shared-text.js';

export type EmbedContext = {
  embedId: string;
  role: EmbedRole;
  sessionMode: EmbedSessionMode;
  getMap: (name: string) => SharedMap;
  getText: (name: string) => SharedText;
  onSessionMode: (cb: (mode: EmbedSessionMode) => void) => () => void;
};

export type EmbedClient = {
  ready: () => Promise<EmbedContext>;
};

function readEmbedId(): string {
  const fromQuery = new URLSearchParams(window.location.search).get('embedId')?.trim();
  if (fromQuery) return fromQuery;
  throw new Error('embed-sdk: missing embedId query param');
}

export function createEmbedClient(): EmbedClient {
  const targetOrigin = window.location.origin;
  const embedId = readEmbedId();
  const maps = new Map<string, SharedMap>();
  const texts = new Map<string, SharedText>();
  const sessionListeners = new Set<(mode: EmbedSessionMode) => void>();
  let sessionMode: EmbedSessionMode = 'free';
  let role: EmbedRole = 'participant';
  let resolved = false;
  let readyPromise: Promise<EmbedContext> | null = null;

  const post = (message: ChildMessage) => {
    window.parent.postMessage(message, targetOrigin);
  };

  const getMap = (name: string) => {
    let map = maps.get(name);
    if (!map) {
      map = new SharedMap(name, post);
      maps.set(name, map);
    }
    return map;
  };

  const getText = (name: string) => {
    let text = texts.get(name);
    if (!text) {
      text = new SharedText(name, post);
      texts.set(name, text);
    }
    return text;
  };

  const onParentMessage = (event: MessageEvent) => {
    if (event.origin !== targetOrigin || !isParentMessage(event.data)) return;
    const message = event.data as ParentMessage;

    if (message.type === 'EMBED_ACK') {
      if (message.embedId !== embedId || resolved) return;
      resolved = true;
      stopHandshakeRetry();
      role = message.role;
      sessionMode = message.sessionMode;
      for (const listener of sessionListeners) listener(sessionMode);
      return;
    }

    if (message.type === 'SESSION_MODE') {
      sessionMode = message.sessionMode;
      for (const listener of sessionListeners) listener(sessionMode);
      return;
    }

    for (const map of maps.values()) map.handleParent(message);
    for (const text of texts.values()) text.handleParent(message);
  };

  window.addEventListener('message', onParentMessage);

  let handshakeTimer: ReturnType<typeof window.setInterval> | null = null;
  const stopHandshakeRetry = () => {
    if (handshakeTimer !== null) {
      window.clearInterval(handshakeTimer);
      handshakeTimer = null;
    }
  };

  const sendHandshake = () => post({ type: 'EMBED_HANDSHAKE', embedId });
  sendHandshake();
  handshakeTimer = window.setInterval(() => {
    if (resolved) {
      stopHandshakeRetry();
      return;
    }
    sendHandshake();
  }, 400);

  const context: EmbedContext = {
    embedId,
    role,
    get sessionMode() {
      return sessionMode;
    },
    getMap,
    getText,
    onSessionMode: (cb) => {
      sessionListeners.add(cb);
      cb(sessionMode);
      return () => sessionListeners.delete(cb);
    },
  };

  return {
    ready: () => {
      if (readyPromise) return readyPromise;
      readyPromise = new Promise((resolve, reject) => {
        if (resolved) {
          resolve(context);
          return;
        }
        const timeout = window.setTimeout(() => {
          window.removeEventListener('message', onReady);
          reject(new Error('embed-sdk: handshake timed out'));
        }, 10_000);
        const onReady = (event: MessageEvent) => {
          if (event.origin !== targetOrigin || !isParentMessage(event.data)) return;
          if (event.data.type !== 'EMBED_ACK' || event.data.embedId !== embedId) return;
          window.clearTimeout(timeout);
          window.removeEventListener('message', onReady);
          resolve(context);
        };
        window.addEventListener('message', onReady);
      });
      return readyPromise;
    },
  };
}
