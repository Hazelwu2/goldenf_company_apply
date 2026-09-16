/**
 * 画面示范用假资料。之后串接后台 API 时，这个档案可以整份被 API 回应取代，
 * 元件端不需要跟着改（都是走 currency / vendor code 对照）。
 */

import type { SelectOption } from 'naive-ui'

export interface CurrencyOption extends SelectOption {
  value: string
  label: string
}

export const CURRENCIES: CurrencyOption[] = [
  { value: 'CNY', label: 'CNY 人民币' },
  { value: 'USD', label: 'USD 美金' },
  { value: 'THB', label: 'THB 泰铢' },
  { value: 'VND', label: 'VND 越南盾' },
  { value: 'IDR', label: 'IDR 印尼盾' },
]

export type VendorEnv = 'official_test' | 'official_only'

export interface VendorOption {
  /** 内部代码，对应送出时的 vendor_codes，画面上不显示。 */
  code: string
  /** 中文名称。多数产品商是国际品牌，中文站台惯例仍显示原文，故常与 nameEn 相同。 */
  nameZh: string
  /** 英文名称。 */
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
