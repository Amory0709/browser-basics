# 前端历史时代划分

从 Web 诞生到今天的关键节点，按**时代**归纳。边界年份有重叠，时代之间是渐变不是硬切。

> 速查表见 [frontend-eras-summary.md](frontend-eras-summary.md)。  
> 详细出处见 [frontend-references.md](frontend-references.md) 第一节。  
> Web 诞生故事见 [web-birth-story.md](web-birth-story.md)。

---

## 总览

| 时代 | 年份（约） | 一句话 |
|------|-----------|--------|
| [1. Web 诞生](#1-web-诞生19891994) | 1989–1994 | 文档互联：HTTP + HTML + 第一个浏览器 |
| [2. 浏览器大战 1.0](#2-浏览器大战-1019941999) | 1994–1999 | 各做各的：JS/CSS 出现，标准跟不上 |
| [3. 标准化与 XHTML 弯路](#3-标准化与-xhtml-弯路20002004) | 2000–2004 | W3C 推 XML 路线，浏览器厂商另起炉灶 |
| [4. Web 2.0 / AJAX 时代](#4-web-20--ajax-时代20052009) | 2005–2009 | 页面变应用：异步请求 + jQuery 统治 |
| [5. 移动优先 / 响应式](#5-移动优先--响应式20102014) | 2010–2014 | 手机改一切：viewport、Flexbox、HTML5 定稿 |
| [6. 组件框架时代](#6-组件框架时代20122018) | 2012–2018 | React/Vue/Angular 三分，SPA 成默认 |
| [7. 现代工程化](#7-现代工程化20152022) | 2015–2022 | ES 模块、TypeScript、webpack/Vite、Node 工具链 |
| [8. 平台能力回归](#8-平台能力回归20192026) | 2019–今 | 原生 CSS/HTML 抢回 JS 的活，Baseline + Interop |

---

## 1. Web 诞生（1989–1994）

**特征**：超文本文档互联，只读为主，没有样式层和脚本层。

| 年份 | 事件 |
|------|------|
| 1989 | Tim Berners-Lee 在 CERN 提出 Web 构想 |
| 1990 | 第一个浏览器 **WorldWideWeb**、**HTTP**、**HTML**、首个 Web 服务器 |
| 1991 | 第一个网站上线，Web 开始对外传播 |
| 1993 | **Mosaic** 浏览器普及；CERN 宣布 Web 协议与代码**免版税** |
| 1994 | **Netscape** 成立；**W3C** 成立（10 月）—— Web 从实验室走向产业 |

**代表技术**：HTML 0/1、HTTP/0.9–1.0、纯文本超链接

**为什么重要**：一切后续技术的地基。没有 royalty-free 决策，Web 不会扩散这么快。

---

## 2. 浏览器大战 1.0（1994–1999）

**特征**：Netscape vs IE 各自加私有扩展，开发者写「两份代码」。

| 年份 | 事件 |
|------|------|
| 1995 | Brendan Eich **10 天写出 JavaScript**（Netscape）；**CSS** 提案提出 |
| 1996 | CSS1 发布；IE 与 Netscape 市场份额争夺白热化 |
| 1997 | **ECMAScript** 首次标准化（ES1）；HTML 3.2 成为 W3C 推荐标准 |
| 1998 | **DOM Level 1** 发布；Mozilla 项目启动 |
| 1999 | **ES3** 定稿（此后 10 年无大版本）；IE5 占主导 |

**代表技术**：JavaScript、CSS1、DOM、`<table>` 布局、`<font>` 标签

**为什么重要**：JS/CSS/DOM 三件套在此成型；「浏览器不兼容」噩梦从此开始。

---

## 3. 标准化与 XHTML 弯路（2000–2004）

**特征**：W3C 押注 XML/XHTML，浏览器厂商觉得路线不对，自行推进 HTML。

| 年份 | 事件 |
|------|------|
| 2000 | **XHTML 1.0** 发布—— HTML 必须当 XML 写 |
| 2002 | IE6 垄断 ~95% 份额，Web 创新停滞 |
| 2004 | **WHATWG** 成立（Apple、Mozilla、Opera）—— 开始写 **HTML5 Living Standard** |
| 2004 | Ethan Marcotte 尚未发文，但 **Web 2.0** 概念开始流行 |

**代表技术**：XHTML、XML 命名空间、DHTML、Flash 全盛

**为什么重要**：标准组织与浏览器厂商的分裂，直接催生了下一个 HTML5 时代。

---

## 4. Web 2.0 / AJAX 时代（2005–2009）

**特征**：页面不再整页刷新，前端开始承担「应用逻辑」。

| 年份 | 事件 |
|------|------|
| 2005 | **AJAX** 概念提出；**jQuery** 发布—— 抹平浏览器差异 |
| 2006 | JSON 取代 XML 成为 API 数据格式首选 |
| 2007 | **iPhone** 发布—— 移动 Web 需求爆发 |
| 2008 | **Chrome** 发布，**V8** 引擎把 JS 性能拉上一个台阶 |
| 2009 | **Node.js** 发布—— JS 走出浏览器，前端工具链根基 |

**代表技术**：XMLHttpRequest、jQuery、JSON、Flash → 逐渐被 JS 替代

**为什么重要**：前端从「做页面」变成「做应用」；Gmail、Google Maps 是标杆。

---

## 5. 移动优先 / 响应式（2010–2014）

**特征**：手机流量超过桌面，布局范式从固定宽度转向弹性。

| 年份 | 事件 |
|------|------|
| 2010 | Ethan Marcotte 提出 **Responsive Web Design**；**AngularJS** 发布 |
| 2011 | W3C 与 WHATWG **分裂**—— 一个要「定稿 HTML5」，一个要 Living Standard |
| 2012 | **React** 开源（Facebook）；**TypeScript** 发布 |
| 2013 | **Flexbox** 规范趋于稳定；**CSS Grid** 工作草案推进 |
| 2014 | **HTML5** 成为 W3C 推荐标准；**Vue.js** 发布 |

**代表技术**：media query、Flexbox、viewport meta、`<canvas>`

**为什么重要**：一套代码适配多设备成为刚需；语义化 HTML 重新被重视。

---

## 6. 组件框架时代（2012–2018）

**特征**：SPA（单页应用）成默认架构，虚拟 DOM 和数据绑定成主流范式。

| 年份 | 事件 |
|------|------|
| 2013 | React 生态起步（React Native 2015）；Webpack 1.0 |
| 2015 | **ES2015（ES6）** 发布—— 箭头函数、class、Promise、module | 
| 2015 | **Angular 2** 全面重写（TypeScript 优先） |
| 2016 | **Vue 2** 成熟；React 16 前夜 |
| 2017 | React 16（Fiber 架构）；CSS Grid 主流浏览器支持 |
| 2018 | HTTP/2 普及；PWA 概念推广 |

**代表技术**：React / Vue / Angular、SPA、Redux/Vuex、Sass/Less

**为什么重要**：前端工程从「写页面」升级为「搭应用」；组件化思维至今仍是主流。

---

## 7. 现代工程化（2015–2022）

**特征**：TypeScript 成为大厂默认；构建工具链复杂度飙升后又被 Vite 简化。

| 年份 | 事件 |
|------|------|
| 2015 | Babel 让 ES6+ 可降级编译；npm 包生态爆炸 |
| 2017 | **Webpack 4** 成为事实标准 bundler |
| 2019 | W3C 与 WHATWG **重新合并**—— 单一 HTML Living Standard |
| 2020 | **Vite** 发布—— dev server 秒启，ESM-native |
| 2021 | React 18（Concurrent）；Vue 3（Composition API） |
| 2022 | Turbopack 预览；pnpm / esbuild / SWC 加速工具链 |

**代表技术**：TypeScript、Webpack/Vite、ESLint/Prettier、Jest/Vitest、Monorepo

**为什么重要**：类型安全 + 快速构建让大型前端项目可维护；工具链是「隐形的时代标志」。

---

## 8. 平台能力回归（2019–今）

**特征**：浏览器原生能力越来越强，部分框架职责被 CSS/HTML 吸收；跨浏览器一致性成为显式目标。

| 年份 | 事件 |
|------|------|
| 2019 | W3C/WHATWG 统一 HTML 标准；Container Queries 开始推进 |
| 2020 | ES2020（可选链 `?.`、空值合并 `??`） |
| 2021 | **Interop** 项目启动—— 浏览器厂商对齐实现 |
| 2023 | **Baseline** 发布—— 特性可用性分级（widely / newly available） |
| 2024 | CSS **嵌套**、**`:has()`** 广泛可用；View Transitions API |
| 2025 | CSS `@function`、Subgrid 等进入 Baseline；原生能力替代 JS 方案成趋势 |
| 2026 | Scroll-driven animations、Sanitizer API 等持续进标准 |

**代表技术**：Container Queries、CSS Nesting、View Transitions、Web Components、Baseline/Interop

**为什么重要**：前端不再只是「选框架」，而是**平台能力 + 框架**双层决策；Can I Use 正在让位于 Baseline。

---

## 附：JavaScript 语言自身的关键节点

| 年份 | 版本 | 里程碑 |
|------|------|--------|
| 1995 | — | JavaScript 诞生（Netscape） |
| 1997 | ES1 | 首次 ECMA 标准化 |
| 1999 | ES3 | 长期事实标准，IE 绑定 |
| 2009 | ES5 | `strict mode`、JSON 原生支持 |
| 2015 | ES2015 | 模块、class、箭头函数、Promise—— **现代 JS 起点** |
| 2017+ | ES2017… | async/await、可选链、顶层 await… 每年一版 |
| 2026 | ES2026 | 持续演进，见 [TC39 proposals](https://github.com/tc39/proposals) |

---

## 附：CSS 自身的关键节点

| 年份 | 里程碑 |
|------|--------|
| 1996 | CSS1 |
| 1998 | CSS2 |
| 2011 | CSS2.1 定稿 |
| 2012–2015 | Flexbox 稳定 |
| 2017 | CSS Grid 主流可用 |
| 2022–2023 | Container Queries、`:has()` 广泛支持 |
| 2024–2026 | Nesting、Subgrid、View Transitions 进 Baseline |

---

## 怎么读这些时代

1. **学基础**：时代 1–2（HTTP/HTML/DOM/JS/CSS 起源）
2. **理解现状**：时代 5–8（响应式 → 框架 → 工程化 → 平台回归）
3. **避免重复踩坑**：时代 3（XHTML 弯路）、时代 2（浏览器私有扩展）

每个时代的详细原始资料，回到 [frontend-references.md](frontend-references.md) 查链接。
