import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolveApiMode } from './src/api/apiMode'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  // 正式建置沒設定 VITE_API_MODE 時直接讓建置失敗，不會上線後才發現在用假資料。
  if (command === 'build') {
    resolveApiMode(env.VITE_API_MODE, { production: mode === 'production' })
  }

  const proxyTarget = env.VITE_API_PROXY_TARGET

  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // 開發時把 API 轉給後端，避免 CORS；/vendor/list 沒有 /api 前綴，要另外轉。
      proxy: proxyTarget
        ? {
            '/api': { target: proxyTarget, changeOrigin: true },
            '/vendor': { target: proxyTarget, changeOrigin: true },
          }
        : undefined,
    },
  }
})
