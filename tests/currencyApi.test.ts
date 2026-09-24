import assert from 'node:assert/strict'
import test from 'node:test'
import axios from 'axios'
import { getCurrencies } from '../src/api/currencyApi.ts'

test('successful currency response becomes ordered select options without losing memo', async () => {
  const options = await getCurrencies({
    mode: 'mock',
    mockRequest: async () => ({
      status: 1,
      message: '成功',
      data: {
        list: [
          { code: 'VND', name: '越南盾', memo: '' },
          { code: 'KVND', name: '(K)越南盾', memo: '1:1000 由營運商轉換' },
        ],
      },
    }),
  })

  assert.deepEqual(options, [
    { value: 'VND', label: 'VND 越南盾', memo: '' },
    { value: 'KVND', label: 'KVND (K)越南盾', memo: '1:1000 由營運商轉換' },
  ])
})

test('non-success business status is rejected instead of becoming selectable data', async () => {
  await assert.rejects(
    getCurrencies({
      mode: 'mock',
      mockRequest: async () => ({
        status: 0,
        message: '读取失败',
        data: {
          list: [{ code: 'USD', name: '美元', memo: '' }],
        },
      }),
    }),
    /Invalid currency response/,
  )
})

test('malformed currency response is rejected at the service boundary', async () => {
  const malformedResponses = [
    { status: 1, message: '成功' },
    { status: 1, message: '成功', data: { list: 'not-an-array' } },
    {
      status: 1,
      message: '成功',
      data: { list: [{ code: 'USD', name: '美元' }] },
    },
  ]

  for (const response of malformedResponses) {
    await assert.rejects(
      getCurrencies({ mode: 'mock', mockRequest: async () => response }),
      /Invalid currency response/,
    )
  }
})

test('live mode posts the agreed request through the configured HTTP client', async () => {
  let receivedRequest: unknown
  const client = axios.create({
    adapter: async (config) => {
      receivedRequest = {
        url: config.url,
        method: config.method,
        body: config.data,
        contentType: config.headers.get('Content-Type'),
      }
      return {
        data: {
          status: 1,
          message: '成功',
          data: { list: [{ code: 'USD', name: '美元', memo: '' }] },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    },
  })
  const options = await getCurrencies({
    mode: 'live',
    client,
  })

  assert.deepEqual(receivedRequest, {
    url: '/api/v1/exchange/list',
    method: 'post',
    body: '{}',
    contentType: 'application/json',
  })
  assert.deepEqual(options, [{ value: 'USD', label: 'USD 美元', memo: '' }])
})

test('default mock mode exposes all 25 currencies in backend order', async () => {
  const options = await getCurrencies()

  assert.deepEqual(
    options.map((option) => option.value),
    [
      'VND',
      'USD',
      'IDR',
      'THB',
      'CNY',
      'MYR',
      'KRW',
      'JPY',
      'SGD',
      'EUR',
      'COP',
      'PEN',
      'MXN',
      'MMK',
      'INR',
      'PHP',
      'AUD',
      'KVND',
      'KIDR',
      'ARS',
      'HKD',
      'CLP',
      'VNDK',
      'IDRK',
      'BDT',
    ],
  )
  assert.deepEqual(options[17], {
    value: 'KVND',
    label: 'KVND (K)越南盾',
    memo: '1:1000 由營運商轉換，匯率需要 * 1000',
  })
})

test('valid empty currency list remains a successful empty result', async () => {
  const options = await getCurrencies({
    mode: 'mock',
    mockRequest: async () => ({
      status: 1,
      message: '成功',
      data: { list: [] },
    }),
  })

  assert.deepEqual(options, [])
})

test('live transport failure is exposed without falling back to mock data', async () => {
  let mockRequested = false
  const transportError = new Error('request timed out')
  const client = axios.create({
    adapter: async () => {
      throw transportError
    },
  })

  await assert.rejects(
    getCurrencies({
      mode: 'live',
      client,
      mockRequest: async () => {
        mockRequested = true
        return { status: 1, message: '成功', data: { list: [] } }
      },
    }),
    transportError,
  )
  assert.equal(mockRequested, false)
})
