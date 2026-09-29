import assert from 'node:assert/strict'
import test from 'node:test'
import { createApplyApi } from '../src/api/applyApi.ts'
import { ApiError, createHttpClient } from '../src/api/http.ts'
import { mockAdapter } from '../src/mocks/mockAdapter.ts'

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
    { method: 'get', url: '/api/v1/exchange/list' },
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
