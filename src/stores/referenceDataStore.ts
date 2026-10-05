import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { ApplyApi } from '@/api/applyApi'
import type { CurrencyDto } from '@/api/types'
import { toCurrencyOptions } from '@/utils/currencyOptions'
import { toSelectableVendors, type Vendor } from '@/utils/vendors'

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * 管理下拉選單資料：幣別清單、產品商清單
 *
 * - 成功取得資料後預設快取，不再重複發送請求
 * - 載入期間若重複呼叫，將自動共用同一個 Promise (De-duplication)
 * - 呼叫 retry() 會強制重新載入
 * - 呼叫 markStale() 後，下一次 load() 將重新向 API 取得最新資料
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
 * 管理全域下拉選單資料
 * - 資料僅載入一次，供「營運商 A 頁」、「確認頁」與「換幣別確認彈窗」跨頁面共用
 * - 採用 Factory 模式注入 API 實例，便於單元測試 (Unit Test) 替換 Mock 資料
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
      /** 後端回報產品商相關錯誤時使用，下次進入營運商 A 頁會重新取得清單。 */
      markVendorsStale: vendorList.markStale,
    }
  })
}
