import assert from 'node:assert/strict'
import test from 'node:test'
import type { AgentFormState, ComboKey, OperatorFormState } from '../src/types/apply.ts'
import { buildCreateApplicationBody } from '../src/utils/applicationPayload.ts'

function operatorForm(overrides: Partial<OperatorFormState> = {}): OperatorFormState {
  return {
    currency: 'VND',
    vendorCodes: ['CQ9', 'JDB'],
    code: 'OP9',
    name: '好運營運站',
    adminAccount: 'op9admin',
    boWhitelist: ['192.168.1.10'],
    apiWhitelist: ['203.0.113.55'],
    emails: ['ops@example.com'],
    operatingMarkets: ['VN', 'TH'],
    websiteStatus: 'live',
    website: 'https://example.com',
    testAccount: 'tester01',
    testPassword: 'password123',
    chatSoftware: 'telegram',
    chatGroup: 'GoldenF 開線群組',
    remark: '',
    ...overrides,
  }
}

function agentForm(code: string, overrides: Partial<AgentFormState> = {}): AgentFormState {
  return {
    code,
    name: `${code} 名稱`,
    adminAccount: `${code.toLowerCase()}admin`,
    boWhitelist: [`10.0.0.${code.length}`],
    emails: [`${code.toLowerCase()}@example.com`],
    sameWhitelistAsA: false,
    sameEmailsAsA: false,
    remark: '',
    ...overrides,
  }
}

function build(combo: ComboKey, overrides: {
  operator?: Partial<OperatorFormState>
  agentMA?: Partial<AgentFormState>
  agentSMA?: Partial<AgentFormState>
} = {}) {
  return buildCreateApplicationBody({
    combo,
    operator: operatorForm(overrides.operator),
    agentMA: agentForm('MA12', overrides.agentMA),
    agentSMA: agentForm('SMAROOT', overrides.agentSMA),
  })
}

test('maps each combo to the backend combination, records and parent codes', () => {
  const cases: Array<[ComboKey, string, Array<[string, string, string]>]> = [
    ['A', 'A', [['A', 'OP9', 'GF_MA']]],
    ['MA', 'MA', [['MA', 'MA12', 'GF_MA']]],
    ['MA_A', 'MA + A', [['A', 'OP9', 'MA12'], ['MA', 'MA12', 'GF_MA']]],
    [
      'SMA_MA_A',
      'SMA + MA + A',
      [['A', 'OP9', 'MA12'], ['MA', 'MA12', 'SMAROOT'], ['SMA', 'SMAROOT', 'GF_MA']],
    ],
  ]

  for (const [combo, combination, records] of cases) {
    const body = build(combo)
    assert.equal(body.combination, combination, combo)
    assert.equal(body.status, 'pending', combo)
    assert.deepEqual(
      body.records.map((record) => [record.company_level, record.code, record.parent_code]),
      records,
      combo,
    )
    for (const record of body.records) {
      assert.equal(record.type, record.company_level === 'A' ? 'operator' : 'company')
    }
  }
})

test('operator record uses backend field names and sends no front-end-only state', () => {
  const body = build('A', { operator: { remark: '請協助加開 PP' } })

  assert.deepEqual(body.records[0], {
    company_level: 'A',
    type: 'operator',
    code: 'OP9',
    name: '好運營運站',
    parent_code: 'GF_MA',
    admin_account: 'op9admin',
    bo_whitelist: ['192.168.1.10'],
    api_whitelist: ['203.0.113.55'],
    emails: ['ops@example.com'],
    currency: 'VND',
    vendors: ['CQ9', 'JDB'],
    operating_markets: ['VN', 'TH'],
    website: 'https://example.com',
    test_account: 'tester01',
    test_password: 'password123',
    chat_software: 'telegram',
    chat_group: 'GoldenF 開線群組',
    merchant_memo: '請協助加開 PP',
  })
})

test('agent record only carries the shared fields', () => {
  const body = build('MA', { agentMA: { remark: 'MA 備註' } })

  assert.deepEqual(body.records[0], {
    company_level: 'MA',
    type: 'company',
    code: 'MA12',
    name: 'MA12 名稱',
    parent_code: 'GF_MA',
    admin_account: 'ma12admin',
    bo_whitelist: ['10.0.0.4'],
    emails: ['ma12@example.com'],
    merchant_memo: 'MA 備註',
  })
})

test('website in development sends null site, account and password', () => {
  const body = build('A', {
    operator: {
      websiteStatus: 'in_progress',
      website: 'https://left-over.example.com',
      testAccount: 'left-over',
      testPassword: 'left-over',
    },
  })
  const [record] = body.records
  assert.ok(record?.company_level === 'A')
  assert.equal(record.website, null)
  assert.equal(record.test_account, null)
  assert.equal(record.test_password, null)
})

test('"same as A" copies A whitelist and emails even when the store has not synced yet', () => {
  const body = build('SMA_MA_A', {
    operator: { boWhitelist: ['1.1.1.1'], emails: ['a@example.com'] },
    agentMA: { sameWhitelistAsA: true, boWhitelist: ['9.9.9.9'], emails: ['ma@example.com'] },
    agentSMA: { sameEmailsAsA: true, boWhitelist: ['8.8.8.8'], emails: ['stale@example.com'] },
  })
  const [, ma, sma] = body.records

  assert.deepEqual(ma?.bo_whitelist, ['1.1.1.1'])
  assert.deepEqual(ma?.emails, ['ma@example.com'])
  assert.deepEqual(sma?.bo_whitelist, ['8.8.8.8'])
  assert.deepEqual(sma?.emails, ['a@example.com'])
})

test('trims only the agreed fields; password and remark are sent as typed', () => {
  const body = build('MA_A', {
    operator: {
      code: ' OP9 ',
      name: '  好運  ',
      adminAccount: ' op9admin ',
      website: ' https://example.com ',
      testAccount: ' tester01 ',
      testPassword: ' pass word ',
      chatGroup: ' 群組 ',
      remark: '  前後空白保留  ',
    },
    agentMA: { code: ' MA12 ', name: ' ', adminAccount: ' ma12admin ', remark: ' 保留 ' },
  })
  const [operator, ma] = body.records
  assert.ok(operator?.company_level === 'A')

  assert.equal(operator.code, 'OP9')
  assert.equal(operator.name, '好運')
  assert.equal(operator.admin_account, 'op9admin')
  assert.equal(operator.website, 'https://example.com')
  assert.equal(operator.test_account, 'tester01')
  assert.equal(operator.chat_group, '群組')
  assert.equal(operator.test_password, ' pass word ')
  assert.equal(operator.merchant_memo, '  前後空白保留  ')
  // A 的 parent_code 使用 trim 後的 MA 代碼
  assert.equal(operator.parent_code, 'MA12')

  assert.equal(ma?.code, 'MA12')
  assert.equal(ma?.name, '')
  assert.equal(ma?.admin_account, 'ma12admin')
  assert.equal(ma?.merchant_memo, ' 保留 ')
})

test('empty name is sent as an empty string so the backend uses the code', () => {
  const body = build('A', { operator: { name: '' } })
  assert.equal(body.records[0]?.name, '')
})
