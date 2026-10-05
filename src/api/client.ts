/*
  client.ts
  一句話形容：現在是 mock 還是 live？決定最後一步用誰送。

  🔷 此檔案核心任務
  1. 提供全域統一使用的 `applyApi` 實例。
  2. 根據環境變數自動切換「請求實際後端 API」或「使用 Mock 假資料」。

  🔷 匯出的內容
  - applyApi：包含取得幣別、產品商清單與送出表單的 API 實例
*/

import { createApplyApi } from './applyApi'
import { resolveApiMode } from './apiMode'
import { createHttpClient } from './http'
import { mockAdapter } from '@/mocks/mockAdapter'

const apiMode = resolveApiMode(import.meta.env.VITE_API_MODE, {
  production: import.meta.env.PROD,
})

if (apiMode === 'mock' && import.meta.env.DEV) {
  console.info('[api] 目前使用 mock 資料（VITE_API_MODE=mock）')
}

/** 畫面使用的 API；依環境變數決定打正式後端或使用 mock。 */
export const applyApi = createApplyApi(
  createHttpClient({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
    // mock：換成假後端，不發網路請求；undefined：用 axios 預設，真的打後端
    adapter: apiMode === 'mock' ? mockAdapter : undefined,
  }),
)
