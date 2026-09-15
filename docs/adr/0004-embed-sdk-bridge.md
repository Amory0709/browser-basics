# Embed SDK: framework-agnostic postMessage bridge

Embeds never touch Yjs directly. The client shell owns the Yjs document and exposes shared state to iframe children through **`@browser-basics/embed-sdk`**.

## Why this shape

- **Vanilla HTML**: `<script type="module" src="/embed-sdk.js">` or ESM import — no build step required for simple courses.
- **Bundled SPAs** (Vite + React/Vue/Svelte): `import { createEmbedClient } from '@browser-basics/embed-sdk'` — same API.
- **Optional React helpers**: `useEmbedMap(key)` in `@browser-basics/embed-sdk/react` — thin wrapper, not a separate protocol.

## Protocol

1. Client opens iframe → `courses/.../index.html?embedId=<uuid>`.
2. Child calls `createEmbedClient()` → posts `EMBED_HANDSHAKE` to parent.
3. Parent replies `EMBED_ACK` with `{ embedId, role, allowedNamespaces }`.
4. Data ops are postMessage RPCs proxied to Yjs sub-maps: `embeds.<embedId>.shared.<key>`.
5. Parent enforces same-origin for v1 (`courses/` only); `targetOrigin` locked on both sides.

## API surface (v1)

```ts
createEmbedClient(): EmbedClient

EmbedClient.ready(): Promise<EmbedContext>
EmbedContext.getMap(name: string): SharedMap   // get/set/observe, JSON-serializable values
EmbedContext.getText(name: string): SharedText // for longer editable text
EmbedContext.role: 'presenter' | 'participant'
EmbedContext.onSessionMode(cb): void           // follow | free
```

Board-level state (embed positions on the canvas) lives in separate Yjs keys (`board.embeds` array), managed by the shell — not by course HTML.

## Rejected alternatives

- **Raw Yjs in iframes**: couples every course to CRDT APIs; breaks static HTML goal.
- **Web Component-only bridge**: awkward in SSR frameworks; SDK + optional WC later if needed.
- **URL-only sync (no shared state)**: too weak for quizzes and CSS battle later.
