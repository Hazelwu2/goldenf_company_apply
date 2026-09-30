import assert from 'node:assert/strict'
import test from 'node:test'
import type { AxiosAdapter } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { createApplyApi } from '../src/api/applyApi.ts'
import { createHttpClient } from '../src/api/http.ts'
import { defineReferenceDataStore } from '../src/stores/referenceDataStore.ts'

const CURRENCIES = [
  { code: 'VND', name: '越南盾', memo: '' },
  { code: 'USD', name: '美元', memo: '' },
]

const VENDORS = [
  {
    code: 'PP',
    name: 'Pragmatic Play',
    status: 'online',
    demo: true,
    support: { v2: true },
    currency: { VND: { vendor: 'VND', rate: '', gf_support: false, decimal: '' } },
  },
  {
    code: 'OFF',
    name: 'Offline Vendor',
    status: 'offline',
    demo: true,
    support: { v2: true },
    currency: { VND: { vendor: 'VND', rate: '', gf_support: false, decimal: '' } },
  },
]

/** 依網址回應假資料並記錄請求次數；failTimes 次內回 HTTP 500。 */
function fakeBackend(options: { failTimes?: Record<string, number> } = {}) {
  const calls: Record<string, number> = {}
  const adapter: AxiosAdapter = async (config) => {
    const url = config.url ?? ''
    calls[url] = (calls[url] ?? 0) + 1
    await new Promise((resolve) => setTimeout(resolve, 5))
    const { AxiosError } = await import('axios')
    if (calls[url] <= (options.failTimes?.[url] ?? 0)) {
      const response = { data: 'error', status: 500, statusText: '500', headers: {}, config }
      throw new AxiosError('failed', 'ERR_BAD_RESPONSE', config, {}, response)
    }
    const list = url === '/api/v1/company_apply/vendor/list' ? VENDORS : CURRENCIES
    return {
      data: { status: 1, message: '成功', data: { list } },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }
  }
  setActivePinia(createPinia())
  const useStore = defineReferenceDataStore(createApplyApi(createHttpClient({ adapter })))
  return { store: useStore(), calls }
}

test('currencies load once and become select options', async () => {
  const { store, calls } = fakeBackend()
  assert.equal(store.currencyStatus, 'idle')

  await store.loadCurrencies()
  await store.loadCurrencies()

  assert.equal(store.currencyStatus, 'success')
  assert.equal(calls['/api/v1/company_apply/exchange/list'], 1)
  assert.deepEqual(store.currencyOptions, [
    { value: 'VND', label: 'VND 越南盾', memo: '' },
    { value: 'USD', label: 'USD 美元', memo: '' },
  ])
})

test('concurrent loads share one request', async () => {
  const { store, calls } = fakeBackend()

  const pending = store.loadVendors()
  assert.equal(store.vendorStatus, 'loading')
  await Promise.all([pending, store.loadVendors()])

  assert.equal(calls['/api/v1/company_apply/vendor/list'], 1)
})

test('vendors are filtered to selectable ones and expose display names by code', async () => {
  const { store } = fakeBackend()

  await store.loadVendors()

  assert.deepEqual(
    store.vendors.map((vendor) => vendor.code),
    ['PP'],
  )
  assert.deepEqual(store.vendorNames, { PP: 'Pragmatic Play' })
})

test('failed load reports an error and retry fetches again', async () => {
  const { store, calls } = fakeBackend({ failTimes: { '/api/v1/company_apply/vendor/list': 1 } })

  await store.loadVendors()
  assert.equal(store.vendorStatus, 'error')
  assert.deepEqual(store.vendors, [])

  await store.retryVendors()
  assert.equal(store.vendorStatus, 'success')
  assert.equal(calls['/api/v1/company_apply/vendor/list'], 2)
})

test('retry refetches even after a successful load', async () => {
  const { store, calls } = fakeBackend()

  await store.loadCurrencies()
  await store.retryCurrencies()

  assert.equal(calls['/api/v1/company_apply/exchange/list'], 2)
})

test('vendor list marked stale is fetched again on the next load and keeps the loaded vendors until refetched', async () => {
  const { store, calls } = fakeBackend()

  await store.loadVendors()
  store.markVendorsStale()
  assert.deepEqual(
    store.vendors.map((vendor) => vendor.code),
    ['PP'],
  )

  await store.loadVendors()
  await store.loadVendors()

  assert.equal(calls['/api/v1/company_apply/vendor/list'], 2)
  assert.equal(store.vendorStatus, 'success')
})
