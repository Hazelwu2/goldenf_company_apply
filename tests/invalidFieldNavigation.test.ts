import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getFirstInvalidAgentField,
  getFirstInvalidOperatorField,
} from '../src/utils/invalidFieldNavigation'
import type { AgentFormState, OperatorFormState } from '../src/types/apply'

const validOperator: OperatorFormState = {
  currency: 'CNY',
  vendorCodes: ['PP'],
  code: 'AB12',
  name: '',
  adminAccount: 'admin123',
  boWhitelist: ['203.0.113.10'],
  apiWhitelist: ['203.0.113.11'],
  emails: [],
  operatingMarkets: ['TW'],
  websiteStatus: 'in_progress',
  website: '',
  testAccount: '',
  testPassword: '',
  chatSoftware: 'Teams',
  chatGroup: 'Launch team',
  remark: '',
}

test('operator navigation returns the first invalid field in visual order', () => {
  assert.deepEqual(getFirstInvalidOperatorField({ ...validOperator, currency: null }), {
    key: 'currency',
    id: 'field-operator-currency',
  })

  assert.deepEqual(getFirstInvalidOperatorField({ ...validOperator, emails: ['bad-email'] }), {
    key: 'emails',
    id: 'field-operator-email',
  })
})

test('live website navigation enters the first invalid credential field', () => {
  assert.deepEqual(
    getFirstInvalidOperatorField({
      ...validOperator,
      websiteStatus: 'live',
      website: 'https://example.com',
      testAccount: '',
      testPassword: '',
    }),
    { key: 'testAccount', id: 'field-operator-test-account' },
  )
})

test('agent navigation includes optional values only when their format is invalid', () => {
  const validAgent: AgentFormState = {
    code: 'AGENT1',
    name: '',
    adminAccount: 'agent001',
    boWhitelist: ['203.0.113.20'],
    emails: [],
    sameWhitelistAsA: false,
    sameEmailsAsA: false,
    remark: '',
  }

  assert.equal(getFirstInvalidAgentField(validAgent), null)
  assert.deepEqual(getFirstInvalidAgentField({ ...validAgent, emails: ['bad-email'] }, 'MA'), {
    key: 'emails',
    id: 'field-agent-ma-email',
  })
})
