import assert from 'node:assert/strict'
import test from 'node:test'
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { createApplyApi } from '../src/api/applyApi.ts'
import { ApiError, createHttpClient } from '../src/api/http.ts'

interface ReceivedRequest {
  url?: string
  method?: string
  body?: unknown
  contentType?: unknown
}

function respondWith(body: unknown, status = 200) {
  const received: ReceivedRequest = {}
  const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
    received.url = config.url
    received.method = config.method
    received.body = config.data
    received.contentType = config.headers.get('Content-Type')
    const response = { data: body, status, statusText: String(status), headers: {}, config }
    if (status >= 200 && status < 300) return response
    const { AxiosError } = await import('axios')
    throw new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, {}, response)
  }
  return { api: createApplyApi(createHttpClient({ adapter })), received }
}

test('currency list posts the agreed request and returns backend currencies in order', async () => {
  const { api, received } = respondWith({
    status: 1,
    message: '成功',
    data: {
      list: [
        { code: 'VND', name: '越南盾', memo: '' },
        { code: 'KVND', name: '(K)越南盾', memo: '1:1000 由營運商轉換' },
      ],
    },
  })

  const currencies = await api.listCurrencies()

  assert.deepEqual(received, {
    url: '/api/v1/company_apply/exchange/list',
    method: 'post',
    body: '{}',
    contentType: 'application/json',
  })
  assert.deepEqual(currencies, [
    { code: 'VND', name: '越南盾', memo: '' },
    { code: 'KVND', name: '(K)越南盾', memo: '1:1000 由營運商轉換' },
  ])
})

test('any status other than 1 is a business failure that keeps backend message and data', async () => {
  for (const status of [0, 2, '0', '2']) {
    const failure = {
      status,
      message: 'Application validation failed.',
      data: { errors: [{ company_level: 'A', field: 'code', message: '代碼重複' }] },
    }
    const { api } = respondWith(failure)

    await assert.rejects(api.listCurrencies(), (error: unknown) => {
      assert.ok(error instanceof ApiError, `expected ApiError for status ${JSON.stringify(status)}`)
      assert.equal(error.kind, 'business')
      assert.equal(error.message, 'Application validation failed.')
      assert.equal(error.httpStatus, 200)
      assert.deepEqual(error.data, failure.data)
      return true
    })
  }
})

test('status "1" as a string is treated as success', async () => {
  const { api } = respondWith({
    status: '1',
    message: '成功',
    data: { list: [{ code: 'USD', name: '美元', memo: '' }] },
  })
  assert.deepEqual(await api.listCurrencies(), [{ code: 'USD', name: '美元', memo: '' }])
})

test('HTTP 500 is a server failure even when the body looks like an envelope', async () => {
  for (const body of ['Internal Server Error', { status: 0, message: '系統錯誤', data: {} }]) {
    const { api } = respondWith(body, 500)
    await assert.rejects(api.listCurrencies(), (error: unknown) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.kind, 'http')
      assert.equal(error.httpStatus, 500)
      return true
    })
  }
})

function failWith(code: string) {
  const adapter: AxiosAdapter = async (config) => {
    const { AxiosError } = await import('axios')
    throw new AxiosError('request failed', code, config, {})
  }
  return createApplyApi(createHttpClient({ adapter }))
}

test('timeout means the request may have reached the backend, so the result is unknown', async () => {
  for (const code of ['ECONNABORTED', 'ETIMEDOUT']) {
    await assert.rejects(failWith(code).listCurrencies(), (error: unknown) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.kind, 'no-response')
      return true
    })
  }
})

test('connection failure without a response is a network error', async () => {
  await assert.rejects(failWith('ERR_NETWORK').listCurrencies(), (error: unknown) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.kind, 'network')
    return true
  })
})

test('responses that break the agreed contract are rejected at the API boundary', async () => {
  const malformed = [
    '<html>proxy error</html>',
    { message: '成功', data: { list: [] } },
    { status: null, message: '成功', data: { list: [] } },
    { status: 1, message: '成功' },
    { status: 1, message: '成功', data: null },
    { status: 1, message: '成功', data: { list: 'not-an-array' } },
    { status: 1, message: '成功', data: { list: [{ code: 'USD', name: '美元' }] } },
  ]

  for (const body of malformed) {
    const { api } = respondWith(body)
    await assert.rejects(api.listCurrencies(), (error: unknown) => {
      assert.ok(error instanceof ApiError, `expected ApiError for ${JSON.stringify(body)}`)
      assert.equal(error.kind, 'contract')
      return true
    })
  }
})

test('an empty currency list is a valid result', async () => {
  const { api } = respondWith({ status: 1, message: '成功', data: { list: [] } })
  assert.deepEqual(await api.listCurrencies(), [])
})

const BETBY = {
  code: 'betby',
  name: 'BETBY 體育／BETBY',
  status: 'online',
  demo: true,
  support: { v2: true, v3: false },
  currency: { VND: { vendor: 'VND', rate: '', gf_support: false, decimal: '' } },
}

test('vendor list requests the form endpoint and returns the backend vendors', async () => {
  const { api, received } = respondWith({
    status: 1,
    message: '成功',
    data: { totalCount: 1, currentPage: 0, perPage: 0, list: [BETBY] },
  })

  const vendors = await api.listVendors()

  assert.equal(received.url, '/api/v1/company_apply/vendor/list')
  assert.equal(received.method, 'get')
  assert.deepEqual(vendors, [BETBY])
})

test('vendor list with a malformed vendor is rejected at the API boundary', async () => {
  const malformed = [
    { list: 'not-an-array' },
    { list: [{ ...BETBY, demo: 'yes' }] },
    { list: [{ ...BETBY, currency: null }] },
    { list: [{ ...BETBY, currency: [{ vendor: 'VND', rate: '', gf_support: false, decimal: '' }] }] },
    { list: [{ ...BETBY, support: null }] },
    { list: [{ ...BETBY, name: undefined }] },
  ]

  for (const data of malformed) {
    const { api } = respondWith({ status: 1, message: '成功', data })
    await assert.rejects(api.listVendors(), (error: unknown) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.kind, 'contract')
      return true
    })
  }
})
