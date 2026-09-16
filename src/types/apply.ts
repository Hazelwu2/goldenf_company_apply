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
  /** 客户可自行填写的额外需求说明，选填。 */
  remark: string
}

export interface AgentFormState {
  code: string
  name: string
  adminAccount: string
  boWhitelist: string[]
  emails: string[]
  sameAsA: boolean
  /** 客户可自行填写的额外需求说明，选填。 */
  remark: string
}

export interface ApplyStepMeta {
  key: string
  label: string
  labelEn: string
  status: 'done' | 'current' | 'upcoming' | 'locked'
}
