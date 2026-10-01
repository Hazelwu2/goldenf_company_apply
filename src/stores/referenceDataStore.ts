import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { ApplyApi } from '@/api/applyApi'
import type { CurrencyDto } from '@/api/types'
import { toCurrencyOptions } from '@/utils/currencyOptions'
import { toSelectableVendors, type Vendor } from '@/utils/vendors'

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * 管理一份從 API 載入的清單：成功後不再重打；載入中重複呼叫共用同一個請求；
 * retry 一律重新載入；markStale 後下一次 load 會重新載入（重新載入期間狀態為 loading）。
 */
function useRemoteList<T>(fetchList: () => Promise<T[]>) {
  const items = shallowRef<T[]>([])
  const status = ref<LoadStatus>('idle')
  let pending: Promise<void> | null = null
  let stale = false

  function fetch(): Promise<void> {
    status.value = 'loading'
    stale = false
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
    // 正在載入中：直接共用同一個請求
    if (pending) return pending
    // 已經載過、也沒被標記過期：不再打 API
    if (status.value === 'success' && !stale) return Promise.resolve()
    return fetch()
  }

  // 使用者按「重試」：不管有沒有載過都重新取得
  function retry(): Promise<void> {
    return pending ?? fetch()
  }

  function markStale() {
    stale = true
  }

  return { items, status, load, retry, markStale }
}

/**
 * 幣別與產品商清單只載入一次，營運商 A 頁、確認頁、換幣別確認框共用。
 * 以 factory 注入 API，測試時可以換成假的後端。
 */
export function defineReferenceDataStore(api: ApplyApi) {
  return defineStore('referenceData', () => {
    const currencyList = useRemoteList<CurrencyDto>(() => api.listCurrencies())
    // 產品商拿到後先濾掉不能申請的：非上線中、不支援 2.0、沒有任何原廠支援幣別
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
      /** 後端回報產品商相關錯誤時使用（ticket 08 串接），下次進入營運商 A 頁會重新取得清單。 */
      markVendorsStale: vendorList.markStale,
    }
  })
}
