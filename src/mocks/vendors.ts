import type { VendorDto } from '@/api/types'

/** 後端 currency 是以幣別代碼為 key 的物件；vendor 為空字串代表原廠不支援該幣別。 */
function currencies(...codes: string[]): VendorDto['currency'] {
  return Object.fromEntries(
    codes.map((code) => [code, { vendor: code, rate: '', gf_support: false, decimal: '' }]),
  )
}

function unsupported(...codes: string[]): VendorDto['currency'] {
  return Object.fromEntries(
    codes.map((code) => [code, { vendor: '', rate: '', gf_support: false, decimal: '' }]),
  )
}

/**
 * 產品商清單假資料，格式比照後端 /vendor/list。
 * 刻意涵蓋各種篩選情境：有／沒有測試環境、下線、不支援 2.0、沒有任何原廠幣別、
 * currency 裡夾帶空字串，以及以獨立產品商出現的 Motivation。
 */
export const MOCK_VENDORS: VendorDto[] = [
  {
    code: 'PP',
    name: 'Pragmatic Play',
    status: 'online',
    demo: true,
    support: { v2: true, v3: true },
    currency: currencies('CNY', 'USD', 'THB', 'VND', 'IDR'),
  },
  {
    code: 'PG',
    name: 'PG Soft',
    status: 'online',
    demo: true,
    support: { v2: true, v3: false },
    currency: currencies('CNY', 'USD', 'THB'),
  },
  {
    code: 'JILI',
    name: 'JILI Games',
    status: 'online',
    demo: true,
    support: { v2: true, v3: false },
    currency: currencies('CNY', 'USD', 'VND', 'IDR'),
  },
  {
    code: 'CMD',
    name: 'CMD368',
    status: 'online',
    demo: true,
    support: { v2: true, v3: false },
    currency: { ...currencies('USD', 'THB'), ...unsupported('VND') },
  },
  {
    code: 'motivation',
    name: 'Motivation',
    status: 'online',
    demo: true,
    support: { v2: true, v3: false },
    currency: currencies('CNY', 'USD', 'VND'),
  },
  {
    code: 'SA',
    name: 'SA Gaming',
    status: 'online',
    demo: false,
    support: { v2: true, v3: false },
    currency: currencies('CNY', 'USD'),
  },
  {
    code: 'AG',
    name: 'AG Asia Gaming',
    status: 'online',
    demo: false,
    support: { v2: true, v3: false },
    currency: currencies('CNY', 'USD', 'THB'),
  },
  {
    code: 'SEXY',
    name: 'Sexy Baccarat',
    status: 'online',
    demo: false,
    support: { v2: true, v3: false },
    currency: currencies('CNY', 'USD'),
  },
  {
    code: 'WM',
    name: 'WM Casino',
    status: 'online',
    demo: false,
    support: { v2: true, v3: false },
    currency: currencies('THB', 'VND'),
  },
  {
    code: 'betby',
    name: 'BETBY 體育／BETBY',
    status: 'offline',
    demo: true,
    support: { v2: true, v3: false },
    currency: currencies('VND', 'USD'),
  },
  {
    code: 'EVO',
    name: 'Evolution',
    status: 'online',
    demo: true,
    support: { v2: false, v3: true },
    currency: currencies('CNY', 'USD'),
  },
  {
    code: 'KY',
    name: 'KY 棋牌',
    status: 'online',
    demo: true,
    support: { v2: true, v3: false },
    currency: unsupported('CNY', 'USD'),
  },
]
