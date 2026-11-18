import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173, strictPort: false },
  preview: { port: 4174, strictPort: false },
  build: { outDir: 'dist', assetsInlineLimit: 0 }
});
