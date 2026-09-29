import type { VendorDto } from '@/api/types'

/** 畫面使用的產品商資料。 */
export interface Vendor {
  /** 送出申請時放進 vendors 的代碼，畫面上不顯示。 */
  code: string
  /** 後端提供的顯示名稱，可能同時包含中英文。 */
  name: string
  /** 是否提供測試環境；true 在「正式与测试环境」，false 在「仅正式环境」。 */
  demo: boolean
  /** 原廠支援的幣別（只保留非空字串）。 */
  currencies: string[]
}

function supportedCurrencies(vendor: VendorDto): string[] {
  return Object.values(vendor.currency)
    .map((entry) => (typeof entry === 'object' && entry !== null ? entry.vendor : undefined))
    .filter((code): code is string => typeof code === 'string' && code !== '')
}

/**
 * 後端回傳所有產品商，前端只保留可以申請的：
 * 上線中、支援 2.0、至少有一個原廠支援幣別。其餘完全不出現在選單。
 */
export function toSelectableVendors(dtos: VendorDto[]): Vendor[] {
  return dtos.flatMap((dto) => {
    if (dto.status !== 'online' || dto.support.v2 !== true) return []
    const currencies = supportedCurrencies(dto)
    if (currencies.length === 0) return []
    return [{ code: dto.code, name: dto.name, demo: dto.demo, currencies }]
  })
}
