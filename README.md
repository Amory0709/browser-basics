# 一起玩 · Yjs 协作白板

多人实时协作学习/playground。同一房间链接，大家一起便签、涂鸦、看光标、聊天。

## 技术栈

- **前端**: React + TypeScript + Vite
- **同步**: [Yjs](https://yjs.dev) CRDT
- **传输**: WebSocket (`@y/websocket-server` + `y-websocket`)

选 React 因 Yjs 生态最成熟（provider、awareness、示例多），适合快速做可跑的多人 demo。

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

## 生产部署

1. 构建前端: `npm run build`
2. 静态托管 `client/dist`
3. 单独跑 WebSocket 服务: `npm run start -w server`
4. 设置 `VITE_WS_URL=wss://your-ws-host:1234` 后重新 build

## 项目结构

```
client/   React 前端
server/   Yjs WebSocket 服务
```

## 后续可加

- 共享代码编辑器（y-codemirror）
- 投票/测验 widget
- 房间密码
- 持久化（y-leveldb / 数据库 backend）
