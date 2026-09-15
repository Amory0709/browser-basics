import { createReadStream, existsSync, statSync } from 'node:fs';
import path, { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const coursesDir = path.resolve(rootDir, '../courses');
const pagesBase = process.env.GITHUB_PAGES === 'true' ? '/browser-basics/' : '/';

function coursesPlugin(): Plugin {
  const mount = '/courses';

  const serve = (reqUrl: string, res: import('http').ServerResponse, next: () => void) => {
    const rel = decodeURIComponent(reqUrl.slice(mount.length) || '/');
    const filePath = normalize(join(coursesDir, rel));
    if (!filePath.startsWith(coursesDir) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
      next();
      return;
    }
    createReadStream(filePath).pipe(res);
  };

  return {
    name: 'serve-courses',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith(mount)) return next();
        serve(req.url, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith(mount)) return next();
        serve(req.url, res, next);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), coursesPlugin()],
  base: pagesBase,
  resolve: {
    dedupe: ['yjs'],
    alias: {
      '@browser-basics/yjs-room': path.resolve(rootDir, '../packages/yjs-room/src/index.ts'),
      '@browser-basics/embed-sdk': path.resolve(rootDir, '../packages/embed-sdk/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/host-verify': {
        target: 'http://localhost:1234',
        changeOrigin: true,
      },
      '/yjs': {
        target: 'ws://localhost:1234',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yjs/, ''),
      },
    },
  },
  preview: {
    proxy: {
      '/api/host-verify': {
        target: 'http://localhost:1234',
        changeOrigin: true,
      },
      '/yjs': {
        target: 'ws://localhost:1234',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yjs/, ''),
      },
    },
  },
});
