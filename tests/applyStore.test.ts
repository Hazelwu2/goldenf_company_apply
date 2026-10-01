import assert from 'node:assert/strict'
import test from 'node:test'
import { createPinia, setActivePinia } from 'pinia'
import { useApplyStore } from '@/stores/applyStore'
import type { CreateApplicationBody, CreateApplicationData } from '@/api/types'
import { ApiError } from '@/api/http'

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

  store.operator.chatSoftware = 'teams'
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

test('preview success data is marked as a demo value instead of looking like a real application', () => {
  const store = freshStore()
  store.seedDemoData('SMA_MA_A')

  store.seedDemoSubmission()

  assert.match(store.referenceNo ?? '', /DEMO/)
  assert.ok(store.submittedAt)
})

test('a remark over 250 characters blocks the role from being valid', () => {
  const store = freshStore()
  store.seedDemoData('SMA_MA_A')
  assert.equal(store.isOperatorValid, true)
  assert.equal(store.isAgentValid('MA'), true)

  store.operator.remark = '字'.repeat(251)
  store.agentMA.remark = '字'.repeat(251)

  assert.equal(store.isOperatorValid, false)
  assert.equal(store.isAgentValid('MA'), false)
})

const CREATED: CreateApplicationData = {
  reference_no: 'APY-20260911-0001',
  created_at: 1789056000000,
  records: [],
}

test('submitting sends the current form and records the backend reference number and time', async () => {
  const store = freshStore()
  store.seedDemoData('MA_A')
  const sent: CreateApplicationBody[] = []
  let submittingDuringCall = false

  const outcome = await store.submitApplication(async (body) => {
    sent.push(body)
    submittingDuringCall = store.submitting
    return CREATED
  })

  assert.equal(outcome.kind, 'success')
  assert.equal(sent.length, 1)
  assert.equal(sent[0]?.combination, 'MA + A')
  assert.deepEqual(sent[0]?.records.map((record) => record.code), ['GFA1', 'MAGOLD'])
  assert.equal(submittingDuringCall, true)
  assert.equal(store.submitting, false)
  assert.equal(store.referenceNo, 'APY-20260911-0001')
  assert.equal(store.submittedAt, new Date(1789056000000).toISOString())
})

test('a second submit while the first is in flight does not call the API again', async () => {
  const store = freshStore()
  store.seedDemoData('A')
  let calls = 0
  let finish: (data: CreateApplicationData) => void = () => {}
  const send = () => {
    calls += 1
    return new Promise<CreateApplicationData>((resolve) => (finish = resolve))
  }

  const first = store.submitApplication(send)
  const second = await store.submitApplication(send)
  finish(CREATED)
  await first

  assert.equal(calls, 1)
  assert.equal(second.kind, 'busy')
})

test('the payload is taken when submitting starts, not after later edits', async () => {
  const store = freshStore()
  store.seedDemoData('A')
  let received: CreateApplicationBody | null = null
  const pending = store.submitApplication(async (body) => {
    await new Promise((resolve) => setTimeout(resolve, 5))
    received = body
    return CREATED
  })
  store.operator.code = 'EDIT'
  await pending

  assert.equal((received as CreateApplicationBody | null)?.records[0]?.code, 'GFA1')
})

test('resetting clears the reference number and submission time', async () => {
  const store = freshStore()
  store.seedDemoData('A')
  await store.submitApplication(async () => CREATED)
  store.resetAll()

  assert.equal(store.referenceNo, null)
  assert.equal(store.submittedAt, null)
})

test('an application that already has a reference number is not submitted again', async () => {
  const store = freshStore()
  store.seedDemoData('A')
  let calls = 0
  const send = async () => {
    calls += 1
    return CREATED
  }
  await store.submitApplication(send)
  const again = await store.submitApplication(send)

  assert.equal(calls, 1)
  assert.equal(again.kind, 'already-submitted')
})

function validationFailure() {
  return new ApiError('business', 'apply validation failed.', {
    httpStatus: 200,
    data: {
      errors: {
        A: [{ code: 'GFA1', field: 'vendors', message: '不支援', message_en: 'Unsupported' }],
      },
    },
  })
}

test('a validation failure keeps the mapped errors and reports the vendor problem', async () => {
  const store = freshStore()
  store.seedDemoData('A')

  const outcome = await store.submitApplication(async () => {
    throw validationFailure()
  })

  assert.deepEqual(outcome, { kind: 'rejected', vendorsInvalid: true })
  assert.equal(store.submitting, false)
  assert.equal(store.referenceNo, null)
  assert.deepEqual(
    store.submitErrors.map((item) => item.anchorId),
    ['field-operator-vendor'],
  )
})

test('other failures stay on confirm with a notice and keep the form data', async () => {
  const store = freshStore()
  store.seedDemoData('A')

  const outcome = await store.submitApplication(async () => {
    throw new ApiError('network', 'Network error')
  })

  assert.equal(outcome.kind, 'failed')
  assert.ok(outcome.kind === 'failed')
  assert.match(outcome.notice.zh, /网络连线失败/)
  assert.deepEqual(store.submitErrors, [])
  assert.equal(store.operator.code, 'GFA1')
  assert.equal(store.submitting, false)
})

test('resubmitting clears the previous errors, and a later success leaves none behind', async () => {
  const store = freshStore()
  store.seedDemoData('A')
  await store.submitApplication(async () => {
    throw validationFailure()
  })
  let errorsDuringRetry = -1

  await store.submitApplication(async () => {
    errorsDuringRetry = store.submitErrors.length
    return CREATED
  })

  assert.equal(errorsDuringRetry, 0)
  assert.deepEqual(store.submitErrors, [])
})

test('clearing and resetting remove the previous submit errors', async () => {
  const store = freshStore()
  store.seedDemoData('A')
  await store.submitApplication(async () => {
    throw validationFailure()
  })
  store.clearSubmitErrors()
  assert.deepEqual(store.submitErrors, [])

  await store.submitApplication(async () => {
    throw validationFailure()
  })
  store.resetAll()
  assert.deepEqual(store.submitErrors, [])
})

test('preview rejection seeds clearly marked demo errors without calling the API', () => {
  const store = freshStore()
  store.seedDemoData('SMA_MA_A')
  store.seedDemoRejection()

  assert.ok(store.submitErrors.length > 0)
  assert.ok(store.submitErrors.every((item) => item.message.includes('示范')))
  assert.equal(store.referenceNo, null)
})
