import type * as Y from 'yjs';
import type { EmbedRole, EmbedSessionMode, ChildMessage, ParentMessage } from './protocol.js';
import { isChildMessage } from './protocol.js';
import {
  applyChildMessage,
  getSharedYMap,
  getSharedYText,
  mapEntriesRecord,
} from './yjs-store.js';

export type EmbedHostOptions = {
  doc: Y.Doc;
  embedId: string;
  role: EmbedRole;
  sessionMode: EmbedSessionMode;
  iframe: HTMLIFrameElement;
  onSessionModeChange?: (mode: EmbedSessionMode) => void;
};

export type EmbedHost = {
  destroy: () => void;
  setSessionMode: (mode: EmbedSessionMode) => void;
};

type Subscription = {
  ns: string;
  kind: 'map' | 'text';
  cleanup: () => void;
};

export function createEmbedHost({
  doc,
  embedId,
  role,
  sessionMode,
  iframe,
  onSessionModeChange,
}: EmbedHostOptions): EmbedHost {
  const targetOrigin = window.location.origin;
  const subscriptions = new Map<string, Subscription>();
  let currentMode = sessionMode;

  const post = (message: ParentMessage) => {
    iframe.contentWindow?.postMessage(message, targetOrigin);
  };

  const subscribeMap = (ns: string) => {
    const key = `map:${ns}`;
    if (subscriptions.has(key)) return;

    const map = getSharedYMap(doc, embedId, ns);
    const handler = () => {
      post({ type: 'MAP_SNAPSHOT', ns, entries: mapEntriesRecord(map) });
    };
    map.observe(handler);
    subscriptions.set(key, {
      ns,
      kind: 'map',
      cleanup: () => map.unobserve(handler),
    });
    handler();
  };

  const subscribeText = (ns: string) => {
    const key = `text:${ns}`;
    if (subscriptions.has(key)) return;

    const text = getSharedYText(doc, embedId, ns);
    const handler = () => {
      post({ type: 'TEXT_SNAPSHOT', ns, text: text.toString() });
    };
    text.observe(handler);
    subscriptions.set(key, {
      ns,
      kind: 'text',
      cleanup: () => text.unobserve(handler),
    });
    handler();
  };

  const onMessage = (event: MessageEvent) => {
    if (event.source !== iframe.contentWindow) return;
    if (event.origin !== targetOrigin || !isChildMessage(event.data)) return;

    const message = event.data as ChildMessage;
    if (message.type === 'EMBED_HANDSHAKE') {
      if (message.embedId !== embedId) return;
      post({ type: 'EMBED_ACK', embedId, role, sessionMode: currentMode });
      return;
    }

    if (message.type === 'MAP_SUB') {
      subscribeMap(message.ns);
      return;
    }
    if (message.type === 'TEXT_SUB') {
      subscribeText(message.ns);
      return;
    }

    const changed = applyChildMessage(doc, embedId, message);
    if (!changed) return;

    if (changed.kind === 'map') {
      const map = getSharedYMap(doc, embedId, changed.ns);
      if (message.type === 'MAP_SET') {
        post({ type: 'MAP_KEY', ns: changed.ns, key: message.key, value: message.value });
      } else if (message.type === 'MAP_DEL') {
        post({ type: 'MAP_KEY', ns: changed.ns, key: message.key, value: null });
      }
    } else if (changed.kind === 'text' && message.type === 'TEXT_SET') {
      post({ type: 'TEXT_SNAPSHOT', ns: changed.ns, text: message.text });
    }
  };

  window.addEventListener('message', onMessage);

  return {
    destroy: () => {
      window.removeEventListener('message', onMessage);
      for (const sub of subscriptions.values()) sub.cleanup();
      subscriptions.clear();
    },
    setSessionMode: (mode) => {
      currentMode = mode;
      post({ type: 'SESSION_MODE', sessionMode: mode });
      onSessionModeChange?.(mode);
    },
  };
}
