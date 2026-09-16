import type { ChatSoftware } from '@/utils/validators'

/** 四种允许的申请组合（USER 仅能选这四种） */
export type ComboKey = 'A' | 'MA' | 'MA_A' | 'SMA_MA_A'

export type CompanyLevel = 'A' | 'MA' | 'SMA'

/** 每个组合实际包含哪些 level；阵列排列供表单流程建立步骤使用。 */
export const COMBO_LEVELS: Record<ComboKey, CompanyLevel[]> = {
  A: ['A'],
  MA: ['MA'],
  MA_A: ['A', 'MA'],
  SMA_MA_A: ['A', 'MA', 'SMA'],
}

export interface ComboOption {
  key: ComboKey
  /** 卡片标题（中） */
  title: string
  /** 卡片标题（英） */
  titleEn: string
  levels: CompanyLevel[]
  /** 卡片说明（中） */
  description: string
  /** 卡片说明（英） */
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
  /** 通讯软体，仅 A 使用；送出值为 'Teams' 或 'telegram'。 */
  chatSoftware: ChatSoftware | null
  /** 通讯群组名称，仅 A 使用。 */
  chatGroup: string
  /** 客户可自行填写的额外需求说明，选填。 */
  remark: string
}

/** 「与 A 相同」可分别套用的栏位。 */
export type SameAsAField = 'whitelist' | 'emails'

export interface AgentFormState {
  code: string
  name: string
  adminAccount: string
  boWhitelist: string[]
  emails: string[]
  /** 后台白名单沿用 A，勾选後同步并锁定。 */
  sameWhitelistAsA: boolean
  /** 联络 Email 沿用 A，勾选後同步并锁定。 */
  sameEmailsAsA: boolean
  /** 客户可自行填写的额外需求说明，选填。 */
  remark: string
}

export interface ApplyStepMeta {
  key: string
  label: string
  labelEn: string
  status: 'done' | 'current' | 'upcoming' | 'locked'
}
