import type { HttpClient } from './http'
import type { CurrencyDto, CurrencyListData, VendorDto } from './types'

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

/**
 * 只檢查畫面會用到的欄位型別；support.v2、currency[].vendor 的細節交給產品商篩選規則判斷，
 * 單一產品商資料怪怪的只會讓它不出現在選單，不會讓整份清單失敗。
 */
function isVendorDto(item: unknown): item is VendorDto {
  return (
    isRecord(item) &&
    typeof item.code === 'string' &&
    typeof item.name === 'string' &&
    typeof item.status === 'string' &&
    typeof item.demo === 'boolean' &&
    isRecord(item.support) &&
    isRecord(item.currency) &&
    !Array.isArray(item.currency)
  )
}

function parseVendorList(data: unknown): { list: VendorDto[] } | null {
  if (!isRecord(data) || !Array.isArray(data.list)) return null
  const list = data.list as unknown[]
  return list.every(isVendorDto) ? { list } : null
}

/** 客戶表單會用到的 API；網址只在這裡定義。 */
export function createApplyApi(http: HttpClient) {
  return {
    async listCurrencies(): Promise<CurrencyDto[]> {
      const data = await http.request(
        { method: 'post', url: '/api/v1/company_apply/exchange/list', data: {} },
        parseCurrencyList,
      )
      return data.list
    },

    async listVendors(): Promise<VendorDto[]> {
      const data = await http.request(
        { method: 'get', url: '/api/v1/company_apply/vendor/list' },
        parseVendorList,
      )
      return data.list
    },
  }
}

export type ApplyApi = ReturnType<typeof createApplyApi>
