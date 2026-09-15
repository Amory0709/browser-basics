import { getCollabRoomConfig, resolveHostVerifyUrl, stripHostParamsFromUrl } from './config.js';

export type HostBootstrapResult = {
  granted: boolean;
  rejectedKey: boolean;
};

function captureHostKeyFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const { hostQueryParam = '_hk' } = getCollabRoomConfig();
  const params = new URLSearchParams(window.location.search);
  const key = params.get(hostQueryParam)?.trim();
  return key || null;
}

function readStoredHostKey(): string | null {
  const { hostSessionKey = 'bb-host-v1' } = getCollabRoomConfig();

  try {
    return sessionStorage.getItem(hostSessionKey)?.trim() || null;
  } catch {
    return null;
  }
}

function writeStoredHostKey(key: string): void {
  const { hostSessionKey = 'bb-host-v1' } = getCollabRoomConfig();

  try {
    sessionStorage.setItem(hostSessionKey, key);
  } catch {
    // ignore storage errors
  }
}

function clearStoredHostKey(): void {
  const { hostSessionKey = 'bb-host-v1' } = getCollabRoomConfig();

  try {
    sessionStorage.removeItem(hostSessionKey);
  } catch {
    // ignore storage errors
  }
}

async function verifyHostKey(key: string): Promise<boolean> {
  try {
    const response = await fetch(`${resolveHostVerifyUrl()}?t=${encodeURIComponent(key)}`, {
      method: 'GET',
      credentials: 'omit',
    });
    if (!response.ok) return false;
    const payload = (await response.json()) as { ok?: boolean };
    return payload.ok === true;
  } catch {
    return false;
  }
}

export async function bootstrapHostAccess(): Promise<HostBootstrapResult> {
  const fromUrl = captureHostKeyFromUrl();
  const candidate = fromUrl ?? readStoredHostKey();
  if (!candidate) {
    return { granted: false, rejectedKey: false };
  }

  const valid = await verifyHostKey(candidate);
  if (!valid) {
    clearStoredHostKey();
    return { granted: false, rejectedKey: Boolean(fromUrl) };
  }

  writeStoredHostKey(candidate);
  return { granted: true, rejectedKey: false };
}

export function stripHostKeyFromUrl(): void {
  stripHostParamsFromUrl();
}

export function clearHostAccess(): void {
  clearStoredHostKey();
}
