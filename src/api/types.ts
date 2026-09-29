/** 後端 API 回傳的資料型別，欄位名稱與後端一致。 */

export interface CurrencyDto {
  code: string
  name: string
  memo: string
}

export interface CurrencyListData {
  list: CurrencyDto[]
}

export interface VendorCurrencyDto {
  /** 原廠支援的幣別；空字串代表不支援。 */
  vendor: string
  rate: string
  gf_support: boolean
  decimal: string
}

export interface VendorDto {
  code: string
  name: string
  /** 只有 `online` 的產品商可以申請。 */
  status: string
  /** 是否提供測試環境（可試玩）。 */
  demo: boolean
  support: { v2?: boolean; v3?: boolean }
  /** 原廠支援幣別，key 為幣別代碼，例如 `{ VND: { vendor: 'VND', ... } }`。 */
  currency: Record<string, VendorCurrencyDto>
}

export interface VendorListData {
  totalCount: number
  currentPage: number
  perPage: number
  list: VendorDto[]
}
