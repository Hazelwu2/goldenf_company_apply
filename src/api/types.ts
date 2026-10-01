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

/** Create API 的申請組合字串。 */
export type CombinationDto = 'A' | 'MA' | 'MA + A' | 'SMA + MA + A'

interface CreateApplicationRecordBase {
  code: string
  /** 空字串時後端以 code 當名稱。 */
  name: string
  parent_code: string
  admin_account: string
  bo_whitelist: string[]
  emails: string[]
  merchant_memo: string
  /** 內部備註，客戶表單固定送空陣列。 */
  memo: []
}

export interface CreateOperatorRecordDto extends CreateApplicationRecordBase {
  company_level: 'A'
  type: 'operator'
  currency: string
  vendors: string[]
  api_whitelist: string[]
  operating_markets: string[]
  /** 網站尚在開發中時，website、test_account、test_password 皆為空字串。 */
  website: string
  test_account: string
  test_password: string
  chat_software: string
  chat_group: string
}

export interface CreateAgentRecordDto extends CreateApplicationRecordBase {
  company_level: 'MA' | 'SMA'
  type: 'company'
}

export type CreateApplicationRecordDto = CreateOperatorRecordDto | CreateAgentRecordDto

export interface CreateApplicationBody {
  combination: CombinationDto
  /** 客戶建立申請時固定為 pending。 */
  status: 'pending'
  records: CreateApplicationRecordDto[]
}

export interface CreatedRecordDto {
  _id: string
  company_level: string
  type: string
  code: string
  status: string
}

export interface CreateApplicationData {
  /** 開線編號，例如 APY-20260911-0001。 */
  reference_no: string
  /** 建立時間，Unix 秒。 */
  created_at: number
  records: CreatedRecordDto[]
}

export type ApplyRoleKey = 'A' | 'MA' | 'SMA'

/** Create API 驗證失敗時的單筆錯誤。 */
export interface CreateApplicationErrorDto {
  /** 使用者填寫的角色代碼。 */
  code: string
  /** 驗證失敗的 request key，例如 `vendors`、`admin_account`。 */
  field: string
  message: string
  message_en: string
}

/** 以角色分組的驗證錯誤；只有出錯的角色會出現。 */
export type CreateApplicationErrors = Partial<Record<ApplyRoleKey, CreateApplicationErrorDto[]>>
