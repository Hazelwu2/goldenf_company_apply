import type { ChatSoftware } from '@/utils/validators'

/** 四種允許的申請組合（USER 只能選這四種） */
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
  boWhitelist: string[]
  apiWhitelist: string[]
  emails: string[]
  operatingMarkets: string[]
  websiteStatus: WebsiteStatus | null
  website: string
  testAccount: string
  testPassword: string
  /** 通訊軟件，僅 A 使用；送出值為 'teams' 或 'telegram'。 */
  chatSoftware: ChatSoftware | null
  /** 通訊群組名稱，僅 A 使用。 */
  chatGroup: string
  /** 客戶可自行填寫的額外需求說明，選填。 */
  remark: string
}

/** 「與 A 相同」可分別套用的欄位。 */
export type SameAsAField = 'whitelist' | 'emails'

export interface AgentFormState {
  code: string
  name: string
  adminAccount: string
  boWhitelist: string[]
  emails: string[]
  /** 後台白名單沿用 A，勾選後同步上鎖。 */
  sameWhitelistAsA: boolean
  /** 聯絡 Email 沿用 A，勾選後同步並鎖定。 */
  sameEmailsAsA: boolean
  /** 客戶可自行填寫的額外需求說明，選填。 */
  remark: string
}

export interface ApplyStepMeta {
  key: string
  label: string
  labelEn: string
  status: 'done' | 'current' | 'upcoming' | 'locked'
}
