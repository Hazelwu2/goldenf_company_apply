import { applyApi } from '@/api/client'
import { defineReferenceDataStore } from './referenceDataStore'

/** 畫面使用的參考資料 store（幣別、產品商）。 */
export const useReferenceDataStore = defineReferenceDataStore(applyApi)
