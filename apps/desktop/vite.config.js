// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        settings: resolve(import.meta.dirname, 'settings.html'),
        overlay: resolve(import.meta.dirname, 'overlay.html'),
      },
    },
  },
});