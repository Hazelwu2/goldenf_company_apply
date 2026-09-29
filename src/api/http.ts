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
        throw toApiError(error)
      }
      const body: unknown = response.data
      if (!isEnvelope(body)) {
        throw new ApiError('contract', 'Response is not an API envelope', {
          httpStatus: response.status,
        })
      }
      if (!isSuccess(body)) {
        throw new ApiError('business', body.message, {
          httpStatus: response.status,
          data: body.data,
        })
      }
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
