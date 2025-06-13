import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 在这里定义所有路径别名
    alias: {
      '@': path.resolve(__dirname, './src'),
      '$api': path.resolve(__dirname, './src/lib/api.js'),
      '$stores': path.resolve(__dirname, './src/lib/stores.js'),
      '$utils': path.resolve(__dirname, './src/lib/utils.js'),
      '$components': path.resolve(__dirname, './src/lib/components'),
      '$icons': path.resolve(__dirname, './src/lib/icons'),
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
      },
      // 如果你的 mytoken 不是 'auto'，也需要为它添加代理
      // 例如，如果 mytoken 是 'mysecrettoken'
      // '/mysecrettoken': {
      //   target: 'http://127.0.0.1:8787',
      //   changeOrigin: true,
      // }
    }
  }
})