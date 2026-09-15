import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import type { AwarenessUser, RoomMeta, UserColor, Viewport } from './types';
import { DEFAULT_VIEWPORT, getWsUrl } from './types';

export type YjsRoom = {
  doc: Y.Doc;
  provider: WebsocketProvider;
  notes: Y.Map<Y.Map<unknown>>;
  strokes: Y.Array<Y.Map<unknown>>;
  messages: Y.Array<Y.Map<unknown>>;
  roomMeta: Y.Map<unknown>;
  followMap: Y.Map<boolean>;
  awarenessUsers: AwarenessUser[];
  connected: boolean;
  synced: boolean;
  localClientId: number;
  isAdmin: boolean;
  roomMetaState: RoomMeta;
  shouldFollow: boolean;
  adminClientId: number | null;
  setLocalUser: (name: string, color: UserColor, isAdmin: boolean) => void;
  updateCursor: (x: number, y: number) => void;
  updateViewport: (viewport: Viewport) => void;
  claimAdmin: (name: string) => void;
  setGlobalFollow: (enabled: boolean) => void;
  setUserFollow: (clientId: number, enabled: boolean) => void;
  clearUserFollow: (clientId: number) => void;
};

function readRoomMeta(meta: Y.Map<unknown>): RoomMeta {
  return {
    adminName: (meta.get('adminName') as string | null) ?? null,
    globalFollow: Boolean(meta.get('globalFollow')),
  };
}

function shouldUserFollow(
  clientId: number,
  isAdmin: boolean,
  meta: RoomMeta,
  followMap: Y.Map<boolean>,
): boolean {
  if (isAdmin) return false;

  const override = followMap.get(String(clientId));
  if (override !== undefined) return override;
  return meta.globalFollow;
}

