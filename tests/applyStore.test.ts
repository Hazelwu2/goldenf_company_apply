import assert from 'node:assert/strict'
import test from 'node:test'
import { createPinia, setActivePinia } from 'pinia'
import { useApplyStore } from '@/stores/applyStore'

function freshStore() {
  setActivePinia(createPinia())
  return useApplyStore()
}

/** 填满 A 的必填栏位，让 isOperatorValid 只受测试想验证的栏位影响。 */
function fillValidOperator(store: ReturnType<typeof useApplyStore>) {
  Object.assign(store.operator, {
    currency: 'CNY',
    vendorCodes: ['PP'],
    code: 'GFA1',
    adminAccount: 'gfdemo01',
    boWhitelist: ['203.0.113.10'],
    apiWhitelist: ['203.0.113.11'],
    emails: ['ops@example.com'],
    operatingMarkets: ['CN'],
    websiteStatus: 'live',
    website: 'https://example.com',
    testAccount: 'tester01',
    testPassword: 'secret',
  })
}

test('sameAsA copies A的阵列，而不是共用同一个参考', () => {
  const store = freshStore()
  store.operator.boWhitelist = ['203.0.113.10']
  store.operator.emails = ['ops@example.com']

  store.applySameAsA('MA', true)
  assert.deepEqual(store.agentMA.boWhitelist, ['203.0.113.10'])
  assert.deepEqual(store.agentMA.emails, ['ops@example.com'])

  // 在 MA 端就地新增一笔，不可以回头污染 A。
  store.agentMA.boWhitelist.push('198.51.100.1')
  store.agentMA.emails.push('ma@example.com')

  assert.deepEqual(store.operator.boWhitelist, ['203.0.113.10'])
  assert.deepEqual(store.operator.emails, ['ops@example.com'])
})

test('勾选「与 A 相同」后，A 的就地异动会同步到 MA', async () => {
  const store = freshStore()
  store.operator.boWhitelist = ['203.0.113.10']
  store.operator.emails = ['ops@example.com']
  store.applySameAsA('MA', true)

  store.operator.boWhitelist.push('198.51.100.0/24')
  await Promise.resolve()

  assert.deepEqual(store.agentMA.boWhitelist, ['203.0.113.10', '198.51.100.0/24'])
})

test('取消勾选后，A 的异动不再同步到 MA', async () => {
  const store = freshStore()
  store.operator.boWhitelist = ['203.0.113.10']
  store.applySameAsA('MA', true)
  store.applySameAsA('MA', false)

  store.operator.boWhitelist.push('198.51.100.1')
  await Promise.resolve()

  assert.deepEqual(store.agentMA.boWhitelist, ['203.0.113.10'])
})

test('白名单必填：空阵列不算完成', () => {
  const store = freshStore()
  fillValidOperator(store)
  assert.equal(store.isOperatorValid, true)

  store.operator.boWhitelist = []
  assert.equal(store.isOperatorValid, false)
})

test('联络 Email 选填，但填了就必须每一笔都合法', () => {
  const store = freshStore()
  fillValidOperator(store)

  store.operator.emails = []
  assert.equal(store.isOperatorValid, true)

  store.operator.emails = ['ops@example.com', 'not-an-email']
  assert.equal(store.isOperatorValid, false)

  store.operator.emails = ['ops@example.com', 'risk@example.com']
  assert.equal(store.isOperatorValid, true)
})

test('站台状态与三个栏位一起判断', () => {
  const store = freshStore()
  fillValidOperator(store)
  assert.equal(store.isOperatorValid, true)

  // 已有网站却整份留白 -> 不可送出
  Object.assign(store.operator, { website: '', testAccount: '', testPassword: '' })
  assert.equal(store.isOperatorValid, false)

  // 尚在开发中且三者留空 -> 可送出
  store.operator.websiteStatus = 'in_progress'
  assert.equal(store.isOperatorValid, true)

  // 尚在开发中却填了网址 -> 不可送出
  store.operator.website = 'https://example.com'
  assert.equal(store.isOperatorValid, false)
})

test('示范资料在 in_progress 时不会填入站台三栏', () => {
  const store = freshStore()
  store.seedDemoData('A', { websiteStatus: 'in_progress' })

  assert.equal(store.operator.website, '')
  assert.equal(store.operator.testAccount, '')
  assert.equal(store.operator.testPassword, '')
  assert.equal(store.isOperatorValid, true)
})

test('示范资料的营运市场使用 ISO alpha-2 代码', () => {
  const store = freshStore()
  store.seedDemoData('A')

  assert.deepEqual(store.operator.operatingMarkets, ['CN', 'VN'])
  assert.equal(store.isOperatorValid, true)
})
