import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const webRoot = path.resolve(__dirname, './apps/web')
const webSrcRoot = path.resolve(webRoot, './src')

export default defineConfig({
  root: webRoot,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': webSrcRoot,
    },
  },
  build: {
    outDir: path.resolve(__dirname, './dist'),
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(webSrcRoot, './shared/config/test/index.ts')],
  },
})
