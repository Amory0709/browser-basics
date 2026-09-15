import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const pagesBase = process.env.GITHUB_PAGES === 'true' ? '/browser-basics/' : '/';

export default defineConfig({
  plugins: [react()],
  base: pagesBase,
  server: {
    port: 5173,
    host: true,
  },
});
