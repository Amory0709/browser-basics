import * as Y from 'yjs';
import type { RoomMeta, SessionMode, Viewport } from './types.js';
import { DEFAULT_VIEWPORT } from './types.js';

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function readViewport(meta: Y.Map<unknown>): Viewport {
  const nested = meta.get('adminViewport');
  if (nested instanceof Y.Map) {
    return {
      x: readNumber(nested.get('x'), 0),
      y: readNumber(nested.get('y'), 0),
      scale: readNumber(nested.get('scale'), 1),
    };
  }

  if (nested && typeof nested === 'object') {
    const record = nested as Partial<Viewport>;
    return {
      x: readNumber(record.x, 0),
      y: readNumber(record.y, 0),
      scale: readNumber(record.scale, 1),
    };
  }

  return {
    x: readNumber(meta.get('viewportX'), 0),
    y: readNumber(meta.get('viewportY'), 0),
    scale: readNumber(meta.get('viewportScale'), 1),
  };
}

function readSessionMode(meta: Y.Map<unknown>): SessionMode {
  const raw = meta.get('sessionMode');
  if (raw === 'follow' || raw === 'free') return raw;
  return meta.get('globalFollow') ? 'follow' : 'free';
}

export function readRoomMeta(meta: Y.Map<unknown>): RoomMeta {
  const adminViewport = readViewport(meta);
  const adminName = (meta.get('adminName') as string | null) ?? null;
  const sessionMode = readSessionMode(meta);

  return {
    adminName,
    presenterName: adminName,
    sessionMode,
    globalFollow: sessionMode === 'follow',
    adminViewport,
    presenterViewport: adminViewport,
  };
}

export function writeSessionMode(meta: Y.Map<unknown>, mode: SessionMode): void {
  meta.set('sessionMode', mode);
  meta.set('globalFollow', mode === 'follow');
}

export function shouldUserFollow(
  clientId: number,
  isPresenter: boolean,
  meta: RoomMeta,
  followMap: Y.Map<boolean>,
): boolean {
  if (isPresenter) return false;

  const override = followMap.get(String(clientId));
  if (override !== undefined) return override;
  return meta.globalFollow;
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

export function writePresenterViewport(meta: Y.Map<unknown>, viewport: Viewport): void {
  meta.set('adminViewport', viewport);
  meta.set('viewportX', viewport.x);
  meta.set('viewportY', viewport.y);
  meta.set('viewportScale', viewport.scale);
}

export function ensurePresenterViewport(meta: Y.Map<unknown>): void {
  if (!meta.has('adminViewport')) {
    meta.set('adminViewport', DEFAULT_VIEWPORT);
  }
}
