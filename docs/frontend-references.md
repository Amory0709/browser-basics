# 前端参考资料

本仓库学习 Web 前端时的重要参考来源。分为**历史权威资料**（理解脉络）和**高频更新来源**（跟踪现状）两类。

> 按时代划分的关键历史节点见 **[frontend-history-eras.md](frontend-history-eras.md)**。

## 使用建议

| 目的 | 推荐来源 |
|------|----------|
| 理解 Web 历史与标准演进 | W3C History、WHATWG web-history、JavaScript HOPL 论文 |
| 查 API 与标准行为 | MDN、WHATWG/HTML Living Standard、TC39 proposals |
| 每周跟踪行业动态 | Frontend Focus、Front End News、浏览器 Release Notes |
| 查浏览器兼容性 | Can I Use、Baseline、Interop |

---

## 一、历史权威来源

### 标准组织与一手文档

| 来源 | 说明 | 链接 |
|------|------|------|
| W3C Web History | Tim Berners-Lee 发明 Web 的时间线，1989–1994 年 W3C 成立 | https://www.w3.org/History.html |
| W3C Web History Primer | Web 起源、浏览器大战、标准分裂的背景叙事 | https://www.w3.org/2012/08/history-of-the-web/origins.htm |
| W3C 10 周年时间线 | HTML、CSS、DOM、WAI 等标准活动的 chronology | https://www.w3.org/2005/01/timelines/description.html |
| WHATWG web-history | HTML5 时代、W3C/WHATWG 分裂与 2019 年合并 | https://github.com/whatwg/web-history |
| WHATWG HTML Standard（开发者版） | HTML 演进叙事，含 XHTML2 vs HTML5 分叉 | https://html.spec.whatwg.org/dev/introduction.html |
| MDN Web Standards Model | 标准体系总览：W3C、WHATWG、TC39、Khronos | https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/The_web_standards_model |

### 语言与技术史

| 来源 | 说明 | 链接 |
|------|------|------|
| JavaScript: the first 20 years | Brendan Eich 等撰写的 HOPL 论文，TC39 与 ES3–ES2015 完整历史 | https://www.cs.tufts.edu/comp/150FP/archive/brendan-eich/js-hopl.pdf |
| TC39 GitHub | ECMAScript 提案、spec 文本、会议记录 | https://github.com/tc39 |
| CSS Working Group | CSS 标准演进与规范 | https://www.w3.org/Style/CSS/ |

### 行业与文化史

| 来源 | 说明 | 链接 |
|------|------|------|
| Web Almanac | HTTP Archive 数据驱动的年度 Web 现状报告 | https://almanac.httparchive.org/ |
| A List Apart | 2000 年代起 responsive design、语义 HTML 等经典文章 | https://alistapart.com/ |
| Internet Archive Wayback Machine | 历史网站快照，还原早期 Web 体验 | https://web.archive.org/ |

---

## 二、更新频繁来源

### 周刊与资讯（每周 / 高频）

| 来源 | 频率 | 覆盖范围 | 链接 |
|------|------|----------|------|
| Frontend Focus | 每周 | HTML/CSS/JS、浏览器新特性、精选文章 | https://frontendfoc.us/ |
| Front End News | 不定期 | 浏览器版本、框架发布、Interop、Baseline | https://frontendnexus.com/news/ |
| Web Weekly | 每周 | Web Platform 更新、浏览器 scorecard | https://webweekly.dev/ |
| TypeScript.news | 高频 | TypeScript/JavaScript 运行时与工具链发布 | https://typescript.news/ |

### 官方文档与标准动态

| 来源 | 频率 | 覆盖范围 | 链接 |
|------|------|----------|------|
| MDN | 持续更新 | API 文档、Baseline、学习教程 | https://developer.mozilla.org/ |
| MDN 中文学习区 | 持续更新 | 中文结构化前端教程 | https://developer.mozilla.org/zh-CN/docs/Learn_web_development |
| web.dev | 持续更新 | 性能、Core Web Vitals、Baseline、最佳实践 | https://web.dev/ |
| Chrome Developers Blog | 频繁 | Chrome 新特性、"New to the Web Platform" 系列 | https://developer.chrome.com/blog |
| Firefox Release Notes | 约每 4 周 | Firefox 平台更新 | https://www.mozilla.org/firefox/releases/ |
| WebKit Blog | 不定期 | Safari 新特性 | https://webkit.org/blog/ |
| WHATWG Blog | 不定期 | HTML、DOM、Fetch 等 Living Standard 变更 | https://blog.whatwg.org/ |
| TC39 Proposals | 持续 | JavaScript 新特性 stage 跟踪 | https://github.com/tc39/proposals |

### 兼容性与平台数据

| 来源 | 频率 | 覆盖范围 | 链接 |
|------|------|----------|------|
| Can I Use | 持续更新 | 浏览器特性支持矩阵 | https://caniuse.com/ |
| Baseline | 持续更新 | Web 平台特性分级（widely / newly available） | https://web.dev/baseline/ |
| Interop | 年度 | 跨浏览器一致性重点特性 | https://web.dev/interop/ |
| State of CSS / JS / HTML | 年度 | 开发者调查与趋势 | https://stateofcss.com/ |

### 框架与工具

| 来源 | 覆盖范围 | 链接 |
|------|----------|------|
| Angular Blog | Angular 版本与生态更新 | https://blog.angular.dev/ |
| React Blog | React 与相关工具更新 | https://react.dev/blog |
| Vue Blog | Vue 生态更新 | https://blog.vuejs.org/ |
| Node.js Release Blog | Node.js 版本发布 | https://nodejs.org/en/blog/release |
| npm trends | 包下载量趋势对比 | https://npmtrends.com/ |

---

## 三、中文优先阅读路径

1. **入门与 API 查阅**：MDN 中文学习区 → 具体 API 页面
2. **性能与工程实践**：web.dev（部分有中文）
3. **框架文档**：Angular / Vue / React 官方中文文档
4. **行业动态**：Frontend Focus、Front End News（英文，但链接质量高）

---

## 四、与本项目的关系

`browser-basics` 是一个多人实时协作的前端 playground，涉及：

- **Web 基础**：HTML/CSS/JS、DOM 事件
- **实时协作**：Yjs CRDT、WebSocket
- **React 生态**：组件、Hooks、TypeScript

学习或扩展功能时，建议优先查阅 **MDN**（API 行为）、**Can I Use / Baseline**（兼容性）、**Frontend Focus**（新特性趋势）。
