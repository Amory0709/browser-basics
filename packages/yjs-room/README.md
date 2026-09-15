# @browser-basics/yjs-room

Yjs room sync with hidden presenter permissions, per-user follow controls, and shared viewport state.

## Install

Inside this monorepo:

```json
{
  "dependencies": {
    "@browser-basics/yjs-room": "*"
  }
}
```

Peer dependencies: `react`, `yjs`, `y-websocket`.

## Client setup

```ts
import {
  bootstrapHostAccess,
  configureCollabRoom,
  stripHostKeyFromUrl,
  useCollabRoom,
  useBoardViewport,
} from '@browser-basics/yjs-room';

configureCollabRoom({
  getWsUrl: () => import.meta.env.VITE_WS_URL ?? 'ws://localhost:1234',
});

const [hostGranted, setHostGranted] = useState(false);

useEffect(() => {
  void bootstrapHostAccess().then((result) => setHostGranted(result.granted));
}, []);

const room = useCollabRoom({
  roomId: 'my-room',
  enabled: true,
  userName: 'Alice',
  hostGranted,
});
```

### Presenter link

Share a private URL with the `_hk` query parameter. The token is verified by the server and removed from the address bar after join.

```
https://your-app.com/?room=class-a&_hk=YOUR_ADMIN_SECRET
```

## Server setup

```js
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from '@y/websocket-server/utils';
import { handleHostAuthRequest } from '@browser-basics/yjs-room/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? '';
const server = createServer((req, res) => {
  if (handleHostAuthRequest(req, res, ADMIN_SECRET)) return;
  // health checks, etc.
});

const wss = new WebSocketServer({ server });
wss.on('connection', (ws, req) => setupWSConnection(ws, req));
server.listen(1234);
```

## API overview

| Export | Purpose |
|--------|---------|
| `useCollabRoom` | Connect to a Yjs room with presenter + follow state |
| `useBoardViewport` | Pan/zoom + follow presenter viewport |
| `bootstrapHostAccess` | Verify presenter token from URL or session |
| `configureCollabRoom` | WS URL, host query param, verify path |
| `getUserFollowState` | Read per-user follow override |
| `@browser-basics/yjs-room/server` | Host token verification HTTP handler |

## Room document shape

| Key | Type | Purpose |
|-----|------|---------|
| `roomMeta` | `Y.Map` | `adminName`, `globalFollow`, `adminViewport` |
| `followMap` | `Y.Map<boolean>` | Per-client follow overrides |
| `notes` / `strokes` / `messages` | default app collections | customizable via `collections` option |