export function useYjsRoom(
  roomId: string,
  enabled: boolean,
  userName: string,
  adminKeyValid: boolean,
): YjsRoom | null {
  const [awarenessUsers, setAwarenessUsers] = useState<AwarenessUser[]>([]);
  const [connected, setConnected] = useState(false);
  const [synced, setSynced] = useState(false);
  const [roomMetaState, setRoomMetaState] = useState<RoomMeta>({
    adminName: null,
    globalFollow: false,
  });
  const [, followBump] = useState(0);

  const bundle = useMemo(() => {
    if (!enabled || !roomId.trim()) return null;

    const doc = new Y.Doc();
    const provider = new WebsocketProvider(getWsUrl(), roomId.trim(), doc, {
      connect: true,
    });

    const notes = doc.getMap<Y.Map<unknown>>('notes');
    const strokes = doc.getArray<Y.Map<unknown>>('strokes');
    const messages = doc.getArray<Y.Map<unknown>>('messages');
    const roomMeta = doc.getMap<unknown>('roomMeta');
    const followMap = doc.getMap<boolean>('followMap');

    return { doc, provider, notes, strokes, messages, roomMeta, followMap };
  }, [enabled, roomId]);

  const isAdmin = Boolean(
    bundle && adminKeyValid && roomMetaState.adminName && roomMetaState.adminName === userName,
  );

  const adminClientId = useMemo(() => {
    if (!roomMetaState.adminName) return null;
    const admin = awarenessUsers.find((user) => user.name === roomMetaState.adminName && user.isAdmin);
    return admin?.clientId ?? null;
  }, [awarenessUsers, roomMetaState.adminName]);

  const shouldFollow = bundle
    ? shouldUserFollow(bundle.provider.awareness.clientID, isAdmin, roomMetaState, bundle.followMap)
    : false;

  useEffect(() => {
    if (!bundle) return;

    const { provider, roomMeta, followMap } = bundle;

    const onStatus = (event: { status: string }) => {
      setConnected(event.status === 'connected');
    };

    const onSync = (isSynced: boolean) => {
      setSynced(isSynced);
    };

    const refreshMeta = () => {
      setRoomMetaState(readRoomMeta(roomMeta));
    };

    const refreshFollow = () => {
      followBump((n) => n + 1);
    };

    const refreshAwareness = () => {
      const states = provider.awareness.getStates();
      const users: AwarenessUser[] = [];

      states.forEach((state, clientId) => {
        const user = state.user as
          | {
              name?: string;
              color?: UserColor;
              cursor?: { x: number; y: number };
              viewport?: Viewport;
              isAdmin?: boolean;
            }
          | undefined;

        if (!user?.name || !user.color) return;

        users.push({
          clientId,
          name: user.name,
          color: user.color,
          cursor: user.cursor,
          viewport: user.viewport,
          isAdmin: user.isAdmin,
        });
      });

      setAwarenessUsers(users);
    };

    provider.on('status', onStatus);
    provider.on('sync', onSync);
    provider.awareness.on('change', refreshAwareness);
    roomMeta.observe(refreshMeta);
    followMap.observe(refreshFollow);

    refreshMeta();
    refreshFollow();
    refreshAwareness();

    return () => {
      provider.off('status', onStatus);
      provider.off('sync', onSync);
      provider.awareness.off('change', refreshAwareness);
      roomMeta.unobserve(refreshMeta);
      followMap.unobserve(refreshFollow);
      provider.destroy();
      bundle.doc.destroy();
    };
  }, [bundle]);

  const claimAdmin = useCallback(
    (name: string) => {
      if (!bundle || !adminKeyValid) return;

      bundle.doc.transact(() => {
        const current = bundle.roomMeta.get('adminName') as string | null | undefined;
        if (!current) {
          bundle.roomMeta.set('adminName', name);
        }
      });
    },
    [bundle, adminKeyValid],
  );

  useEffect(() => {
    if (!bundle || !synced || !adminKeyValid) return;
    claimAdmin(userName);
  }, [bundle, synced, adminKeyValid, userName, claimAdmin]);

  const setLocalUser = useCallback(
    (name: string, color: UserColor, admin: boolean) => {
      if (!bundle) return;
      bundle.provider.awareness.setLocalStateField('user', {
        name,
        color,
        isAdmin: admin,
        cursor: bundle.provider.awareness.getLocalState()?.user?.cursor,
        viewport: bundle.provider.awareness.getLocalState()?.user?.viewport ?? DEFAULT_VIEWPORT,
      });
    },
    [bundle],
  );

  const updateCursor = useCallback(
    (x: number, y: number) => {
      if (!bundle) return;
      const current = bundle.provider.awareness.getLocalState()?.user ?? {};
      bundle.provider.awareness.setLocalStateField('user', {
        ...current,
        cursor: { x, y },
      });
    },
    [bundle],
  );

  const updateViewport = useCallback(
    (viewport: Viewport) => {
      if (!bundle) return;
      const current = bundle.provider.awareness.getLocalState()?.user ?? {};
      bundle.provider.awareness.setLocalStateField('user', {
        ...current,
        viewport,
      });
    },
    [bundle],
  );

  const setGlobalFollow = useCallback(
    (enabled: boolean) => {
      if (!bundle || !isAdmin) return;
      bundle.doc.transact(() => {
        bundle.roomMeta.set('globalFollow', enabled);
      });
    },
    [bundle, isAdmin],
  );

  const setUserFollow = useCallback(
    (clientId: number, enabled: boolean) => {
      if (!bundle || !isAdmin) return;
      bundle.doc.transact(() => {
        bundle.followMap.set(String(clientId), enabled);
      });
    },
    [bundle, isAdmin],
  );

  const clearUserFollow = useCallback(
    (clientId: number) => {
      if (!bundle || !isAdmin) return;
      bundle.doc.transact(() => {
        bundle.followMap.delete(String(clientId));
      });
    },
    [bundle, isAdmin],
  );

  if (!bundle) return null;

  return {
    ...bundle,
    awarenessUsers,
    connected,
    synced,
    localClientId: bundle.provider.awareness.clientID,
    isAdmin,
    roomMetaState,
    shouldFollow,
    adminClientId,
    setLocalUser,
    updateCursor,
    updateViewport,
    claimAdmin,
    setGlobalFollow,
    setUserFollow,
    clearUserFollow,
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

export function getUserFollowState(
  clientId: number,
  meta: RoomMeta,
  followMap: Y.Map<boolean>,
): boolean | null {
  const override = followMap.get(String(clientId));
  if (override !== undefined) return override;
  return meta.globalFollow ? true : null;
}
