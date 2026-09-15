import type * as Y from 'yjs';
import type { WebsocketProvider } from 'y-websocket';

export type UserColor = {
  bg: string;
  text: string;
  cursor: string;
};

export type Viewport = {
  x: number;
  y: number;
  scale: number;
};

export const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, scale: 1 };

export type AwarenessUser = {
  clientId: number;
  name: string;
  color: UserColor;
  cursor?: { x: number; y: number };
  viewport?: Viewport;
};

export type SessionMode = 'follow' | 'free';

export type RoomMeta = {
  adminName: string | null;
  /** Alias for `adminName` */
  presenterName: string | null;
  sessionMode: SessionMode;
  globalFollow: boolean;
  adminViewport: Viewport;
  /** Alias for `adminViewport` */
  presenterViewport: Viewport;
};

export type CollabRoomCollections = {
  notes: string;
  strokes: string;
  messages: string;
};

export const DEFAULT_COLLECTIONS: CollabRoomCollections = {
  notes: 'notes',
  strokes: 'strokes',
  messages: 'messages',
};

export type CollabRoom = {
  doc: Y.Doc;
  provider: WebsocketProvider;
  roomMeta: Y.Map<unknown>;
  followMap: Y.Map<boolean>;
  notes: Y.Map<Y.Map<unknown>>;
  strokes: Y.Array<Y.Map<unknown>>;
  messages: Y.Array<Y.Map<unknown>>;
  awarenessUsers: AwarenessUser[];
  connected: boolean;
  synced: boolean;
  localClientId: number;
  isPresenter: boolean;
  /** @deprecated Use `isPresenter` */
  isAdmin: boolean;
  roomMetaState: RoomMeta;
  shouldFollow: boolean;
  setLocalUser: (name: string, color: UserColor) => void;
  updateCursor: (x: number, y: number) => void;
  updatePresenterViewport: (viewport: Viewport) => void;
  /** @deprecated Use `updatePresenterViewport` */
  updateAdminViewport: (viewport: Viewport) => void;
  claimPresenter: (name: string) => void;
  /** @deprecated Use `claimPresenter` */
  claimAdmin: (name: string) => void;
  setGlobalFollow: (enabled: boolean) => void;
  setSessionMode: (mode: SessionMode) => void;
  setUserFollow: (clientId: number, enabled: boolean) => void;
  clearUserFollow: (clientId: number) => void;
};

/** @deprecated Use `CollabRoom` */
export type YjsRoom = CollabRoom;
