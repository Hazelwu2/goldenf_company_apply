/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `mock` 或 `live`；正式建置一定要設定。 */
  readonly VITE_API_MODE?: string
  /** 正式後端的 API 位址；沒設定時走同源。 */
  readonly VITE_API_BASE_URL?: string
  /** 開發環境 Vite proxy 轉發的後端位址。 */
  readonly VITE_API_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
