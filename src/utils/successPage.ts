import { parseConfirmationImageData } from './applicationConfirmationImage'
import type { ConfirmationImageData } from './applicationReview'

export type SuccessPageSource =
  | { kind: 'current' }
  | { kind: 'stored'; data: ConfirmationImageData }
  | { kind: 'none' }

/**
 * 成功頁只顯示已經送出的結果，不會自己送出申請：
 * - 這次有送出（store 有開線編號）→ 顯示這次的結果
 * - 重新整理後 store 清空 → 顯示 sessionStorage 保存的上一次結果
 * - 兩者都沒有 → 沒有可顯示的內容，導回申請首頁
 */
export function resolveSuccessPageSource(
  referenceNo: string | null,
  storedConfirmation: string | null,
): SuccessPageSource {
  if (referenceNo) return { kind: 'current' }
  const stored = parseConfirmationImageData(storedConfirmation)
  return stored ? { kind: 'stored', data: stored } : { kind: 'none' }
}
