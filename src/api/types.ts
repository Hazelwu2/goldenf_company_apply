/** 後端 API 回傳的資料型別，欄位名稱與後端一致。 */

export interface CurrencyDto {
  code: string
  name: string
  memo: string
}

export interface CurrencyListData {
  list: CurrencyDto[]
}
