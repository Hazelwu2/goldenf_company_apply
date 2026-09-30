import type { LoadStatus } from '@/stores/referenceDataStore'
import type { AgentFormState, CompanyLevel, OperatorFormState } from '@/types/apply'
import { getFirstInvalidAgentField, getFirstInvalidOperatorField } from './invalidFieldNavigation'
import { splitSelectedVendors, type Vendor } from './vendors'

export interface PreSubmitInput {
  levels: CompanyLevel[]
  operator: OperatorFormState
  agentMA: AgentFormState
  agentSMA: AgentFormState
  currencyStatus: LoadStatus
  currencyCodes: string[]
  vendorStatus: LoadStatus
  vendors: Vendor[]
}

export interface PreSubmitProblem {
  path: string
  anchorId: string
}

const OPERATOR_PATH = '/apply/operator'

function findOperatorProblem(input: PreSubmitInput): PreSubmitProblem | null {
  const { operator } = input
  const currencyUsable =
    input.currencyStatus === 'success' &&
    operator.currency !== null &&
    input.currencyCodes.includes(operator.currency)
  if (!currencyUsable) return { path: OPERATOR_PATH, anchorId: 'field-operator-currency' }

  const vendorsUsable =
    input.vendorStatus === 'success' &&
    input.vendors.length > 0 &&
    splitSelectedVendors(operator.vendorCodes, input.vendors, operator.currency ?? '').invalid
      .length === 0
  if (!vendorsUsable) return { path: OPERATOR_PATH, anchorId: 'field-operator-vendor' }

  const target = getFirstInvalidOperatorField(operator)
  return target ? { path: OPERATOR_PATH, anchorId: target.id } : null
}

function findAgentProblem(form: AgentFormState, level: 'MA' | 'SMA'): PreSubmitProblem | null {
  const target = getFirstInvalidAgentField(form, level)
  return target ? { path: `/apply/agent/${level.toLowerCase()}`, anchorId: target.id } : null
}

/**
 * 送出前再檢查一次組合內每個角色（依步驟順序 A → MA → SMA），回傳第一個有問題的頁面與欄位；
 * 都沒問題時回傳 null。避免直接開確認頁網址，或回去改壞資料後仍能送出。
 */
export function findPreSubmitProblem(input: PreSubmitInput): PreSubmitProblem | null {
  if (input.levels.includes('A')) {
    const problem = findOperatorProblem(input)
    if (problem) return problem
  }
  if (input.levels.includes('MA')) {
    const problem = findAgentProblem(input.agentMA, 'MA')
    if (problem) return problem
  }
  if (input.levels.includes('SMA')) {
    const problem = findAgentProblem(input.agentSMA, 'SMA')
    if (problem) return problem
  }
  return null
}
