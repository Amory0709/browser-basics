# @browser-basics/embed-sdk

postMessage bridge between course iframes and the collab shell.

- **Child**: `createEmbedClient()` in course HTML (`/embed-sdk.js` IIFE or ESM import)
- **Parent**: `createEmbedHost()` in the client shell
- **React** (optional): `@browser-basics/embed-sdk/react`

See `docs/adr/0004-embed-sdk-bridge.md` for the protocol.
