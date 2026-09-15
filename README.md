# browser-basics

Real-time collaborative learning playground — Yjs sticky notes, drawing, cursors, and chat. Share one room link and learn together.

Live (after deploy): https://browser-basics.onrender.com (Render) or https://Amory0709.github.io/browser-basics/ (GitHub Pages)

## Stack

- **Frontend**: React + TypeScript + Vite → GitHub Pages
- **Sync**: [Yjs](https://yjs.dev) CRDT
- **WebSocket**: `@y/websocket-server` → [Render](https://render.com) free tier

## Features

- Rooms: same room name = same document
- Sticky notes: drag + multi-user editing (Y.Text)
- Drawing: shared whiteboard (Y.Array)
- Cursors: Awareness broadcasts remote pointers
- Chat: side panel discussion
- Online list + copy invite link
- Admin role: control who follows your viewport

## Local development

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- WebSocket: ws://localhost:1234

Open two browser tabs with the same room name to test collaboration.

## Deployment

| Component | Platform | Notes |
|-----------|----------|-------|
| Static frontend | GitHub Pages | Auto-build on push to `main` |
| WebSocket server | Render | One-click via `render.yaml` |

### 1. Push to GitHub

```bash
export GITHUB_TOKEN=ghp_xxxx   # repo scope
bash scripts/publish-github.sh
```

### 2. Deploy WebSocket (Render)

1. Open https://dashboard.render.com
2. New → Blueprint → connect `mhan8/browser-basics`
3. Render reads `render.yaml` and creates the `browser-basics-ws` service
4. Note the service URL, e.g. `wss://browser-basics-ws.onrender.com`

### 3. Configure frontend WebSocket URL

In GitHub **Settings → Secrets and variables → Actions → Variables**, add:

- Name: `VITE_WS_URL`
- Value: `wss://browser-basics-ws.onrender.com` (your Render URL)

Then run **Actions → Deploy GitHub Pages → Run workflow**, or push again to trigger a rebuild.

## Project structure

```
client/              React frontend demo app
packages/yjs-room/   Reusable Yjs room + presenter permission library
server/              Yjs WebSocket server
.github/workflows/   GitHub Pages CI
render.yaml          Render deployment config
scripts/             publish scripts
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_WS_URL` | WebSocket URL injected at frontend build time |
| `GITHUB_PAGES=true` | Sets Vite base to `/browser-basics/` in CI |
| `PORT` | Injected by Render for the WebSocket server port |
| `ADMIN_SECRET` | Server-only presenter token (set on the WebSocket service) |

## Presenter access (private)

Host controls are not shown in the lobby. Set a long random `ADMIN_SECRET` on the WebSocket server, then bookmark a URL like:

`https://your-site.com/?room=your-room&_hk=YOUR_ADMIN_SECRET`

The `_hk` parameter is removed from the address bar after verification. Share the normal room link (without `_hk`) with participants.
