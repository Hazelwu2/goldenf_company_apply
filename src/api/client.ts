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
    adapter: apiMode === 'mock' ? mockAdapter : undefined,
  }),
)
