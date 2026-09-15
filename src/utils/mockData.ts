/**
 * 畫面示範用假資料。之後串接後台 API 時，這個檔案可以整份被 API 回應取代，
 * 元件端不需要跟著改（都是走 currency / vendor code 對照）。
 */

import type { SelectOption } from 'naive-ui'

export interface CurrencyOption extends SelectOption {
  value: string
  label: string
}

export const CURRENCIES: CurrencyOption[] = [
  { value: 'CNY', label: 'CNY 人民幣' },
  { value: 'USD', label: 'USD 美金' },
  { value: 'THB', label: 'THB 泰銖' },
  { value: 'VND', label: 'VND 越南盾' },
  { value: 'IDR', label: 'IDR 印尼盾' },
]

export type VendorEnv = 'official_test' | 'official_only'

export interface VendorOption {
  /** 內部代碼，對應送出時的 vendor_codes，畫面上不顯示。 */
  code: string
  /** 中文名稱。多數產品商是國際品牌，中文站台慣例仍顯示原文，故常與 nameEn 相同。 */
  nameZh: string
  /** 英文名稱。 */
  nameEn: string
  env: VendorEnv
  currencies: string[]
}

export const VENDORS: VendorOption[] = [
  {
    code: 'PP',
    nameZh: 'Pragmatic Play',
    nameEn: 'Pragmatic Play',
    env: 'official_test',
    currencies: ['CNY', 'USD', 'THB', 'VND', 'IDR'],
  },
  {
    code: 'PG',
    nameZh: 'PG Soft',
    nameEn: 'PG Soft',
    env: 'official_test',
    currencies: ['CNY', 'USD', 'THB'],
  },
  {
    code: 'JILI',
    nameZh: 'JILI Games',
    nameEn: 'JILI Games',
    env: 'official_test',
    currencies: ['CNY', 'USD', 'VND', 'IDR'],
  },
  {
    code: 'CMD',
    nameZh: 'CMD368',
    nameEn: 'CMD368',
    env: 'official_test',
    currencies: ['USD', 'THB'],
  },
  {
    code: 'SA',
    nameZh: 'SA Gaming',
    nameEn: 'SA Gaming',
    env: 'official_only',
    currencies: ['CNY', 'USD'],
  },
  {
    code: 'AG',
    nameZh: 'AG Asia Gaming',
    nameEn: 'AG Asia Gaming',
    env: 'official_only',
    currencies: ['CNY', 'USD', 'THB'],
  },
  {
    code: 'SEXY',
    nameZh: 'Sexy Baccarat',
    nameEn: 'Sexy Baccarat',
    env: 'official_only',
    currencies: ['CNY', 'USD'],
  },
  {
    code: 'WM',
    nameZh: 'WM Casino',
    nameEn: 'WM Casino',
    env: 'official_only',
    currencies: ['THB', 'VND'],
  },
]

export const OPERATING_MARKETS: string[] = [
  '中國大陸',
  '台灣',
  '越南',
  '泰國',
  '印尼',
  '菲律賓',
  '馬來西亞',
  '柬埔寨',
]
