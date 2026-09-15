# Render deployment

Push code to GitHub first. Render pulls from GitHub and deploys.

## Step 1: GitHub repository

If you do not have a `browser-basics` repo yet:

1. Open https://github.com/new
2. Create the repository
3. Push this codebase (see README or `scripts/publish-github.sh`)

## Step 2: Render Blueprint

1. Sign in at https://dashboard.render.com
2. **New +** → **Blueprint**
3. **Connect GitHub** (authorize Render on first use)
4. Select **`Amory0709/browser-basics`**
5. Render reads `render.yaml` and creates two services:

| Service | Type | URL |
|---------|------|-----|
| `browser-basics` | Static site (frontend) | https://browser-basics.onrender.com |
| `browser-basics-ws` | Web service (WebSocket) | wss://browser-basics-ws.onrender.com |

6. Click **Apply** to deploy

First build takes about 3–5 minutes. The free tier sleeps when idle; the first visit after sleep may take ~30 seconds.

## Step 3: Verify

1. Open https://browser-basics.onrender.com
2. Enter a display name and room name → join
3. Open another browser tab or incognito window with the same room → you should see cursors, notes, and chat

## FAQ

**Page loads but stays on "Connecting…"**
- Confirm `browser-basics-ws` is Live
- In DevTools → Network → WS, check connection to `wss://browser-basics-ws.onrender.com`

**Free tier cold start**
- Render free web services sleep after 15 minutes with no traffic; first request wakes them up

**Change WebSocket URL**
- If you rename the WS service, update `VITE_WS_URL` in `render.yaml` and `build:render` in `package.json`

## Render only, no GitHub Pages?

Yes. `render.yaml` includes the static frontend and WS backend — **GitHub Pages is optional**.

The GitHub Pages workflow (`.github/workflows/pages.yml`) is a backup; all-in on Render is simpler.
