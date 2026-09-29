export type ApiMode = 'mock' | 'live'

/**
 * 決定 API 要走 mock 還是正式後端。
 * 開發環境沒設定時預設用 mock；正式建置一定要明確設定，避免上線後在沒人發現的情況下改用假資料、顯示假的成功畫面。
 */
export function resolveApiMode(
  value: string | undefined,
  options: { production: boolean },
): ApiMode {
  if (value === 'mock' || value === 'live') return value
  if (!value && !options.production) return 'mock'
  throw new Error(
    `VITE_API_MODE must be "mock" or "live"${options.production ? ' for production builds' : ''}; received ${JSON.stringify(value ?? '')}`,
  )
}
