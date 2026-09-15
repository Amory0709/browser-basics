import { getWsUrl } from './types';

const HOST_QUERY_PARAM = '_hk';
const HOST_SESSION_KEY = 'bb-host-v1';

function getVerifyUrl(): string {
  const wsUrl = getWsUrl();
  const httpUrl = wsUrl.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://');
  return `${httpUrl}/api/host-verify`;
}

function stripHostKeyFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(HOST_QUERY_PARAM);
  url.searchParams.delete('admin');
  window.history.replaceState({}, '', url.toString());
}

function captureHostKeyFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const key = params.get(HOST_QUERY_PARAM)?.trim();
  return key || null;
}

function readStoredHostKey(): string | null {
  try {
    return sessionStorage.getItem(HOST_SESSION_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

async function verifyHostKey(key: string): Promise<boolean> {
  try {
    const response = await fetch(`${getVerifyUrl()}?t=${encodeURIComponent(key)}`, {
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

export async function bootstrapHostAccess(): Promise<boolean> {
  const fromUrl = captureHostKeyFromUrl();
  const candidate = fromUrl ?? readStoredHostKey();
  if (!candidate) return false;

  const valid = await verifyHostKey(candidate);
  if (!valid) {
    try {
      sessionStorage.removeItem(HOST_SESSION_KEY);
    } catch {
      // ignore storage errors
    }
    return false;
  }

  try {
    sessionStorage.setItem(HOST_SESSION_KEY, candidate);
  } catch {
    // ignore storage errors
  }

  if (fromUrl) {
    stripHostKeyFromUrl();
  }

  return true;
}

export function clearHostAccess(): void {
  try {
    sessionStorage.removeItem(HOST_SESSION_KEY);
  } catch {
    // ignore storage errors
  }
}
