import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  envDir: fileURLToPath(new URL('./', import.meta.url)),
  base: '/demo/',
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL('../public/demo/', import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
  },
});
