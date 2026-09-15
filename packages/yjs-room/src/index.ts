export { configureCollabRoom, getCollabRoomConfig, resolveHostVerifyUrl, resolveWsUrl, stripHostParamsFromUrl } from './config.js';
export { bootstrapHostAccess, clearHostAccess, stripHostKeyFromUrl } from './host-auth.js';
export type { HostBootstrapResult } from './host-auth.js';
export {
  ensurePresenterViewport,
  getUserFollowState,
  readRoomMeta,
  readViewport,
  shouldUserFollow,
  writePresenterViewport,
  writeSessionMode,
} from './room-meta.js';
export { useBoardViewport } from './use-board-viewport.js';
export type { UseBoardViewportOptions } from './use-board-viewport.js';
export { useCollabRoom, useYjsRoom } from './use-collab-room.js';
export type { UseCollabRoomOptions } from './use-collab-room.js';
export { useYArrayValues, useYMapValues } from './use-y-values.js';
export type {
  AwarenessUser,
  CollabRoom,
  CollabRoomCollections,
  RoomMeta,
  SessionMode,
  UserColor,
  Viewport,
  YjsRoom,
} from './types.js';
export { DEFAULT_COLLECTIONS, DEFAULT_VIEWPORT } from './types.js';
