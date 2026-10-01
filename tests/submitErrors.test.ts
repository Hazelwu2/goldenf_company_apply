import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError } from '../src/api/http.ts'
import {
  groupSubmitErrors,
  mapSubmitErrors,
  resolveSubmitFailure,
  type SubmitErrorItem,
} from '../src/utils/submitErrors.ts'

function error(level: SubmitErrorItem['level'], fieldLabel: string): SubmitErrorItem {
  return {
    level,
    fieldLabel,
    fieldLabelEn: fieldLabel,
    message: `${fieldLabel} error`,
    messageEn: `${fieldLabel} error`,
    routePath: `/apply/${level.toLowerCase()}`,
    anchorId: `field-${fieldLabel}`,
  }
}

test('groups submit errors in A, MA, SMA form order while preserving field order', () => {
  const groups = groupSubmitErrors([
    error('MA', 'MA whitelist'),
    error('A', 'A code'),
    error('SMA', 'SMA code'),
    error('A', 'A account'),
  ])

  assert.deepEqual(
    groups.map((group) => ({
      level: group.level,
      fields: group.errors.map((item) => item.fieldLabel),
    })),
    [
      { level: 'A', fields: ['A code', 'A account'] },
      { level: 'MA', fields: ['MA whitelist'] },
      { level: 'SMA', fields: ['SMA code'] },
    ],
  )
})

test('omits role groups that have no errors', () => {
  const groups = groupSubmitErrors([error('SMA', 'SMA code')])

  assert.deepEqual(
    groups.map((group) => group.level),
    ['SMA'],
  )
})

function backendError(field: string, message = `${field} 錯誤`) {
  return { code: 'X1', field, message, message_en: `${field} error` }
}

test('maps known fields to label, role page and anchor, keeping backend messages', () => {
  const items = mapSubmitErrors({
    A: [backendError('vendors', '「JDB」不支援 VND')],
    MA: [backendError('admin_account')],
  })

  assert.deepEqual(items, [
    {
      level: 'A',
      fieldLabel: '产品商',
      fieldLabelEn: 'Vendors',
      message: '「JDB」不支援 VND',
      messageEn: 'vendors error',
      routePath: '/apply/operator',
      anchorId: 'field-operator-vendor',
    },
    {
      level: 'MA',
      fieldLabel: '后台账号',
      fieldLabelEn: 'Admin Account',
      message: 'admin_account 錯誤',
      messageEn: 'admin_account error',
      routePath: '/apply/agent/ma',
      anchorId: 'field-agent-ma-admin-account',
    },
  ])
})

test('name and remark errors have anchors for every role', () => {
  const items = mapSubmitErrors({
    A: [backendError('name'), backendError('merchant_memo')],
    MA: [backendError('name'), backendError('merchant_memo')],
    SMA: [backendError('name'), backendError('merchant_memo')],
  })

  assert.deepEqual(
    items.map((item) => item.anchorId),
    [
      'field-operator-name',
      'field-operator-remark',
      'field-agent-ma-name',
      'field-agent-ma-remark',
      'field-agent-sma-name',
      'field-agent-sma-remark',
    ],
  )
})

test('every editable operator and agent field resolves to an anchor', () => {
  const operatorFields = [
    'code', 'name', 'admin_account', 'bo_whitelist', 'api_whitelist', 'emails', 'currency',
    'vendors', 'operating_markets', 'website', 'test_account', 'test_password', 'chat_software',
    'chat_group', 'merchant_memo',
  ]
  const agentFields = ['code', 'name', 'admin_account', 'bo_whitelist', 'emails', 'merchant_memo']
  const items = mapSubmitErrors({
    A: operatorFields.map((field) => backendError(field)),
    SMA: agentFields.map((field) => backendError(field)),
  })

  for (const item of items) {
    assert.ok(item.anchorId?.startsWith('field-'), `${item.level} ${item.fieldLabel} has an anchor`)
    assert.notEqual(item.fieldLabel, item.fieldLabelEn, 'label is bilingual')
  }
})

test('fields without an editable control or unknown fields go to the role page without an anchor', () => {
  const items = mapSubmitErrors({
    SMA: [backendError('parent_code'), backendError('something_new')],
  })

  assert.deepEqual(items, [
    {
      level: 'SMA',
      fieldLabel: 'parent_code',
      fieldLabelEn: 'parent_code',
      message: 'parent_code 錯誤',
      messageEn: 'parent_code error',
      routePath: '/apply/agent/sma',
    },
    {
      level: 'SMA',
      fieldLabel: 'something_new',
      fieldLabelEn: 'something_new',
      message: 'something_new 錯誤',
      messageEn: 'something_new error',
      routePath: '/apply/agent/sma',
    },
  ])
  assert.ok(items.every((item) => !('anchorId' in item)))
})

test('expands roles in A, MA, SMA order and keeps backend order within a role', () => {
  const items = mapSubmitErrors({
    SMA: [backendError('code')],
    MA: [backendError('emails'), backendError('code')],
    A: [backendError('code')],
  })

  assert.deepEqual(
    items.map((item) => `${item.level}:${item.anchorId}`),
    [
      'A:field-operator-code',
      'MA:field-agent-ma-email',
      'MA:field-agent-ma-code',
      'SMA:field-agent-sma-code',
    ],
  )
})

function business(data: unknown, message = 'apply validation failed.') {
  return new ApiError('business', message, { httpStatus: 200, data })
}

test('a business failure with usable errors goes to the rejected page', () => {
  const failure = resolveSubmitFailure(
    business({ errors: { A: [backendError('vendors')], XYZ: [backendError('code')] } }),
  )

  assert.equal(failure.kind, 'rejected')
  assert.ok(failure.kind === 'rejected')
  assert.equal(failure.errors.length, 1)
  assert.equal(failure.vendorsInvalid, true)
})

test('a rejected failure without vendor errors does not invalidate the vendor list', () => {
  const failure = resolveSubmitFailure(business({ errors: { MA: [backendError('code')] } }))
  assert.ok(failure.kind === 'rejected')
  assert.equal(failure.vendorsInvalid, false)
})

test('a business failure without usable errors stays on confirm and shows the backend message', () => {
  for (const data of [undefined, {}, { errors: {} }, { errors: { A: [{ field: 'code' }] } }]) {
    const failure = resolveSubmitFailure(business(data, '系統忙碌中'))
    assert.equal(failure.kind, 'notice', JSON.stringify(data))
    assert.ok(failure.kind === 'notice')
    assert.equal(failure.tone, 'error')
    assert.match(failure.zh, /系統忙碌中/)
    assert.ok(failure.en.length > 0)
  }
})

test('network, timeout and other failures stay on confirm with their own notices', () => {
  const network = resolveSubmitFailure(new ApiError('network', 'Network error'))
  const timeout = resolveSubmitFailure(new ApiError('no-response', 'Request timed out'))
  const http = resolveSubmitFailure(new ApiError('http', 'HTTP 500', { httpStatus: 500 }))
  const contract = resolveSubmitFailure(new ApiError('contract', 'bad'))
  const unknown = resolveSubmitFailure(new Error('boom'))

  assert.ok(network.kind === 'notice')
  assert.match(network.zh, /网络连线失败/)
  assert.ok(timeout.kind === 'notice')
  assert.equal(timeout.tone, 'warning')
  assert.match(timeout.zh, /申请可能已建立/)
  assert.match(timeout.zh, /联络客服/)
  for (const failure of [http, contract, unknown]) {
    assert.ok(failure.kind === 'notice')
    assert.match(failure.zh, /送出失败/)
  }
  assert.notEqual(network.zh, http.zh)
})
