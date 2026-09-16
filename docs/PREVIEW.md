# 预览 `cern-systems-1989.html`

## 在 Cursor 云端 / Remote

**不要双击 HTML**（只会进编辑器，不会进浏览器）。

任选一种：

### 1. 端口转发（推荐）

终端运行：

```bash
cd docs && python3 -m http.server 8080 --bind 0.0.0.0
```

在 Cursor 打开 **Ports / 端口** 面板 → 找到 **8080** → 点 **Open in Browser**，地址：

`http://localhost:8080/cern-systems-1989.html`

（云端会把 localhost 转到你的浏览器。）

### 2. Simple Browser

命令面板 → **Simple Browser: Show**，输入：

`http://localhost:8080/cern-systems-1989.html`

（需先按上面起 HTTP 服务。）

本页已内联 D3 + GeoJSON，也可试：

`file:///workspace/docs/cern-systems-1989.html`

（部分环境 Simple Browser 对 `file://` 有限制，8080 更稳。）

## 本机 / 公网

- jsDelivr（单文件，无需本地服务）：  
  https://cdn.jsdelivr.net/gh/Amory0709/browser-basics@cursor/frontend-history-eras-e726/docs/cern-systems-1989.html
- 不要用 htmlpreview.github.io（外链脚本会丢）。

## 改地图后重建单页 HTML

```bash
python3 docs/build-inline-html.py
```
