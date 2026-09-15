# browser-basics

多人实时协作学习 playground — Yjs 便签、涂鸦、光标、聊天。同一房间链接，一起玩一起学。

在线地址（部署后）：https://browser-basics.onrender.com （Render）或 https://Amory0709.github.io/browser-basics/ （GitHub Pages）

## 技术栈

- **前端**: React + TypeScript + Vite → GitHub Pages
- **同步**: [Yjs](https://yjs.dev) CRDT
- **WebSocket**: `@y/websocket-server` → [Render](https://render.com) 免费层

## 功能

- 房间制：同房间名 = 同文档
- 便签：拖拽 + 多人同时编辑（Y.Text）
- 涂鸦：共享画板（Y.Array）
- 光标：Awareness 广播远端指针
- 聊天：侧边讨论区
- 在线列表 + 复制邀请链接

## 本地运行

```bash
npm install
npm run dev
```

- 前端: http://localhost:5173
- WebSocket: ws://localhost:1234

开两个浏览器 tab，同房间名即可联调。

## 部署架构

| 组件 | 平台 | 说明 |
|------|------|------|
| 前端静态文件 | GitHub Pages | push 到 `main` 自动构建 |
| WebSocket 服务 | Render | `render.yaml` 一键部署 |

### 1. 推送到 GitHub

```bash
export GITHUB_TOKEN=ghp_xxxx   # repo 权限
bash scripts/publish-github.sh
```

### 2. 部署 WebSocket（Render）

1. 打开 https://dashboard.render.com
2. New → Blueprint → 连接 `mhan8/browser-basics` 仓库
3. Render 会读取根目录 `render.yaml`，创建 `browser-basics-ws` 服务
4. 记下服务 URL，例如 `wss://browser-basics-ws.onrender.com`

### 3. 配置前端 WebSocket 地址

在 GitHub 仓库 **Settings → Secrets and variables → Actions → Variables** 添加：

- 名称：`VITE_WS_URL`
- 值：`wss://browser-basics-ws.onrender.com`（换成你的 Render 地址）

然后 **Actions → Deploy GitHub Pages → Run workflow**，或再 push 一次触发 rebuild。

## 参考资料

- Web 诞生：[docs/web-birth-story.md](docs/web-birth-story.md)
- 时代总览：[docs/frontend-eras-summary.md](docs/frontend-eras-summary.md)

## 项目结构

```
client/              React 前端
server/              Yjs WebSocket 服务
docs/                前端学习参考资料
.github/workflows/   GitHub Pages CI
render.yaml          Render 部署配置
scripts/             发布脚本
```

## 环境变量

| 变量 | 用途 |
|------|------|
| `VITE_WS_URL` | 前端 build 时注入 WebSocket 地址 |
| `GITHUB_PAGES=true` | CI 中设置 Vite base 为 `/browser-basics/` |
| `PORT` | Render 注入，WebSocket 服务端口 |
