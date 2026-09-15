export type UserColor = {
  bg: string;
  text: string;
  cursor: string;
};

export const USER_COLORS: UserColor[] = [
  { bg: '#fef3c7', text: '#92400e', cursor: '#f59e0b' },
  { bg: '#dbeafe', text: '#1e40af', cursor: '#3b82f6' },
  { bg: '#dcfce7', text: '#166534', cursor: '#22c55e' },
  { bg: '#fce7f3', text: '#9d174d', cursor: '#ec4899' },
  { bg: '#ede9fe', text: '#5b21b6', cursor: '#8b5cf6' },
  { bg: '#ffedd5', text: '#9a3412', cursor: '#f97316' },
  { bg: '#ccfbf1', text: '#115e59', cursor: '#14b8a6' },
  { bg: '#fee2e2', text: '#991b1b', cursor: '#ef4444' },
];

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
  isAdmin?: boolean;
};

export type RoomMeta = {
  adminName: string | null;
  globalFollow: boolean;
  adminViewport: Viewport;
};

export type StickyNoteData = {
  id: string;
  x: number;
  y: number;
  color: string;
  author: string;
};

export type DrawStroke = {
  id: string;
  color: string;
  width: number;
  points: number[];
};

export type ChatMessage = {
  id: string;
  author: string;
  color: string;
  text: string;
  createdAt: number;
};

export function randomName(): string {
  const animals = ['熊猫', '狐狸', '海豚', '猫头鹰', '企鹅', '考拉', '松鼠', '兔子'];
  const adj = ['好奇', '快乐', '专注', '活泼', '聪明', '勇敢', '温柔', '闪亮'];
  const a = animals[Math.floor(Math.random() * animals.length)]!;
  const b = adj[Math.floor(Math.random() * adj.length)]!;
  return `${b}${a}${Math.floor(Math.random() * 90 + 10)}`;
}

export function pickColor(index: number): UserColor {
  return USER_COLORS[index % USER_COLORS.length]!;
}

export function getWsUrl(): string {
  const fromEnv = import.meta.env.VITE_WS_URL as string | undefined;
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    return `${protocol}//${host}:1234`;
  }

  return 'ws://localhost:1234';
}

export function getShareUrl(room: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set('room', room);
  return url.toString();
}

export function getAdminKeyFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('admin')?.trim();
  return key || null;
}

export function resolveAdminSecret(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_KEY as string | undefined;
  return fromEnv?.trim() || 'teach-admin';
}

export function isValidAdminKey(key: string | null | undefined): boolean {
  if (!key?.trim()) return false;
  return key.trim() === resolveAdminSecret();
}
