import assert from 'node:assert/strict'
import test from 'node:test'
import { createApplyApi } from '../src/api/applyApi.ts'
import { ApiError, createHttpClient } from '../src/api/http.ts'
import { mockAdapter } from '../src/mocks/mockAdapter.ts'
import { toSelectableVendors } from '../src/utils/vendors.ts'

const http = createHttpClient({ adapter: mockAdapter })

test('mock mode serves all 25 currencies in backend order through the real client', async () => {
  const currencies = await createApplyApi(http).listCurrencies()

  assert.deepEqual(
    currencies.map((currency) => currency.code),
    [
      'VND', 'USD', 'IDR', 'THB', 'CNY', 'MYR', 'KRW', 'JPY', 'SGD', 'EUR', 'COP', 'PEN', 'MXN',
      'MMK', 'INR', 'PHP', 'AUD', 'KVND', 'KIDR', 'ARS', 'HKD', 'CLP', 'VNDK', 'IDRK', 'BDT',
    ],
  )
  assert.deepEqual(currencies[17], {
    code: 'KVND',
    name: '(K)越南盾',
    memo: '1:1000 由營運商轉換，匯率需要 * 1000',
  })
})

test('mock mode rejects routes it does not know instead of pretending to succeed', async () => {
  for (const config of [
    { method: 'get', url: '/api/v1/company_apply/exchange/list' },
    { method: 'post', url: '/api/v1/unknown' },
  ]) {
    await assert.rejects(http.request(config, (data) => data), (error: unknown) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.kind, 'http')
      assert.equal(error.httpStatus, 404)
      return true
    })
  }
})

test('mock vendor list covers every filtering scenario the form must handle', async () => {
  const dtos = await createApplyApi(http).listVendors()
  const byCode = Object.fromEntries(dtos.map((vendor) => [vendor.code, vendor]))

  assert.ok(dtos.some((vendor) => vendor.status !== 'online'), 'has an offline vendor')
  assert.ok(dtos.some((vendor) => vendor.support.v2 !== true), 'has a vendor without 2.0')
  assert.ok(
    dtos.some((vendor) => Object.values(vendor.currency).every((entry) => entry.vendor === '')),
    'has a vendor without any vendor currency',
  )
  assert.ok(
    dtos.some((vendor) => Object.values(vendor.currency).some((entry) => entry.vendor === '')),
    'has empty vendor currency entries',
  )
  assert.equal(byCode.motivation?.status, 'online', 'Motivation is listed as its own vendor')
  assert.ok(
    dtos.every((vendor) => !Array.isArray(vendor.currency)),
    'currency is an object keyed by currency code',
  )

  const selectable = toSelectableVendors(dtos)
  assert.ok(selectable.some((vendor) => vendor.demo), 'has production & test vendors')
  assert.ok(selectable.some((vendor) => !vendor.demo), 'has production only vendors')
  // 畫面總覽示範資料使用 CNY + PP／JILI，必須是可選的產品商
  for (const code of ['PP', 'JILI']) {
    assert.ok(
      selectable.find((vendor) => vendor.code === code)?.currencies.includes('CNY'),
      `${code} supports CNY`,
    )
  }
})

test('mock create succeeds by default with an APY reference number and the submitted roles', async () => {
  const before = Math.floor(Date.now() / 1000)
  const created = await createApplyApi(http).createApplication({
    combination: 'MA + A',
    status: 'pending',
    records: [
      { company_level: 'A', type: 'operator', code: 'OP9' },
      { company_level: 'MA', type: 'company', code: 'MA12' },
    ] as never,
  })

  assert.match(created.reference_no, /^APY-\d{8}-\d{4,}$/)
  assert.ok(created.created_at >= before && created.created_at <= before + 5, 'created_at is Unix seconds')
  assert.deepEqual(
    created.records.map((record) => [record.company_level, record.type, record.code, record.status]),
    [
      ['A', 'operator', 'OP9', 'pending'],
      ['MA', 'company', 'MA12', 'pending'],
    ],
  )
  assert.ok(created.records.every((record) => typeof record._id === 'string' && record._id !== ''))
})
