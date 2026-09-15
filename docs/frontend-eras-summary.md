# 前端历史时代总览

8 个时代的速查表。边界年份有重叠，时代之间是渐变不是硬切。

> Web 诞生故事见 [web-birth-story.md](web-birth-story.md)。

---

## 时代一览

| 时代 | 年份 | 核心 |
|------|------|------|
| **1. Web 诞生** | 1989–1994 | HTTP/HTML/首个浏览器，W3C 成立 |
| **2. 浏览器大战 1.0** | 1994–1999 | JS/CSS/DOM 成型，Netscape vs IE |
| **3. XHTML 弯路** | 2000–2004 | W3C 推 XML，WHATWG 另起 HTML5 |
| **4. Web 2.0 / AJAX** | 2005–2009 | 页面变应用，jQuery + JSON + Node.js |
| **5. 移动 / 响应式** | 2010–2014 | RWD、Flexbox、HTML5 定稿、React/Vue 诞生 |
| **6. 组件框架** | 2012–2018 | SPA 默认，React/Vue/Angular 三分 |
| **7. 现代工程化** | 2015–2022 | ES6、TypeScript、Webpack → Vite |
| **8. 平台能力回归** | 2019–今 | CSS/HTML 抢 JS 活，Baseline + Interop |

---

## 各时代一句话

### 1. Web 诞生（1989–1994）

文档互联时代。Tim Berners-Lee 在 CERN 提出分布式超文本，HTTP + HTML + 第一个浏览器跑通。1993 免版税，1994 W3C 成立。详见 [web-birth-story.md](web-birth-story.md)。

### 2. 浏览器大战 1.0（1994–1999）

JavaScript、CSS、DOM 在此成型。Netscape 与 IE 各自加私有扩展，开发者经常写两份代码。

### 3. XHTML 弯路（2000–2004）

W3C 押注 XML/XHTML，浏览器厂商不满，2004 年 WHATWG 另起 HTML5 Living Standard。

### 4. Web 2.0 / AJAX（2005–2009）

Gmail 带火异步交互，jQuery 统治 DOM 操作，JSON 取代 XML 成为 API 首选，Node.js 让 JS 走出浏览器。

### 5. 移动 / 响应式（2010–2014）

Ethan Marcotte 提出 Responsive Web Design，Flexbox 趋于稳定，HTML5 定稿，React（2012）与 Vue（2014）诞生。

### 6. 组件框架（2012–2018）

SPA 成为默认架构，虚拟 DOM 与数据绑定成主流。React、Vue、Angular 三分天下。

### 7. 现代工程化（2015–2022）

ES2015 重写 JS 语言基线，TypeScript 成为大厂默认，Webpack 统治打包，2020 年 Vite 以 ESM-native 简化工具链。

### 8. 平台能力回归（2019–今）

W3C/WHATWG 统一 HTML 标准。Container Queries、CSS Nesting、View Transitions 等原生能力逐渐替代 JS 方案。Baseline 与 Interop 成为跨浏览器一致性的显式目标。

---

## 时代关系示意

```
1989 ── Web 诞生 ── 1994 ── 浏览器大战 ── 1999
                                      │
2000 ── XHTML 弯路 ── 2004 ── WHATWG/HTML5
                                      │
2005 ── AJAX/Web2.0 ── 2009 ── Node.js
                                      │
2010 ── 移动/RWD ── 2014 ── React/Vue
         ╲                    ╱
          ── 组件框架 2012–2018 ──
                    │
2015 ── 工程化(ES6/TS/Vite) ── 2022
                    │
2019 ── 平台能力回归(Baseline/Interop) ── 今
```
