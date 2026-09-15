export type CollabRoomConfig = {
  getWsUrl?: () => string;
  getHostVerifyUrl?: () => string;
  hostQueryParam?: string;
  hostSessionKey?: string;
  hostVerifyPath?: string;
  legacyHostQueryParams?: string[];
};

const defaults: CollabRoomConfig = {
  hostQueryParam: '_hk',
  hostSessionKey: 'bb-host-v1',
  hostVerifyPath: '/api/host-verify',
  legacyHostQueryParams: ['admin'],
};

let config: CollabRoomConfig = { ...defaults };

export function configureCollabRoom(next: CollabRoomConfig): void {
  config = { ...config, ...next };
}

export function getCollabRoomConfig(): CollabRoomConfig {
  return config;
}

export function resolveWsUrl(): string {
  if (config.getWsUrl) {
    return config.getWsUrl();
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    return `${protocol}//${host}:1234`;
  }

  return 'ws://localhost:1234';
}

export function resolveHostVerifyUrl(): string {
  if (config.getHostVerifyUrl) {
    return config.getHostVerifyUrl();
  }

  const path = config.hostVerifyPath ?? defaults.hostVerifyPath!;
  const wsUrl = resolveWsUrl();
  const httpUrl = wsUrl
    .replace(/^ws:\/\//, 'http://')
    .replace(/^wss:\/\//, 'https://')
    .replace(/\/yjs$/, '');
  return `${httpUrl}${path}`;
}

export function stripHostParamsFromUrl(): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const queryParam = config.hostQueryParam ?? defaults.hostQueryParam!;
  url.searchParams.delete(queryParam);

  for (const legacy of config.legacyHostQueryParams ?? defaults.legacyHostQueryParams!) {
    url.searchParams.delete(legacy);
  }

  window.history.replaceState({}, '', url.toString());
}
