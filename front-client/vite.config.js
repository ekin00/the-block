import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import frozenDemo from './demo-hosting.js'

export default defineConfig({
  plugins: [react(), frozenDemo()],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/  //include both .js and .jsx
  },
  optimizeDeps: {
    include: ['@emotion/styled'],
    esbuild: {
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx'
      }
    }
  }
})