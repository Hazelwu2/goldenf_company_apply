/*
  申請開線表單 API 模組

  🔷 此檔案核心任務
  1. 統一管理 API 請求，將用到的 API 與發送邏輯集中處理
  2. 做嚴格的後端資料驗證：若後端給了垃圾資料或結構有變，直接打包成 null，避免前端頁面爆掉

  🔷 相關型別與函式
  - listCurrencies()：取得幣別清單
  - listVendors()：取得產品商清單
  - createApplication()：送出申請表單
*/

import type { HttpClient } from './http'
import type {
  ApplyRoleKey,
  CreateApplicationBody,
  CreateApplicationErrorDto,
  CreateApplicationErrors,
  CreateApplicationData,
  CurrencyDto,
  CurrencyListData,
  VendorDto,
} from './types'

// 檢查傳進來的變數是否為標準的物件，且不能是 null（typeof null === 'object'）
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// 檢查後端回傳的幣別資料
function parseCurrencyList(data: unknown): CurrencyListData | null {
  // 確保回傳的是物件，且有 list 陣列
  if (!isRecord(data) || !Array.isArray(data.list)) return null

  const list = data.list as unknown[]
  // 裡面的每一項都必須包含 code（字串）、name（字串）、memo（字串）。全部符合才過關，否則退回 null
  const valid = list.every(
    (item): item is CurrencyDto =>
      isRecord(item) &&
      typeof item.code === 'string' &&
      typeof item.name === 'string' &&
      typeof item.memo === 'string',
  )
  return valid ? { list: list as CurrencyDto[] } : null
}

/**
 * 驗證產品商清單
 * 檢查畫面需要的必填欄位：code, name, status, demo, support, currency
 *
 */
function isVendorDto(item: unknown): item is VendorDto {
  return (
    isRecord(item) &&
    typeof item.code === 'string' &&
    typeof item.name === 'string' &&
    typeof item.status === 'string' &&
    typeof item.demo === 'boolean' &&
    isRecord(item.support) &&
    isRecord(item.currency) &&
    !Array.isArray(item.currency)
  )
}

/**
 * 解析 API 回傳的 Vendor 清單。
 * 需確保包含 `list` 陣列且每筆資料皆符合 VendorDto 規格，否則判定無效並回傳 null。
 */
function parseVendorList(data: unknown): { list: VendorDto[] } | null {
  if (!isRecord(data) || !Array.isArray(data.list)) return null
  const list = data.list as unknown[]
  return list.every(isVendorDto) ? { list } : null
}

/**
 * 解析並驗證建立成功的回傳資料。
 * 需確保包含有效的開線編號（reference_no）、建立時間（created_at）與 records 陣列，
 * 任一欄位型別不合即判定驗證失敗並回傳 null。
 */
function parseCreatedApplication(data: unknown): CreateApplicationData | null {
  // 若傳入資料不是物件，判斷無效回傳 null
  if (!isRecord(data)) return null

  const { reference_no: referenceNo, created_at: createdAt, records } = data

  // 驗證開線編號：必須為非空白字串
  if (typeof referenceNo !== 'string' || referenceNo === '') return null
  // 驗證建立時間：必須為合法的有限數字（Timestamp）
  if (typeof createdAt !== 'number' || !Number.isFinite(createdAt)) return null
  // 驗證紀錄清單：必須為陣列
  if (!Array.isArray(records)) return null

  // 通過所有型別驗證後，轉型為 CreateApplicationData 回傳
  return data as unknown as CreateApplicationData
}

const ROLE_KEYS: ApplyRoleKey[] = ['A', 'MA', 'SMA']

function isCreateApplicationError(item: unknown): item is CreateApplicationErrorDto {
  return (
    isRecord(item) &&
    typeof item.code === 'string' &&
    typeof item.field === 'string' &&
    typeof item.message === 'string' &&
    typeof item.message_en === 'string'
  )
}

/**
 * 讀取 Create API 失敗回應（business 錯誤的 data）中的 `errors`。
 * 未知的角色 key、不是陣列的值、欄位不齊或型別不對的項目一律丟棄；
 * 沒有可用的錯誤時回傳空物件，由畫面改顯示後端 message。
 */
export function parseCreateApplicationErrors(data: unknown): CreateApplicationErrors {
  // 建立最終要回傳的錯誤對照表物件
  const result: CreateApplicationErrors = {}

  // 驗證 errors 結構：必須存在且為物件（不可為 null 或陣列），否則直接回傳空物件
  if (!isRecord(data) || !isRecord(data.errors) || Array.isArray(data.errors)) return result

  // 依序檢查每個合法的角色 Key ('A', 'MA', 'SMA')
  for (const role of ROLE_KEYS) {
    const items = data.errors[role]

    // 若該角色的錯誤清單不是陣列，直接跳過不處理
    if (!Array.isArray(items)) continue

    // 過濾並僅保留符合規格的錯誤項目（自動濾除格式不對的欄位）
    const valid = items.filter(isCreateApplicationError)

    // 若有有效的錯誤項目，才寫入結果物件中
    if (valid.length > 0) result[role] = valid
  }

  // 回傳整理完成的錯誤物件（若無任何有效錯誤則為 `{}`）
  return result
}

/** 客戶表單會用到的 API；網址只在這裡定義。 */
export function createApplyApi(http: HttpClient) {
  return {
    // [幣別]下拉選單資料：請求幣值轉換清單 API
    async listCurrencies(): Promise<CurrencyDto[]> {
      const data = await http.request(
        { method: 'post', url: '/api/v1/company_apply/exchange/list', data: {} },
        parseCurrencyList,
      )
      return data.list
    },

    // [產品商]下拉選單資料：請求產品商清單 API
    async listVendors(): Promise<VendorDto[]> {
      const data = await http.request(
        { method: 'get', url: '/api/v1/company_apply/vendor/list' },
        parseVendorList,
      )
      // 只需要清單本身；外層的分頁欄位用不到
      return data.list
    },

    // 送出表單：請求建立申請單 API
    createApplication(body: CreateApplicationBody): Promise<CreateApplicationData> {
      return http.request(
        { method: 'post', url: '/api/v1/company_apply/create', data: body },
        parseCreatedApplication,
      )
    },
  }
}

export type ApplyApi = ReturnType<typeof createApplyApi>
