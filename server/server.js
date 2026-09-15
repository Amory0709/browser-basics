import 'dotenv/config';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setPersistence, setupWSConnection } from '@y/websocket-server/utils';
import { handleHostAuthRequest } from '@browser-basics/yjs-room/server';
import { createPersistence } from './persistence.js';

const PORT = Number(process.env.PORT ?? 1234);
const HOST = process.env.HOST ?? '0.0.0.0';
const ADMIN_SECRET = process.env.ADMIN_SECRET?.trim() ?? '';
const YJS_PERSISTENCE_DIR = process.env.YJS_PERSISTENCE_DIR ?? './data/yjs';

setPersistence(createPersistence(YJS_PERSISTENCE_DIR));

const server = createServer((req, res) => {
  if (handleHostAuthRequest(req, res, ADMIN_SECRET)) {
    return;
  }

  const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (requestUrl.pathname === '/' || requestUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
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
