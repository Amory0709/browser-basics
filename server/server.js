import { createServer } from 'http';
import { timingSafeEqual } from 'crypto';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from '@y/websocket-server/utils';

const PORT = Number(process.env.PORT ?? 1234);
const HOST = process.env.HOST ?? '0.0.0.0';
const ADMIN_SECRET = process.env.ADMIN_SECRET?.trim() ?? '';

function safeEqual(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function isValidHostToken(token) {
  if (!ADMIN_SECRET) return false;
  return safeEqual(token, ADMIN_SECRET);
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = createServer((req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (requestUrl.pathname === '/' || requestUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  if (requestUrl.pathname === '/api/host-verify') {
    const token = requestUrl.searchParams.get('t')?.trim() ?? '';
    const ok = isValidHostToken(token);
    res.writeHead(ok ? 200 : 403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok }));
    return;
  }

  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});

server.listen(PORT, HOST, () => {
  console.log(`Yjs WebSocket server running on http://${HOST}:${PORT}`);
  if (!ADMIN_SECRET) {
    console.warn('ADMIN_SECRET is not set — host controls are disabled.');
  }
});
