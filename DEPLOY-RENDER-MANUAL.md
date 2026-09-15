# Render 手动部署（没有 Blueprint 时用）

Blueprint 入口不在「Choose service」那页。若找不到 Blueprint，按下面 **两步** 手动建。

---

## 方式 A：Blueprint（推荐，一次建两个）

1. 回 Render 主页：https://dashboard.render.com
2. 右上角 **New +** 下拉 → 选 **Blueprint**（不是 Static Site / Web Service）
3. 或直接打开：https://dashboard.render.com/blueprint/new
4. Connect GitHub → 选 **Amory0709/browser-basics**
5. Blueprint Path 填：`render.yaml` → Apply

---

## 方式 B：手动建两个服务

### 第一步：Web Service（WebSocket）

1. 主页 **New +** → **Web Service**
2. Connect 仓库 **Amory0709/browser-basics**
3. 填：

| 字段 | 值 |
|------|-----|
| Name | `browser-basics-ws` |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Plan | Free |

4. Advanced → Health Check Path：`/health`
5. Create Web Service

记下地址，形如：`https://browser-basics-ws.onrender.com`  
WebSocket 用：`wss://browser-basics-ws.onrender.com`

等状态变成 **Live** 再继续。

---

### 第二步：Static Site（前端）

1. 主页 **New +** → **Static Site**
2. 同仓库 **Amory0709/browser-basics**
3. 填：

| 字段 | 值 |
|------|-----|
| Name | `browser-basics` |
| Root Directory | 留空（仓库根目录） |
| Build Command | `npm install && npm run build:render` |
| Publish Directory | `client/dist` |

4. 环境变量（Environment）加一条：

| Key | Value |
|-----|-------|
| `VITE_WS_URL` | `wss://browser-basics-ws.onrender.com` |

（若 WS 服务名不同，改成你的实际地址）

5. Redirects/Rewrites（SPA 路由）加：

| Source | Destination |
|--------|-------------|
| `/*` | `/index.html` |

6. Create Static Site

---

## 验证

1. 打开 Static Site 地址，例如 https://browser-basics.onrender.com
2. 进房间，再开隐身窗口同房间
3. 右上角应显示「已同步」，能看到彼此光标/便签

## 常见问题

**一直连接中** → 先确认 `browser-basics-ws` 是 Live，浏览器 Network 里 WS 是否连上。

**免费层 sleep** → 15 分钟无人访问会休眠，首开多等 ~30 秒。

**Build 失败** → 看 Render Logs；常见是 Root Directory 填错。
