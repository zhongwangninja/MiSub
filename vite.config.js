import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // 配置代理，以便在本地开发时能访问后端API
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787', // Wrangler 本地服务的默认地址
        changeOrigin: true,
      },
      '/sub': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      }
    }
  }
})