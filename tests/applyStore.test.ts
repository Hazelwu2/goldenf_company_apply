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
    chatSoftware: 'telegram',
    chatGroup: 'GoldenF 开线群组',
  })
}

test('白名单与 Email 的「与 A 相同」各自独立', () => {
  const store = freshStore()
  store.operator.boWhitelist = ['203.0.113.10']
  store.operator.emails = ['ops@example.com']

  // 只同步白名单，Email 仍可自行填写。
  store.applySameAsA('MA', 'whitelist', true)
  assert.deepEqual(store.agentMA.boWhitelist, ['203.0.113.10'])
  assert.equal(store.agentMA.sameWhitelistAsA, true)
  assert.equal(store.agentMA.sameEmailsAsA, false)
  assert.deepEqual(store.agentMA.emails, [])

  store.agentMA.emails = ['ma@example.com']
  assert.deepEqual(store.agentMA.emails, ['ma@example.com'])
})

test('勾选白名单同步时复制阵列，不共用参考', () => {
  const store = freshStore()
  store.operator.boWhitelist = ['203.0.113.10']
  store.applySameAsA('MA', 'whitelist', true)

  store.agentMA.boWhitelist.push('198.51.100.1')
  assert.deepEqual(store.operator.boWhitelist, ['203.0.113.10'])
})

test('勾选 Email 同步时复制阵列，不共用参考', () => {
  const store = freshStore()
  store.operator.emails = ['ops@example.com']
  store.applySameAsA('MA', 'emails', true)

  store.agentMA.emails.push('ma@example.com')
  assert.deepEqual(store.operator.emails, ['ops@example.com'])
})

test('A 的就地异动只同步到有勾选的那一项', async () => {
  const store = freshStore()
  store.operator.boWhitelist = ['203.0.113.10']
  store.operator.emails = ['ops@example.com']
  store.applySameAsA('MA', 'whitelist', true)
  store.agentMA.emails = ['ma@example.com']

  store.operator.boWhitelist.push('198.51.100.0/24')
  store.operator.emails.push('risk@example.com')
  await Promise.resolve()

  assert.deepEqual(store.agentMA.boWhitelist, ['203.0.113.10', '198.51.100.0/24'])
  // Email 没勾，不该被 A 覆写。
  assert.deepEqual(store.agentMA.emails, ['ma@example.com'])
})

test('取消勾选后，该项不再同步且保留当下的值', async () => {
  const store = freshStore()
  store.operator.boWhitelist = ['203.0.113.10']
  store.applySameAsA('MA', 'whitelist', true)
  store.applySameAsA('MA', 'whitelist', false)

  store.operator.boWhitelist.push('198.51.100.1')
  await Promise.resolve()

  assert.deepEqual(store.agentMA.boWhitelist, ['203.0.113.10'])
  assert.equal(store.agentMA.sameWhitelistAsA, false)
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

test('通讯软体与通讯群组为 A 的必填栏位', () => {
  const store = freshStore()
  fillValidOperator(store)
  assert.equal(store.isOperatorValid, true)

  store.operator.chatSoftware = null
  assert.equal(store.isOperatorValid, false)

  store.operator.chatSoftware = 'Teams'
  assert.equal(store.isOperatorValid, true)

  store.operator.chatGroup = '   '
  assert.equal(store.isOperatorValid, false)
})

test('MA／SMA 不受通讯栏位影响（仅 A 需要填写）', () => {
  const store = freshStore()
  store.seedDemoData('MA_A')

  // A 有通讯栏位，MA 没有，两者都应该有效。
  assert.equal(store.operator.chatSoftware, 'telegram')
  assert.equal(store.isAgentValid('MA'), true)
  assert.equal('chatSoftware' in store.agentMA, false)
})

test('站台网址乱填时不能送出', () => {
  const store = freshStore()
  fillValidOperator(store)
  assert.equal(store.isOperatorValid, true)

  store.operator.website = '随便乱填'
  assert.equal(store.isOperatorValid, false)

  store.operator.website = 'example.com'
  assert.equal(store.isOperatorValid, false)

  store.operator.website = 'https://example.com'
  assert.equal(store.isOperatorValid, true)
})
