import { timingSafeEqual } from 'crypto';

export const HOST_VERIFY_PATH = '/api/host-verify';

export function safeEqual(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function isValidHostToken(token, adminSecret) {
  if (!adminSecret) return false;
  return safeEqual(token, adminSecret);
}

export function setHostAuthCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function handleHostAuthRequest(req, res, adminSecret, pathname = HOST_VERIFY_PATH) {
  setHostAuthCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }

  const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  if (requestUrl.pathname !== pathname) {
    return false;
  }

  const token = requestUrl.searchParams.get('t')?.trim() ?? '';
  const ok = isValidHostToken(token, adminSecret);
  res.writeHead(ok ? 200 : 403, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok }));
  return true;
}
