import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const pagesBase = process.env.GITHUB_PAGES === 'true' ? '/browser-basics/' : '/';

export default defineConfig({
  plugins: [react()],
  base: pagesBase,
  resolve: {
    alias: {
      '@browser-basics/yjs-room': path.resolve(rootDir, '../packages/yjs-room/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
