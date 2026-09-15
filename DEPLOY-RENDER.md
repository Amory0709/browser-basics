# Render 部署步骤

代码需先上 GitHub，Render 从 GitHub 拉取并部署。

## 第一步：GitHub 仓库

若还没有 `browser-basics` 仓库：

1. 打开 https://github.com/new
2. Repository name：`browser-basics`
3. Public → Create repository
4. 把本仓库代码 push 上去（见 README 或 `scripts/publish-github.sh`）

## 第二步：Render Blueprint

1. 登录 https://dashboard.render.com
2. 右上角 **New +** → **Blueprint**
3. **Connect GitHub**（首次需授权 Render 访问 GitHub）
4. 选仓库 **`Amory0709/browser-basics`**
5. Render 读取根目录 `render.yaml`，会创建两个服务：

| 服务名 | 类型 | 地址 |
|--------|------|------|
| `browser-basics` | 静态站点（前端） | https://browser-basics.onrender.com |
| `browser-basics-ws` | Web 服务（WebSocket） | wss://browser-basics-ws.onrender.com |

6. 点 **Apply** 开始部署

首次 build 约 3–5 分钟。免费层无访问时会 sleep，首开可能多等 ~30 秒。

## 第三步：验证

1. 打开 https://browser-basics.onrender.com
2. 输入昵称 + 房间名 → 进入
3. 再开一个浏览器 tab / 隐身窗口，同房间名 → 应能看到彼此光标、便签、聊天

## 常见问题

**页面能开，但一直「连接中…」**
- 确认 `browser-basics-ws` 服务状态为 Live
- 浏览器 DevTools → Network → WS，看是否连上 `wss://browser-basics-ws.onrender.com`

**免费层冷启动**
- Render 免费 Web 服务 15 分钟无请求会休眠；第一次打开要等唤醒

**改 WebSocket 地址**
- 若改了 WS 服务名，同步改 `render.yaml` 里 `VITE_WS_URL` 和 `package.json` 的 `build:render`

## 只用 Render、不用 GitHub Pages？

可以。`render.yaml` 已包含前端静态站 + WS 后端，**不必再配 GitHub Pages**。

GitHub Pages workflow（`.github/workflows/pages.yml`）是备选；全 Render 更简单。
