import type { HttpClient } from './http'
import type { CurrencyDto, CurrencyListData } from './types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseCurrencyList(data: unknown): CurrencyListData | null {
  if (!isRecord(data) || !Array.isArray(data.list)) return null
  const list = data.list as unknown[]
  const valid = list.every(
    (item): item is CurrencyDto =>
      isRecord(item) &&
      typeof item.code === 'string' &&
      typeof item.name === 'string' &&
      typeof item.memo === 'string',
  )
  return valid ? { list: list as CurrencyDto[] } : null
}

/** 客戶表單會用到的 API；網址只在這裡定義。 */
export function createApplyApi(http: HttpClient) {
  return {
    async listCurrencies(): Promise<CurrencyDto[]> {
      const data = await http.request(
        { method: 'post', url: '/api/v1/exchange/list', data: {} },
        parseCurrencyList,
      )
      return data.list
    },
  }
}

export type ApplyApi = ReturnType<typeof createApplyApi>
