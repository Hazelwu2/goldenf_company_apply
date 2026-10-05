/*
  HTTP 請求用戶端與 API 錯誤處理模組

  🔷 此檔案核心任務
  1. 封裝 Axios 實例：統一設定逾時時間（Timeout）、基底網址（BaseURL）與 Header。
  2. 建立自訂錯誤類別（ApiError）：將各種異常狀況精準分類（業務邏輯錯誤、HTTP 狀態碼異常、逾時、網路連線失敗、API 契約不符合）。
  3. 實作 API 信封格式（Envelope）與資料結構解析（Data Parser）：確保回傳資料符合預期，避免非法資料導致前端頁面崩潰（防禦性程式設計）。

  🔷 核心介面與函式
  - createHttpClient()：建立具備安全解析機制與錯誤分類處理的 HttpClient 實例
  - ApiError：統一的 API 異常物件，提供精準的 kind 狀態類別供前端 UI 做對應處理
  - DataParser<T>：Runtime 型別防衛函式介面，驗證成功回傳解析後的資料，失敗回傳 null
*/

import axios, { type AxiosAdapter, type AxiosRequestConfig } from 'axios'

/**
 * - business：後端正常回應（HTTP 200）但 status 不是 1（例如 0、2），例如表單驗證失敗、格式有誤
 * - http：後端回應非 2xx（目前後端只會回 500），不看 body 內容
 * - no-response：逾時，請求可能已經送到後端，結果不確定
 * - network：連不到後端，沒有收到任何回應
 * - contract：回應格式和約定的不一樣（不是 envelope，或 status 為 1 但 data 結構不對）
 */
export type ApiErrorKind = 'business' | 'http' | 'no-response' | 'network' | 'contract'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly httpStatus?: number
  /** business 時為後端回傳的 data，例如 Create API 的 errors。 */
  readonly data?: unknown

  constructor(
    kind: ApiErrorKind,
    message: string,
    details: { httpStatus?: number; data?: unknown } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.httpStatus = details.httpStatus
    this.data = details.data
  }
}

/** 檢查後端 data 的結構，不符合時回傳 null。 */
export type DataParser<T> = (data: unknown) => T | null

export interface HttpClient {
  request<T>(config: AxiosRequestConfig, parse: DataParser<T>): Promise<T>
}

export interface HttpClientOptions {
  baseURL?: string
  adapter?: AxiosAdapter
}

/** 後端的 status 可能是數字或字串（例如 1、'1'、'2'）。 */
interface Envelope {
  status: number | string
  message: string
  data?: unknown
}

function isEnvelope(body: unknown): body is Envelope {
  if (typeof body !== 'object' || body === null) return false
  const { status, message } = body as Record<string, unknown>
  return (typeof status === 'number' || typeof status === 'string') && typeof message === 'string'
}

/** 只有 status 為 1 才算成功，其他值一律視為錯誤。 */
function isSuccess(envelope: Envelope) {
  return String(envelope.status) === '1'
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error) && error.response) {
    return new ApiError('http', `HTTP ${error.response.status}`, {
      httpStatus: error.response.status,
    })
  }
  if (axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')) {
    return new ApiError('no-response', 'Request timed out')
  }
  return new ApiError('network', 'Network error')
}

export function createHttpClient(options: HttpClientOptions = {}): HttpClient {
  const instance = axios.create({
    baseURL: options.baseURL ?? '',
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
    adapter: options.adapter,
  })

  return {
    async request<T>(config: AxiosRequestConfig, parse: DataParser<T>) {
      let response
      try {
        response = await instance.request(config)
      } catch (error) {
        // 沒拿到正常回應：分成 http、逾時（no-response）、連不到（network）
        throw toApiError(error)
      }
      const body: unknown = response.data
      // 外層不是 { status, message }：格式跟約定不同
      if (!isEnvelope(body)) {
        throw new ApiError('contract', 'Response is not an API envelope', {
          httpStatus: response.status,
        })
      }
      // status 不是 1：後端判定失敗，保留 message 與 data 給畫面顯示
      if (!isSuccess(body)) {
        throw new ApiError('business', body.message, {
          httpStatus: response.status,
          data: body.data,
        })
      }
      // 成功但 data 欄位對不上：一樣當成格式錯誤
      const parsed = parse(body.data)
      if (parsed === null) {
        throw new ApiError('contract', 'Response data does not match the API contract', {
          httpStatus: response.status,
        })
      }
      return parsed
    },
  }
}
