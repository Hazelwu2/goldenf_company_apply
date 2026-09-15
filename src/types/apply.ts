/** 四種允許的申請組合（USER 僅能選這四種） */
export type ComboKey = 'A' | 'MA' | 'MA_A' | 'SMA_MA_A'

export type CompanyLevel = 'A' | 'MA' | 'SMA'

/** 每個組合實際包含哪些 level；陣列排列供表單流程建立步驟使用。 */
export const COMBO_LEVELS: Record<ComboKey, CompanyLevel[]> = {
  A: ['A'],
  MA: ['MA'],
  MA_A: ['A', 'MA'],
  SMA_MA_A: ['A', 'MA', 'SMA'],
}

export interface ComboOption {
  key: ComboKey
  /** 卡片標題（中） */
  title: string
  /** 卡片標題（英） */
  titleEn: string
  levels: CompanyLevel[]
  /** 卡片說明（中） */
  description: string
  /** 卡片說明（英） */
  descriptionEn: string
}

export type WebsiteStatus = 'live' | 'in_progress'

export interface OperatorFormState {
  currency: string | null
  vendorCodes: string[]
  code: string
  name: string
  adminAccount: string
  boWhitelist: string
  apiWhitelist: string
  email: string
  operatingMarkets: string[]
  websiteStatus: WebsiteStatus | null
  website: string
  testAccount: string
  testPassword: string
  /** 客戶可自行填寫的額外需求說明，選填。 */
  remark: string
}

export interface AgentFormState {
  code: string
  name: string
  adminAccount: string
  boWhitelist: string
  email: string
  sameAsA: boolean
  /** 客戶可自行填寫的額外需求說明，選填。 */
  remark: string
}

export interface ApplyStepMeta {
  key: string
  label: string
  labelEn: string
  status: 'done' | 'current' | 'upcoming' | 'locked'
}
