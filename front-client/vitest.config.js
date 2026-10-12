import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Test config for the production app only. The frozen demo snapshot has its
// own runner (node --test demo-hosting.test.js) and is excluded here.
export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic',
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,jsx}'],
    exclude: ['node_modules/**', 'demo-snapshot/**', 'public/**'],
  },
});
