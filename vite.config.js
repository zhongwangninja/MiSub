import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '$api': fileURLToPath(new URL('./src/lib/api.js', import.meta.url)),
      '$stores': fileURLToPath(new URL('./src/lib/stores.js', import.meta.url)),
      '$utils': fileURLToPath(new URL('./src/lib/utils.js', import.meta.url)),
      '$components': fileURLToPath(new URL('./src/lib/components', import.meta.url)),
      '$icons': fileURLToPath(new URL('./src/lib/icons', import.meta.url)),
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/sub': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      }
    }
  }
})