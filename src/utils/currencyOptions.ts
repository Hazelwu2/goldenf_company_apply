import type { CurrencyDto } from '@/api/types'

/** 用 type 而不是 interface：NSelect 的 options 需要可接受任意欄位的物件型別。 */
export type CurrencyOption = {
  value: string
  label: string
  memo: string
}

/** 幣別下拉選項顯示「代碼 名稱」，並保留備註供畫面說明。 */
export function toCurrencyOptions(currencies: CurrencyDto[]): CurrencyOption[] {
  return currencies.map((currency) => ({
    value: currency.code,
    label: `${currency.code} ${currency.name}`,
    memo: currency.memo,
  }))
}

export function isCurrencySelectionAvailable(
  options: CurrencyOption[],
  selectedCurrency: string | null,
): boolean {
  return (
    selectedCurrency !== null && options.some((currency) => currency.value === selectedCurrency)
  )
}
