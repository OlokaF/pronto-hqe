import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'assets',
  server: {
    port: 5173,
    open: '/index.html',
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html',
    },
  },
});
