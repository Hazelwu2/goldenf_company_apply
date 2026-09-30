import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { MOCK_CURRENCIES } from './currencies'
import { MOCK_VENDORS } from './vendors'

type MockResult = { status?: number; body: unknown }
type MockHandler = (config: InternalAxiosRequestConfig) => MockResult | Promise<MockResult>

function success(data: unknown) {
  return { body: { status: 1, message: '成功', data } }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseBody(config: InternalAxiosRequestConfig): Record<string, unknown> {
  if (typeof config.data !== 'string') return (config.data ?? {}) as Record<string, unknown>
  try {
    return JSON.parse(config.data) as Record<string, unknown>
  } catch {
    return {}
  }
}

/** 開線編號流水號：同一天（台北時間）遞增，換日重新從 1 開始，模擬後端 APY-yyyymmdd-流水號。 */
let serialDate = ''
let serial = 0

function nextReferenceNo(now: Date) {
  const taipeiDate = new Date(now.getTime() + 8 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
    .replaceAll('-', '')
  if (taipeiDate !== serialDate) {
    serialDate = taipeiDate
    serial = 0
  }
  serial += 1
  return `APY-${taipeiDate}-${String(serial).padStart(4, '0')}`
}

/** 預設回傳建立成功，records 依送出的角色產生。 */
function createSuccess(config: InternalAxiosRequestConfig) {
  const now = new Date()
  const sent = parseBody(config).records
  const records = Array.isArray(sent) ? (sent as Array<Record<string, unknown>>) : []
  return success({
    reference_no: nextReferenceNo(now),
    created_at: Math.floor(now.getTime() / 1000),
    records: records.map((record, index) => ({
      _id: `mock${now.getTime().toString(16)}${index}`,
      company_level: record.company_level,
      type: record.type,
      code: record.code,
      status: 'pending',
    })),
  })
}

/** 以「METHOD 路徑」對應假回應；回應格式與後端完全相同（含外層 envelope）。 */
const routes: Record<string, MockHandler> = {
  'POST /api/v1/company_apply/exchange/list': () => success({ list: MOCK_CURRENCIES }),
  'GET /api/v1/company_apply/vendor/list': () =>
    success({ totalCount: MOCK_VENDORS.length, currentPage: 0, perPage: 0, list: MOCK_VENDORS }),
  'POST /api/v1/company_apply/create': async (config) => {
    // 稍微延遲，讓開發時看得到送出中的按鈕狀態
    await wait(400)
    return createSuccess(config)
  },
}

function routeKey(config: InternalAxiosRequestConfig) {
  const path = (config.url ?? '').split('?')[0]
  return `${(config.method ?? 'get').toUpperCase()} ${path}`
}

/**
 * 掛在正式使用的 axios 實例上，取代真正的網路請求。
 * 非 2xx 一樣會 reject，行為與 axios 內建 adapter 一致，未知路由回 404。
 */
export const mockAdapter: AxiosAdapter = async (config) => {
  const handler = routes[routeKey(config)]
  const { status = 200, body } = handler
    ? await handler(config)
    : { status: 404, body: `No mock for ${routeKey(config)}` }

  const response: AxiosResponse = {
    data: body,
    status,
    statusText: String(status),
    headers: {},
    config,
  }

  const validateStatus = config.validateStatus ?? ((code: number) => code >= 200 && code < 300)
  if (validateStatus(status)) return response
  throw new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_RESPONSE,
    config,
    null,
    response,
  )
}
