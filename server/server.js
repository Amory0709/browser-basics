import { WebSocketServer } from 'ws';
import { setupWSConnection } from '@y/websocket-server/utils';

const PORT = Number(process.env.PORT ?? 1234);
const HOST = process.env.HOST ?? '0.0.0.0';

const wss = new WebSocketServer({ port: PORT, host: HOST });

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});

console.log(`Yjs WebSocket server running on ws://${HOST}:${PORT}`);
