import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { resolveWsUrl } from './config.js';
import {
  ensurePresenterViewport,
  readRoomMeta,
  shouldUserFollow,
  writePresenterViewport,
  writeSessionMode,
} from './room-meta.js';
import type {
  AwarenessUser,
  CollabRoom,
  CollabRoomCollections,
  RoomMeta,
  SessionMode,
  UserColor,
  Viewport,
} from './types.js';
import { DEFAULT_COLLECTIONS, DEFAULT_VIEWPORT } from './types.js';

export type UseCollabRoomOptions = {
  roomId: string;
  enabled: boolean;
  userName: string;
  hostGranted: boolean;
  wsUrl?: string;
  collections?: Partial<CollabRoomCollections>;
};

function buildRoom(
  roomId: string,
  wsUrl: string,
  collections: CollabRoomCollections,
): Pick<
  CollabRoom,
  'doc' | 'provider' | 'roomMeta' | 'followMap' | 'notes' | 'strokes' | 'messages'
> {
  const doc = new Y.Doc();
  const provider = new WebsocketProvider(wsUrl, roomId.trim(), doc, {
    connect: true,
  });

  return {
    doc,
    provider,
    notes: doc.getMap(collections.notes),
    strokes: doc.getArray(collections.strokes),
    messages: doc.getArray(collections.messages),
    roomMeta: doc.getMap('roomMeta'),
    followMap: doc.getMap('followMap'),
  };
}

export function useCollabRoom({
  roomId,
  enabled,
  userName,
  hostGranted,
  wsUrl,
  collections: collectionsOverride,
}: UseCollabRoomOptions): CollabRoom | null {
  const collections = useMemo(
    () => ({ ...DEFAULT_COLLECTIONS, ...collectionsOverride }),
    [collectionsOverride],
  );
  const [awarenessUsers, setAwarenessUsers] = useState<AwarenessUser[]>([]);
  const [connected, setConnected] = useState(false);
  const [synced, setSynced] = useState(false);
  const [roomMetaState, setRoomMetaState] = useState<RoomMeta>({
    adminName: null,
    presenterName: null,
    sessionMode: 'free',
    globalFollow: false,
    adminViewport: DEFAULT_VIEWPORT,
    presenterViewport: DEFAULT_VIEWPORT,
  });
  const [, followBump] = useState(0);

  const bundle = useMemo(() => {
    if (!enabled || !roomId.trim()) return null;
    return buildRoom(roomId, wsUrl ?? resolveWsUrl(), collections);
  }, [collections, enabled, roomId, wsUrl]);

  const isPresenter = Boolean(
    bundle &&
      hostGranted &&
      (!roomMetaState.adminName || roomMetaState.adminName === userName),
  );

  const shouldFollow = bundle
    ? shouldUserFollow(bundle.provider.awareness.clientID, isPresenter, roomMetaState, bundle.followMap)
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
      const parsed: AwarenessUser[] = [];

      states.forEach((state, clientId) => {
        const user = state.user as
          | {
              name?: string;
              color?: UserColor;
              cursor?: { x: number; y: number };
              viewport?: Viewport;
            }
          | undefined;

        if (!user?.name || !user.color) return;

        parsed.push({
          clientId,
          name: user.name,
          color: user.color,
          cursor: user.cursor,
          viewport: user.viewport,
        });
      });

      parsed.sort((a, b) => b.clientId - a.clientId);
      const seenNames = new Set<string>();
      const users = parsed.filter((user) => {
        if (seenNames.has(user.name)) return false;
        seenNames.add(user.name);
        return true;
      });

      setAwarenessUsers(users);
    };

    provider.on('status', onStatus);
    provider.on('sync', onSync);
    provider.awareness.on('change', refreshAwareness);
    roomMeta.observeDeep(refreshMeta);
    followMap.observe(refreshFollow);

    refreshMeta();
    refreshFollow();
    refreshAwareness();

    return () => {
      provider.off('status', onStatus);
      provider.off('sync', onSync);
      provider.awareness.off('change', refreshAwareness);
      roomMeta.unobserveDeep(refreshMeta);
      followMap.unobserve(refreshFollow);
      provider.awareness.setLocalState(null);
      provider.destroy();
      bundle.doc.destroy();
    };
  }, [bundle]);

  const claimPresenter = useCallback(
    (name: string) => {
      if (!bundle || !hostGranted) return;

      bundle.doc.transact(() => {
        bundle.roomMeta.set('adminName', name);
        ensurePresenterViewport(bundle.roomMeta);
      });
    },
    [bundle, hostGranted],
  );

  useEffect(() => {
    if (!bundle || !synced || !hostGranted) return;
    claimPresenter(userName);
  }, [bundle, claimPresenter, hostGranted, synced, userName]);

  const setLocalUser = useCallback(
    (name: string, color: UserColor) => {
      if (!bundle) return;
      bundle.provider.awareness.setLocalStateField('user', {
        name,
        color,
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

  const viewportFrame = useRef<number | null>(null);
  const pendingViewport = useRef<Viewport | null>(null);

  const updatePresenterViewport = useCallback(
    (viewport: Viewport) => {
      if (!bundle || !isPresenter) return;

      pendingViewport.current = viewport;
      if (viewportFrame.current !== null) return;

      viewportFrame.current = requestAnimationFrame(() => {
        viewportFrame.current = null;
        const next = pendingViewport.current;
        pendingViewport.current = null;
        if (!next) return;

        bundle.doc.transact(() => {
          writePresenterViewport(bundle.roomMeta, next);
        });

        const current = bundle.provider.awareness.getLocalState()?.user ?? {};
        bundle.provider.awareness.setLocalStateField('user', {
          ...current,
          viewport: next,
        });
      });
    },
    [bundle, isPresenter],
  );

  const setGlobalFollow = useCallback(
    (enabled: boolean) => {
      if (!bundle || !isPresenter) return;
      bundle.doc.transact(() => {
        writeSessionMode(bundle.roomMeta, enabled ? 'follow' : 'free');
      });
    },
    [bundle, isPresenter],
  );

  const setSessionMode = useCallback(
    (mode: SessionMode) => {
      if (!bundle || !isPresenter) return;
      bundle.doc.transact(() => {
        writeSessionMode(bundle.roomMeta, mode);
      });
    },
    [bundle, isPresenter],
  );

  const setUserFollow = useCallback(
    (clientId: number, enabled: boolean) => {
      if (!bundle || !isPresenter) return;
      bundle.doc.transact(() => {
        bundle.followMap.set(String(clientId), enabled);
      });
    },
    [bundle, isPresenter],
  );

  const clearUserFollow = useCallback(
    (clientId: number) => {
      if (!bundle || !isPresenter) return;
      bundle.doc.transact(() => {
        bundle.followMap.delete(String(clientId));
      });
    },
    [bundle, isPresenter],
  );

  if (!bundle) return null;

  return {
    ...bundle,
    awarenessUsers,
    connected,
    synced,
    localClientId: bundle.provider.awareness.clientID,
    isPresenter,
    isAdmin: isPresenter,
    roomMetaState,
    shouldFollow,
    setLocalUser,
    updateCursor,
    updatePresenterViewport,
    updateAdminViewport: updatePresenterViewport,
    claimPresenter,
    claimAdmin: claimPresenter,
    setGlobalFollow,
    setSessionMode,
    setUserFollow,
    clearUserFollow,
  };
}

/** @deprecated Use `useCollabRoom` */
export const useYjsRoom = useCollabRoom;
