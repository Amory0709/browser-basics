import { useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import type { AwarenessUser, UserColor } from './types';
import { getWsUrl } from './types';

export type YjsRoom = {
  doc: Y.Doc;
  provider: WebsocketProvider;
  notes: Y.Map<Y.Map<unknown>>;
  strokes: Y.Array<Y.Map<unknown>>;
  messages: Y.Array<Y.Map<unknown>>;
  awarenessUsers: AwarenessUser[];
  connected: boolean;
  synced: boolean;
  localClientId: number;
  setLocalUser: (name: string, color: UserColor) => void;
  updateCursor: (x: number, y: number) => void;
};

export function useYjsRoom(roomId: string, enabled: boolean): YjsRoom | null {
  const [awarenessUsers, setAwarenessUsers] = useState<AwarenessUser[]>([]);
  const [connected, setConnected] = useState(false);
  const [synced, setSynced] = useState(false);

  const bundle = useMemo(() => {
    if (!enabled || !roomId.trim()) return null;

    const doc = new Y.Doc();
    const provider = new WebsocketProvider(getWsUrl(), roomId.trim(), doc, {
      connect: true,
    });

    const notes = doc.getMap<Y.Map<unknown>>('notes');
    const strokes = doc.getArray<Y.Map<unknown>>('strokes');
    const messages = doc.getArray<Y.Map<unknown>>('messages');

    return { doc, provider, notes, strokes, messages };
  }, [enabled, roomId]);

  useEffect(() => {
    if (!bundle) return;

    const { provider } = bundle;

    const onStatus = (event: { status: string }) => {
      setConnected(event.status === 'connected');
    };

    const onSync = (isSynced: boolean) => {
      setSynced(isSynced);
    };

    const refreshAwareness = () => {
      const states = provider.awareness.getStates();
      const users: AwarenessUser[] = [];

      states.forEach((state, clientId) => {
        const user = state.user as
          | { name?: string; color?: UserColor; cursor?: { x: number; y: number } }
          | undefined;

        if (!user?.name || !user.color) return;

        users.push({
          clientId,
          name: user.name,
          color: user.color,
          cursor: user.cursor,
        });
      });

      setAwarenessUsers(users);
    };

    provider.on('status', onStatus);
    provider.on('sync', onSync);
    provider.awareness.on('change', refreshAwareness);

    refreshAwareness();

    return () => {
      provider.off('status', onStatus);
      provider.off('sync', onSync);
      provider.awareness.off('change', refreshAwareness);
      provider.destroy();
      bundle.doc.destroy();
    };
  }, [bundle]);

  if (!bundle) return null;

  const setLocalUser = (name: string, color: UserColor) => {
    bundle.provider.awareness.setLocalStateField('user', {
      name,
      color,
      cursor: bundle.provider.awareness.getLocalState()?.user?.cursor,
    });
  };

  const updateCursor = (x: number, y: number) => {
    const current = bundle.provider.awareness.getLocalState()?.user ?? {};
    bundle.provider.awareness.setLocalStateField('user', {
      ...current,
      cursor: { x, y },
    });
  };

  return {
    ...bundle,
    awarenessUsers,
    connected,
    synced,
    localClientId: bundle.provider.awareness.clientID,
    setLocalUser,
    updateCursor,
  };
}

export function useYMapValues<T>(map: Y.Map<unknown> | null): Map<string, T> {
  const [, bump] = useState(0);

  useEffect(() => {
    if (!map) return;
    const handler = () => bump((n) => n + 1);
    map.observeDeep(handler);
    return () => map.unobserveDeep(handler);
  }, [map]);

  if (!map) return new Map();

  const result = new Map<string, T>();
  map.forEach((value, key) => {
    result.set(key, value as T);
  });
  return result;
}

export function useYArrayValues<T>(array: Y.Array<unknown> | null): T[] {
  const [, bump] = useState(0);

  useEffect(() => {
    if (!array) return;
    const handler = () => bump((n) => n + 1);
    array.observe(handler);
    return () => array.unobserve(handler);
  }, [array]);

  if (!array) return [];
  return array.toArray() as T[];
}
