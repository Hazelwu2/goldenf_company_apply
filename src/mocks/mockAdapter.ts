/*
  Mock API Adapter 模組
  一句話形容：模擬後端 API 回應，取代真正的網路請求。

  🔷 此檔案核心任務
  1. 提供 Axios Adapter 攔截請求，完全不發出實際網路封包
  2. 依 HTTP Method + API URL 對應 Mock資料，回應格式完全符合後端 API Response 格式
  3. 模擬建立申請表單的各種情境：：成功、驗證失敗、業務邏輯錯誤、逾時 (Timeout)、網路中斷 (Network Error)

  🔷 使用方式
  - 在 client.ts 初始化 createHttpClient() 時傳入 `adapter: mockAdapter` 即可
*/

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
  const records = sentRecords(config)
  return success({
    reference_no: nextReferenceNo(now),
    created_at: now.getTime(),
    records: records.map((record, index) => ({
      _id: `mock${now.getTime().toString(16)}${index}`,
      company_level: record.company_level,
      type: record.type,
      code: record.code,
      status: 'pending',
    })),
  })
}

/**
 * 建立申請的 mock 情境，預設 success。開發／預覽時切換方式（二擇一，setter 優先）：
 * - 瀏覽器 console：`localStorage.setItem('goldenf-mock-create-scenario', 'validation')`，
 *   改回成功用 `localStorage.removeItem('goldenf-mock-create-scenario')`；每次送出時讀取，不用重新整理。
 * - 程式／測試：`setMockCreateScenario('timeout')`，傳 null 取消覆寫。
 * 可用值：success、validation（角色分組的驗證失敗，含 vendors、parent_code、未知欄位）、
 * business（status 0 但沒有 errors）、timeout（逾時）、network（連不到後端）。
 */
export type MockCreateScenario = 'success' | 'validation' | 'business' | 'timeout' | 'network'

const SCENARIO_STORAGE_KEY = 'goldenf-mock-create-scenario'
const SCENARIOS: MockCreateScenario[] = ['success', 'validation', 'business', 'timeout', 'network']
let scenarioOverride: MockCreateScenario | null = null

export function setMockCreateScenario(scenario: MockCreateScenario | null) {
  scenarioOverride = scenario
}

function currentCreateScenario(): MockCreateScenario {
  if (scenarioOverride) return scenarioOverride
  try {
    const stored = typeof window === 'undefined' ? null : window.localStorage.getItem(SCENARIO_STORAGE_KEY)
    return SCENARIOS.find((scenario) => scenario === stored) ?? 'success'
  } catch {
    return 'success'
  }
}

type SentRecord = Record<string, unknown>

function sentRecords(config: InternalAxiosRequestConfig): SentRecord[] {
  const sent = parseBody(config).records
  return Array.isArray(sent) ? (sent as SentRecord[]) : []
}

/** 依送出的角色產生驗證失敗；格式與後端確認的角色分組格式相同。 */
function createValidationFailure(config: InternalAxiosRequestConfig) {
  const errors: Record<string, unknown[]> = {}
  for (const record of sentRecords(config)) {
    const code = String(record.code ?? '')
    if (record.company_level === 'A') {
      errors.A = [
        {
          code,
          field: 'vendors',
          message: '產品商「JILI」不支援幣別 CNY。',
          message_en: 'Vendor "JILI" does not support CNY.',
        },
        {
          code,
          field: 'admin_account',
          message: '帳號需為 6～10 個小寫英數字元。',
          message_en: 'Account must be 6–10 lowercase alphanumeric characters.',
        },
        {
          code,
          field: 'business_license',
          message: '（mock 未知欄位）營業執照未提供。',
          message_en: '(Mock unknown field) Business license is missing.',
        },
      ]
    } else if (record.company_level === 'MA') {
      errors.MA = [
        {
          code,
          field: 'bo_whitelist',
          message: '無法辨識的 IP 格式，請確認每一筆皆為合法 IP 格式。',
          message_en: 'One or more entries are not valid IP or CIDR addresses.',
        },
        {
          code,
          field: 'parent_code',
          message: '上層代碼與申請組合不符。',
          message_en: 'The parent code does not match the application combination.',
        },
      ]
    } else if (record.company_level === 'SMA') {
      errors.SMA = [
        {
          code,
          field: 'code',
          message: '代碼重複，已被其他總代理使用。',
          message_en: 'This code is already used by another super agent.',
        },
      ]
    }
  }
  // 只建立 A 時沒有 MA，改由 A 帶出「沒有可編輯欄位」的 parent_code 錯誤
  if (errors.A && !errors.MA) {
    errors.A.push({
      code: (errors.A[0] as { code: string }).code,
      field: 'parent_code',
      message: '上層代碼不存在。',
      message_en: 'The parent code does not exist.',
    })
  }
  return { body: { status: 0, message: 'apply validation failed.', data: { errors } } }
}

/** 逾時或網路中斷：沒有 response，與 axios 內建 adapter 丟出的錯誤一致。 */
function noResponseError(config: InternalAxiosRequestConfig, code: string, message: string) {
  return new AxiosError(message, code, config, {})
}

/** 以「METHOD 路徑」對應假回應；回應格式與後端完全相同（含外層 envelope）。 */
const routes: Record<string, MockHandler> = {
  // 'POST /api/v1/company_apply/exchange/list': () => success({ list: MOCK_CURRENCIES }),
  'POST /api/v1/company_apply/exchange/list': () =>
    ({ body: { status: 0, message: '測試錯誤', data: {} } }),
  'GET /api/v1/company_apply/vendor/list': () =>
    success({ totalCount: MOCK_VENDORS.length, currentPage: 0, perPage: 0, list: MOCK_VENDORS }),
  'POST /api/v1/company_apply/create': async (config) => {
    // 稍微延遲，讓開發時看得到送出中的按鈕狀態
    await wait(400)
    switch (currentCreateScenario()) {
      case 'validation':
        return createValidationFailure(config)
      case 'business':
        return { body: { status: 0, message: '系統忙碌中，請稍後再試。', data: {} } }
      case 'timeout':
        throw noResponseError(config, AxiosError.ECONNABORTED, 'timeout of 10000ms exceeded')
      case 'network':
        throw noResponseError(config, AxiosError.ERR_NETWORK, 'Network Error')
      default:
        return createSuccess(config)
    }
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
