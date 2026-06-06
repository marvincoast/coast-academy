import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function resolveBase(): string {
  const explicit = process.env.VITE_BASE_PATH;
  if (explicit) {
    return explicit.endsWith('/') ? explicit : `${explicit}/`;
  }
  if (process.env.GITHUB_PAGES === 'true') {
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
    if (repo) return `/${repo}/`;
  }
  return '/';
}

export default defineConfig({
  base: resolveBase(),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@coast-academy/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: ['../..'],
    },
    proxy: {
      '/auth/v1': {
        target: 'http://127.0.0.1:54321',
        changeOrigin: true,
      },
      '/rest/v1': {
        target: 'http://127.0.0.1:54321',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
