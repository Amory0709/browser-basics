# Rooms persist indefinitely with y-leveldb

Room state is stored server-side and restored whenever anyone rejoins the same room name. Storage uses **y-leveldb** (one LevelDB directory per deployment, Yjs update persistence via the standard `@y/websocket-server` + `y-leveldb` pattern). Expected data volume is small (classroom-scale rooms), so a single-node LevelDB store on the Render disk (or local `./data/rooms` in dev) is sufficient for v1.
