# 预览 `cern-systems-1989.html`

## 你看到的「灰框 + 黑边」是什么？

若页面标题是 **「One more step」**，中间灰色条里是 URL、下面有红色 **Open the page** —— 那是 **raw.githack.com / rawcdn.githack.com 的中间确认页**，不是你的地图 CSS，**匿名窗口每次都会先出现这一页**。

要点：

1. 点红色 **Open the page** 才会进入真正的地图；或
2. 改用下面 **无中间页** 的方式。

## 在 Cursor 云端 / Remote（推荐，无 GitHack）

**不要双击 HTML**（只会进编辑器）。

```bash
cd docs && python3 -m http.server 8080 --bind 0.0.0.0
```

Ports 面板 → **8080** → Open in Browser：

`http://localhost:8080/cern-systems-1989.html`

## 公网直链（无 GitHack 中间页）

合并到 `main` 并部署 GitHub Pages 后：

https://Amory0709.github.io/browser-basics/cern-systems-1989.html

（构建时会把单页 HTML 复制到 `client/public/`，随 Pages 一起发布。）

## 仍想用 GitHub 上的单文件（有中间页）

https://raw.githack.com/Amory0709/browser-basics/cursor/frontend-history-eras-e726/docs/cern-systems-1989.html

必须先点 **Open the page**。不要用 jsDelivr 的 `*.html`（`text/plain` 只显示源码）。

## 改地图后重建

```bash
python3 docs/build-inline-html.py
```

会更新 `docs/cern-systems-1989.html` 和 `client/public/cern-systems-1989.html`。
