import type {
  CombinationDto,
  CreateAgentRecordDto,
  CreateApplicationBody,
  CreateApplicationRecordDto,
  CreateOperatorRecordDto,
} from '@/api/types'
import type { AgentFormState, ComboKey, OperatorFormState } from '@/types/apply'
import { COMBO_LEVELS } from '@/types/apply'

/** 沒有上層代理時一律掛在系統預設的根代理底下（規格 §1.5）；內部代號，畫面不顯示。 */
export const ROOT_PARENT_CODE = 'GF_MA'

const COMBINATION: Record<ComboKey, CombinationDto> = {
  A: 'A',
  MA: 'MA',
  MA_A: 'MA + A',
  SMA_MA_A: 'SMA + MA + A',
}

export interface ApplicationPayloadInput {
  combo: ComboKey
  operator: OperatorFormState
  agentMA: AgentFormState
  agentSMA: AgentFormState
}

/** 依規格 §1.5 推導每個角色的 parent_code；代碼一律取 trim 後的值，與送出的 code 一致。 */
function parentCodes(input: ApplicationPayloadInput) {
  const ma = input.agentMA.code.trim()
  const sma = input.agentSMA.code.trim()
  switch (input.combo) {
    case 'MA_A':
      return { A: ma, MA: ROOT_PARENT_CODE, SMA: ROOT_PARENT_CODE }
    case 'SMA_MA_A':
      return { A: ma, MA: sma, SMA: ROOT_PARENT_CODE }
    default:
      return { A: ROOT_PARENT_CODE, MA: ROOT_PARENT_CODE, SMA: ROOT_PARENT_CODE }
  }
}

function operatorRecord(form: OperatorFormState, parentCode: string): CreateOperatorRecordDto {
  // 「尚在開發中」時站台三欄一律送空字串，後端以此判定網站開發中
  const isLive = form.websiteStatus === 'live'
  return {
    company_level: 'A',
    type: 'operator',
    code: form.code.trim(),
    name: form.name.trim(),
    parent_code: parentCode,
    admin_account: form.adminAccount.trim(),
    bo_whitelist: [...form.boWhitelist],
    api_whitelist: [...form.apiWhitelist],
    emails: [...form.emails],
    currency: form.currency ?? '',
    vendors: [...form.vendorCodes],
    operating_markets: [...form.operatingMarkets],
    website: isLive ? form.website.trim() : '',
    test_account: isLive ? form.testAccount.trim() : '',
    // 密碼原樣送出，前後空白也可能是密碼的一部分
    test_password: isLive ? form.testPassword : '',
    chat_software: form.chatSoftware ?? '',
    chat_group: form.chatGroup.trim(),
    merchant_memo: form.remark,
    memo: [],
  }
}

function agentRecord(
  level: 'MA' | 'SMA',
  form: AgentFormState,
  operator: OperatorFormState | null,
  parentCode: string,
): CreateAgentRecordDto {
  // 「與 A 相同」直接取 A 的值，不依賴 store 的同步 watcher 是否已經跑過
  const boWhitelist = operator && form.sameWhitelistAsA ? operator.boWhitelist : form.boWhitelist
  const emails = operator && form.sameEmailsAsA ? operator.emails : form.emails
  return {
    company_level: level,
    type: 'company',
    code: form.code.trim(),
    name: form.name.trim(),
    parent_code: parentCode,
    admin_account: form.adminAccount.trim(),
    bo_whitelist: [...boWhitelist],
    emails: [...emails],
    merchant_memo: form.remark,
    memo: [],
  }
}

/**
 * 把目前的表單組成 Create API 的 request body。
 * records 只包含組合內的角色，順序為 A → MA → SMA；前端畫面狀態
 * （websiteStatus、sameWhitelistAsA、sameEmailsAsA）不送後端。
 */
export function buildCreateApplicationBody(input: ApplicationPayloadInput): CreateApplicationBody {
  const levels = COMBO_LEVELS[input.combo]
  const parents = parentCodes(input)
  const operator = levels.includes('A') ? input.operator : null

  const records: CreateApplicationRecordDto[] = levels.map((level) => {
    if (level === 'A') return operatorRecord(input.operator, parents.A)
    const form = level === 'MA' ? input.agentMA : input.agentSMA
    return agentRecord(level, form, operator, parents[level])
  })

  return { combination: COMBINATION[input.combo], status: 'pending', records }
}
