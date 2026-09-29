import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { ApplyApi } from '@/api/applyApi'
import type { CurrencyDto } from '@/api/types'
import { toCurrencyOptions } from '@/utils/currencyOptions'
import { toSelectableVendors, type Vendor } from '@/utils/vendors'

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * 管理一份從 API 載入的清單：成功後不再重打；載入中重複呼叫共用同一個請求；
 * retry 一律重新載入。
 */
function useRemoteList<T>(fetchList: () => Promise<T[]>) {
  const items = shallowRef<T[]>([])
  const status = ref<LoadStatus>('idle')
  let pending: Promise<void> | null = null

  function fetch(): Promise<void> {
    status.value = 'loading'
    pending = fetchList()
      .then((list) => {
        items.value = list
        status.value = 'success'
      })
      .catch(() => {
        items.value = []
        status.value = 'error'
      })
      .finally(() => {
        pending = null
      })
    return pending
  }

  function load(): Promise<void> {
    if (pending) return pending
    if (status.value === 'success') return Promise.resolve()
    return fetch()
  }

  function retry(): Promise<void> {
    return pending ?? fetch()
  }

  return { items, status, load, retry }
}

/**
 * 幣別與產品商清單只載入一次，營運商 A 頁、確認頁、換幣別確認框共用。
 * 以 factory 注入 API，測試時可以換成假的後端。
 */
export function defineReferenceDataStore(api: ApplyApi) {
  return defineStore('referenceData', () => {
    const currencyList = useRemoteList<CurrencyDto>(() => api.listCurrencies())
    const vendorList = useRemoteList<Vendor>(async () =>
      toSelectableVendors(await api.listVendors()),
    )

    const currencyOptions = computed(() => toCurrencyOptions(currencyList.items.value))
    const vendorNames = computed<Record<string, string>>(() =>
      Object.fromEntries(vendorList.items.value.map((vendor) => [vendor.code, vendor.name])),
    )

    return {
      currencyStatus: currencyList.status,
      currencyOptions,
      loadCurrencies: currencyList.load,
      retryCurrencies: currencyList.retry,

      vendors: vendorList.items,
      vendorStatus: vendorList.status,
      vendorNames,
      loadVendors: vendorList.load,
      retryVendors: vendorList.retry,
    }
  })
}
