# Framework v1 — Implementation Spec

Derived from grill-with-docs decisions. Scope: collab framework + one example course + board embed layout. Mini-games deferred to v2.

## v1 deliverables

| # | Deliverable | Package / path |
|---|-------------|----------------|
| 1 | Persistent rooms (y-leveldb) | `server/` |
| 2 | Session modes (`follow` \| `free`) | `packages/yjs-room/` |
| 3 | Embed SDK (postMessage bridge) | `packages/embed-sdk/` |
| 4 | Embed host + board layout sync | `client/` |
| 5 | Example course page | `courses/hello/` |
| 6 | Demo board isolated | `client/demo/` |

## Target monorepo layout

```
browser-basics/
├── packages/
│   ├── yjs-room/       # existing: extend roomMeta, session mode
│   └── embed-sdk/      # new: child + parent protocol, ESM build
├── courses/            # static HTML lessons (same-origin)
│   └── hello/
│       └── index.html
├── client/
│   ├── src/            # shell: lobby, board, embed host, presenter
│   └── demo/           # moved: sticky notes, drawing, chat
├── server/             # WS + y-leveldb persistence
└── docs/
```

## Yjs document shape (v1)

| Key | Type | Owner | Purpose |
|-----|------|-------|---------|
| `roomMeta` | `Y.Map` | yjs-room | `presenterName`, `sessionMode`, `presenterViewport`, `globalFollow` (derived from sessionMode) |
| `followMap` | `Y.Map<boolean>` | yjs-room | per-participant follow override |
| `board.embeds` | `Y.Array` | client shell | `{ id, url, x, y, width, height, zIndex }` |
| `embeds.<id>.shared.*` | `Y.Map` / `Y.Text` | embed-sdk proxy | per-embed collaborative state |

Legacy keys (`notes`, `strokes`, `messages`) remain for demo mode only.

## Server changes

1. Add `y-leveldb` + `level` dependencies.
2. On `setupWSConnection`, bind persistence dir `./data/yjs` (env `YJS_PERSISTENCE_DIR`).
3. Document Render persistent disk requirement for production.

## yjs-room changes

1. Add `sessionMode: 'follow' | 'free'` to `RoomMeta` (read/write in `room-meta.ts`).
2. `setSessionMode(mode)` presenter-only API on `CollabRoom`.
3. When `sessionMode === 'follow'`, set `globalFollow` true; when `'free'`, false.
4. Deprecation path: keep `adminName` / `adminViewport` keys in Yjs for now; types use `presenterName` aliases.

## embed-sdk package

1. **Child** (`createEmbedClient`): handshake, RPC to parent, `SharedMap` / `SharedText` with observe.
2. **Parent** (`createEmbedHost`): attach to iframe ref, wire RPC → Yjs sub-maps.
3. Build: ESM + IIFE bundle copied to `client/public/embed-sdk.js` for no-build courses.
4. **React** subpath: `useEmbedMap`, `useSessionMode` (optional for v1, nice for example).

## Client shell changes

1. **Board**: pan/zoom canvas (reuse `useBoardViewport`).
2. **EmbedHost**: iframe per `board.embeds` entry; loads `courses/...` URLs.
3. **Presenter**: add/remove embeds, drag resize, toggle session mode.
4. **Participant**: view embeds; interact when `free`, follow viewport when `follow`.
5. Move current `StickyNotes`, `DrawingCanvas`, `ChatPanel`, `LiveCursors` → `client/demo/` behind route or `?demo=1`.

## courses/

1. Vite `publicDir` or alias serves `courses/` at `/courses/`.
2. `courses/hello/index.html`: minimal page using embed-sdk — e.g. shared counter or highlighted paragraph to prove sync.
3. No Yjs imports in course files.

## Migration order

1. Server persistence (rooms survive restart).
2. `sessionMode` in yjs-room + presenter toggle UI.
3. `embed-sdk` package + handshake protocol.
4. Board `embeds` array + EmbedHost in client.
5. `courses/hello` example.
6. Demo isolation (move legacy components).

## Out of scope (v1)

- Classroom quiz, CSS battle, or any mini-game
- Cross-origin embeds
- User authentication beyond presenter secret
- npm publish of packages
- Renaming Yjs `admin*` keys (documented in CONTEXT.md only)

## v2 preview

- Quiz embed using `SharedMap` for answers + presenter reveal
- CSS battle embed with `SharedText` for code + live preview
- Course catalog / presenter picker UI
