# Manual Render deployment (when Blueprint is unavailable)

Blueprint is not on the "Choose service" page. If you cannot find it, create the two services manually below.

## Option A: Blueprint (recommended — creates both at once)

1. Go to https://dashboard.render.com
2. **New +** → **Blueprint** (not Static Site / Web Service)
3. Or open https://dashboard.render.com/blueprint/new directly
4. Connect GitHub → select **Amory0709/browser-basics**
5. Blueprint path: `render.yaml` → Apply

---

## Option B: Create two services manually

### Step 1: Web Service (WebSocket)

1. **New +** → **Web Service**
2. Connect **Amory0709/browser-basics**
3. Settings:

| Field | Value |
|-------|-------|
| Name | `browser-basics-ws` |
| Root Directory | (empty) |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm run start` |

Note the URL, e.g. `https://browser-basics-ws.onrender.com`  
WebSocket URL: `wss://browser-basics-ws.onrender.com`

Wait until status is **Live** before continuing.

---

### Step 2: Static Site (frontend)

1. **New +** → **Static Site**
2. Same repo **Amory0709/browser-basics**
3. Settings:

| Field | Value |
|-------|-------|
| Name | `browser-basics` |
| Root Directory | (empty — repo root) |
| Build Command | `npm install && npm run build:render` |
| Publish Directory | `client/dist` |

4. Environment variable:

| Key | Value |
|-----|-------|
| `VITE_WS_URL` | `wss://browser-basics-ws.onrender.com` |

(Use your actual WS URL if the service name differs.)

5. Redirects/Rewrites (SPA):

| Source | Destination |
|--------|-------------|
| `/*` | `/index.html` |

---

## Verify

1. Open the static site URL, e.g. https://browser-basics.onrender.com
2. Join a room, then open an incognito window with the same room
3. Header should show **Synced**; cursors and notes should appear

## FAQ

**Stuck on Connecting** → Confirm `browser-basics-ws` is Live; check WS in browser Network tab.

**Free tier sleep** → No traffic for 15 minutes puts the service to sleep; first load may take ~30 seconds.

**Build failed** → Check Render logs; wrong Root Directory is a common cause.
