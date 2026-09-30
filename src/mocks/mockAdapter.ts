import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { MOCK_CURRENCIES } from './currencies'
import { MOCK_VENDORS } from './vendors'

type MockHandler = (config: InternalAxiosRequestConfig) => { status?: number; body: unknown }

function success(data: unknown) {
  return { body: { status: 1, message: '成功', data } }
}

/** 以「METHOD 路徑」對應假回應；回應格式與後端完全相同（含外層 envelope）。 */
const routes: Record<string, MockHandler> = {
  'POST /api/v1/company_apply/exchange/list': () => success({ list: MOCK_CURRENCIES }),
  'GET /api/v1/company_apply/vendor/list': () =>
    success({ totalCount: MOCK_VENDORS.length, currentPage: 0, perPage: 0, list: MOCK_VENDORS }),
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
    ? handler(config)
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
