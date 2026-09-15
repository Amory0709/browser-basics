export type EmbedRole = 'presenter' | 'participant';
export type EmbedSessionMode = 'follow' | 'free';

export type ParentMessage =
  | { type: 'EMBED_ACK'; embedId: string; role: EmbedRole; sessionMode: EmbedSessionMode }
  | { type: 'SESSION_MODE'; sessionMode: EmbedSessionMode }
  | { type: 'MAP_SNAPSHOT'; ns: string; entries: Record<string, unknown> }
  | { type: 'MAP_KEY'; ns: string; key: string; value: unknown | null }
  | { type: 'TEXT_SNAPSHOT'; ns: string; text: string };

export type ChildMessage =
  | { type: 'EMBED_HANDSHAKE'; embedId: string }
  | { type: 'MAP_SET'; ns: string; key: string; value: unknown }
  | { type: 'MAP_DEL'; ns: string; key: string }
  | { type: 'TEXT_SET'; ns: string; text: string }
  | { type: 'MAP_SUB'; ns: string }
  | { type: 'TEXT_SUB'; ns: string };

export function isParentMessage(data: unknown): data is ParentMessage {
  return Boolean(data && typeof data === 'object' && 'type' in data);
}

export function isChildMessage(data: unknown): data is ChildMessage {
  return Boolean(data && typeof data === 'object' && 'type' in data);
}

