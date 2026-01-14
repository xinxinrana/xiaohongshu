import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
      host: '0.0.0.0',
      port: 8001,
      allowedHosts: [
        'localhost',
        '.app.aitocoder.com', // 允许所有aitocoder.com子域名
      ],
      cors: true, // 启用CORS
      hmr: {
        host: 'localhost',
        clientPort: 8001
      },
      proxy: {
          '/api': {
              target: 'http://localhost:8099',
              changeOrigin: true
          }
      }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})

