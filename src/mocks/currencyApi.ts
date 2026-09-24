import type { CurrencyApiResponse } from '@/api/currencyApi'

const MOCK_CURRENCY_RESPONSE = {
  status: 1,
  message: '成功',
  data: {
    list: [
      { code: 'VND', name: '越南盾', memo: '' },
      { code: 'USD', name: '美元', memo: '' },
      { code: 'IDR', name: '印尼盾', memo: '' },
      { code: 'THB', name: '泰币', memo: '' },
      { code: 'CNY', name: '人民币', memo: '' },
      { code: 'MYR', name: '马来币', memo: '' },
      { code: 'KRW', name: '韩圜', memo: '' },
      { code: 'JPY', name: '日圆', memo: '' },
      { code: 'SGD', name: '新加坡币', memo: '' },
      { code: 'EUR', name: '欧元', memo: '' },
      { code: 'COP', name: '哥伦比亚比索', memo: '' },
      { code: 'PEN', name: '秘鲁新索尔', memo: '' },
      { code: 'MXN', name: '墨西哥比索', memo: '' },
      { code: 'MMK', name: '缅甸缅元', memo: '' },
      { code: 'INR', name: '印度卢比', memo: '' },
      { code: 'PHP', name: '菲律宾比索', memo: '' },
      { code: 'AUD', name: '澳币', memo: '' },
      {
        code: 'KVND',
        name: '(K)越南盾',
        memo: '1:1000 由營運商轉換，匯率需要 * 1000',
      },
      {
        code: 'KIDR',
        name: '(K)印尼币',
        memo: '1:1000 由營運商轉換，匯率需要 * 1000',
      },
      { code: 'ARS', name: '阿根廷比索', memo: '' },
      { code: 'HKD', name: '港幣', memo: '' },
      { code: 'CLP', name: '智利披索', memo: '' },
      { code: 'VNDK', name: '越南盾(K)', memo: '1:1000 由GF轉換' },
      { code: 'IDRK', name: '印尼币(K)', memo: '1:1000 由GF轉換' },
      { code: 'BDT', name: '孟加拉幣', memo: '孟加拉幣' },
    ],
  },
} satisfies CurrencyApiResponse

export async function loadMockCurrencies(): Promise<CurrencyApiResponse> {
  return Promise.resolve(MOCK_CURRENCY_RESPONSE)
}
