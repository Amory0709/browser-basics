# Dual-product architecture: collab framework and courses

The repo ships two separable products: (1) a Yjs-based collab framework that hosts any HTML page as an interactive embed inside a persistent room, and (2) static HTML courses under `courses/` with lessons and (later) quizzes. The framework must not depend on specific course HTML; course pages must not import Yjs — only `@browser-basics/embed-sdk`.

Monorepo layout: `packages/yjs-room` and `packages/embed-sdk` for runtime; `courses/` for lesson HTML served same-origin; `client/` as the shell (embed host, presenter UI); `client/demo/` for legacy board toys; `server/` for WebSocket + persistence. Mini-games are embeds on the same SDK, added after framework v1.
