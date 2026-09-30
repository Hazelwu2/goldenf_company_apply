import assert from 'node:assert/strict'
import test from 'node:test'
import type { AgentFormState, CompanyLevel, OperatorFormState } from '../src/types/apply.ts'
import { findPreSubmitProblem, type PreSubmitInput } from '../src/utils/preSubmitCheck.ts'
import type { Vendor } from '../src/utils/vendors.ts'

const operator: OperatorFormState = {
  currency: 'CNY',
  vendorCodes: ['PP'],
  code: 'GFA1',
  name: '',
  adminAccount: 'gfdemo01',
  boWhitelist: ['203.0.113.10'],
  apiWhitelist: ['203.0.113.11'],
  emails: [],
  operatingMarkets: ['CN'],
  websiteStatus: 'in_progress',
  website: '',
  testAccount: '',
  testPassword: '',
  chatSoftware: 'telegram',
  chatGroup: 'GoldenF',
  remark: '',
}

const agent: AgentFormState = {
  code: 'MAGOLD',
  name: '',
  adminAccount: 'gfma0001',
  boWhitelist: ['203.0.113.20'],
  emails: [],
  sameWhitelistAsA: false,
  sameEmailsAsA: false,
  remark: '',
}

const VENDORS: Vendor[] = [
  { code: 'PP', name: 'Pragmatic Play', demo: true, currencies: ['CNY', 'USD'] },
  { code: 'WM', name: 'WM Casino', demo: false, currencies: ['THB'] },
]

function input(overrides: Partial<PreSubmitInput> = {}): PreSubmitInput {
  return {
    levels: ['A', 'MA', 'SMA'] as CompanyLevel[],
    operator,
    agentMA: agent,
    agentSMA: { ...agent, code: 'SMAROOT' },
    currencyStatus: 'success',
    currencyCodes: ['CNY', 'USD', 'THB'],
    vendorStatus: 'success',
    vendors: VENDORS,
    ...overrides,
  }
}

test('a complete application can be submitted', () => {
  assert.equal(findPreSubmitProblem(input()), null)
})

test('the first problem is reported in step order: operator, then MA, then SMA', () => {
  assert.deepEqual(
    findPreSubmitProblem(
      input({
        agentMA: { ...agent, adminAccount: '' },
        agentSMA: { ...agent, code: '' },
      }),
    ),
    { path: '/apply/agent/ma', anchorId: 'field-agent-ma-admin-account' },
  )
  assert.deepEqual(
    findPreSubmitProblem(input({ agentSMA: { ...agent, remark: '字'.repeat(251) } })),
    { path: '/apply/agent/sma', anchorId: 'field-agent-sma-remark' },
  )
  assert.deepEqual(findPreSubmitProblem(input({ operator: { ...operator, chatGroup: '' } })), {
    path: '/apply/operator',
    anchorId: 'field-operator-chat-group',
  })
})

test('roles outside the chosen combination are not checked', () => {
  assert.equal(
    findPreSubmitProblem(input({ levels: ['A'], agentMA: { ...agent, code: '' } })),
    null,
  )
  assert.equal(
    findPreSubmitProblem(
      input({ levels: ['MA'], operator: { ...operator, currency: null }, vendorStatus: 'error' }),
    ),
    null,
  )
})

test('currency must come from a loaded list and still be available', () => {
  const currencyField = { path: '/apply/operator', anchorId: 'field-operator-currency' }

  assert.deepEqual(findPreSubmitProblem(input({ currencyStatus: 'error' })), currencyField)
  assert.deepEqual(findPreSubmitProblem(input({ currencyStatus: 'loading' })), currencyField)
  assert.deepEqual(findPreSubmitProblem(input({ currencyCodes: ['USD'] })), currencyField)
})

test('vendors must come from a loaded, non-empty list and none may be invalid', () => {
  const vendorField = { path: '/apply/operator', anchorId: 'field-operator-vendor' }

  assert.deepEqual(findPreSubmitProblem(input({ vendorStatus: 'error' })), vendorField)
  assert.deepEqual(findPreSubmitProblem(input({ vendors: [] })), vendorField)
  assert.deepEqual(
    findPreSubmitProblem(input({ operator: { ...operator, vendorCodes: ['PP', 'WM'] } })),
    vendorField,
  )
  assert.deepEqual(
    findPreSubmitProblem(input({ operator: { ...operator, vendorCodes: ['GONE'] } })),
    vendorField,
  )
})
