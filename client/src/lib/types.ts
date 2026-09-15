export type UserColor = {
  bg: string;
  text: string;
  cursor: string;
};

export const USER_COLORS: UserColor[] = [
  { bg: 'rgba(255, 107, 157, 0.14)', text: '#ffb3cc', cursor: '#ff6b9d' },
  { bg: 'rgba(192, 132, 252, 0.14)', text: '#d4b8fc', cursor: '#c084fc' },
  { bg: 'rgba(96, 165, 250, 0.14)', text: '#93c5fd', cursor: '#60a5fa' },
  { bg: 'rgba(52, 211, 153, 0.14)', text: '#6ee7b7', cursor: '#34d399' },
  { bg: 'rgba(251, 191, 36, 0.14)', text: '#fcd34d', cursor: '#fbbf24' },
  { bg: 'rgba(244, 114, 182, 0.14)', text: '#f9a8d4', cursor: '#f472b6' },
  { bg: 'rgba(45, 212, 191, 0.14)', text: '#5eead4', cursor: '#2dd4bf' },
  { bg: 'rgba(167, 139, 250, 0.14)', text: '#c4b5fd', cursor: '#a78bfa' },
];

export type { AwarenessUser, RoomMeta, Viewport } from '@browser-basics/yjs-room';

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
  const animals = ['Panda', 'Fox', 'Dolphin', 'Owl', 'Penguin', 'Koala', 'Squirrel', 'Bunny'];
  const adj = ['Curious', 'Happy', 'Focused', 'Lively', 'Clever', 'Brave', 'Gentle', 'Bright'];
  const a = animals[Math.floor(Math.random() * animals.length)]!;
  const b = adj[Math.floor(Math.random() * adj.length)]!;
  return `${b}${a}${Math.floor(Math.random() * 90 + 10)}`;
}

export function pickColor(index: number): UserColor {
  return USER_COLORS[index % USER_COLORS.length]!;
}

export function getShareUrl(room: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set('room', room);
  url.searchParams.delete('_hk');
  url.searchParams.delete('admin');
  return url.toString();
}
