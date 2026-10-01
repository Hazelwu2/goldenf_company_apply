/**
 * 欄位驗證規則（對應規格 §3，代理代碼規則已依最新調整）。
 * 僅做格式驗證：營運商代碼 2–4 英數、不含 0；代理／總代理代碼 2–12 碼英數；
 * 帳號 6–10 小寫英數；IP 僅驗格式，不驗地區、不做網段顯示。
 */

export type OperatorCodeValidationError =
  | 'required'
  | 'invalid-length'
  | 'invalid-characters'
  | 'contains-zero'

/** 營運商代碼錯誤類型，供驗證邏輯與欄位提示共用。 */
export function getOperatorCodeValidationError(
  raw: string,
): OperatorCodeValidationError | null {
  const value = raw.trim()
  if (!value) return 'required'
  if (value.length < 2 || value.length > 4) return 'invalid-length'
  if (!/^[A-Za-z0-9]+$/.test(value)) return 'invalid-characters'
  if (value.includes('0')) return 'contains-zero'
  return null
}

/** 營運商代碼：2–4 個英數字元，不得包含數字 0（送出前應先用 toUpperCase 正規化）。 */
export function isValidOperatorCode(raw: string): boolean {
  return getOperatorCodeValidationError(raw) === null
}

/** 代理／總代理代碼：2–12 碼英數字元（對應 API 規格 §2.3）。 */
export function isValidAgentCode(raw: string): boolean {
  return /^[A-Za-z0-9]{2,12}$/.test(raw.trim())
}

/** 依代碼規則正規化輸入：轉大寫、濾掉不允許的字元、裁切到最大長度。 */
export function normalizeCodeInput(
  raw: string,
  opts: { maxLength: number; allowDigits: boolean },
): string {
  const pattern = opts.allowDigits ? /[^A-Z0-9]/g : /[^A-Z]/g
  return raw.toUpperCase().replace(pattern, '').slice(0, opts.maxLength)
}

/** 後台帳號：6–10 個小寫英數字元。 */
export function isValidAdminAccount(raw: string): boolean {
  return /^[a-z0-9]{6,10}$/.test(raw.trim())
}

function isValidIPv4(token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 4) return false
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false
    const n = Number(part)
    return n >= 0 && n <= 255 && String(n) === part
  })
}

function isValidIPv6(token: string): boolean {
  // 僅做寬鬆格式檢查，不驗地區 / 網段語意
  return /^[0-9a-fA-F:]+$/.test(token) && token.includes(':')
}

/**
 * 將貼上或輸入的文字拆成多筆項目：以逗號、分號、空白或換行分隔，去除空白項。
 * 支援分號是因為從 Outlook 等用戶端複製收件者時會以分號分隔。
 * IP 與 Email 都不含這些字元，故可共用同一組分隔符號。
 */
export function splitEntries(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** 白名單格式驗證：僅驗 IP（可含 CIDR），不驗地區。空字串視為「尚未填寫」，由必填規則另外處理。 */
export function isValidWhitelistEntry(token: string): boolean {
  const [ip = '', cidr] = token.split('/')
  if (cidr !== undefined) {
    if (!/^\d{1,2}$/.test(cidr)) return false
    const n = Number(cidr)
    if (n < 0 || n > 128) return false
  }
  return isValidIPv4(ip) || isValidIPv6(ip)
}

/** 白名單：至少一筆，每一筆都必須合法。 */
export function areValidWhitelist(entries: string[]): boolean {
  if (entries.length === 0) return false
  return entries.every(isValidWhitelistEntry)
}

/** 單筆 Email 格式驗證。 */
export function isValidEmailEntry(token: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(token.trim())
}

/** 聯絡 Email：選填，可填多筆；只要有填，每一筆都必須合法。 */
export function areValidEmails(emails: string[]): boolean {
  return emails.every(isValidEmailEntry)
}

/**
 * 站台網址格式：必須是 http／https 的完整網址，且主機名稱含點號。
 * 只接受這兩種協定，避免把 javascript: 之類的可執行內容當成網址存下來。
 */
export function isValidWebsiteUrl(raw: string): boolean {
  const value = raw.trim()
  if (!value) return false

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
  const host = url.hostname
  return host.includes('.') && !host.startsWith('.') && !host.endsWith('.')
}

/** 站台網址、測試帳號、測試密碼必須同時填寫，或同時留空。 */
export function hasCompleteWebsiteCredentials(
  website: string,
  testAccount: string,
  testPassword: string,
): boolean {
  const values = [website, testAccount, testPassword].map((value) => value.trim())
  return values.every(Boolean) || values.every((value) => !value)
}

/**
 * 站台區塊整體規則（站台狀態 + 三個欄位一起判斷）：
 * - 已有網站：站台網址、測試帳號、測試密碼三者必須同時填寫，且網址格式須合法。
 * - 尚在開發中：三者必須同時留空。
 * - 尚未選擇狀態：一律視為未完成。
 */
export function isValidWebsiteSection(
  status: 'live' | 'in_progress' | null,
  website: string,
  testAccount: string,
  testPassword: string,
): boolean {
  if (!status) return false
  if (!hasCompleteWebsiteCredentials(website, testAccount, testPassword)) return false
  const isFilled = Boolean(website.trim())
  if (status !== 'live') return !isFilled
  // 已有網站：網址必須是合法的 http／https 網址，不能只是有填入。
  return isFilled && isValidWebsiteUrl(website)
}

/**
 * 通訊軟體允許值，直接送出至 Create API 的 chat_software。
 * API 規格只接受全小寫的 `teams`、`telegram`。
 */
export const CHAT_SOFTWARE_OPTIONS = ['teams', 'telegram'] as const

export type ChatSoftware = (typeof CHAT_SOFTWARE_OPTIONS)[number]

/** 通訊軟體：必填，且只接受規格允許的兩個值（區分大小寫）。 */
export function isValidChatSoftware(value: string | null): boolean {
  if (value === null) return false
  return (CHAT_SOFTWARE_OPTIONS as readonly string[]).includes(value)
}

/** 通訊群組：必填，移除前後空白後不可為空。 */
export function isValidChatGroup(raw: string): boolean {
  return raw.trim().length > 0
}

/** 客戶備註上限，前後端一致（API 規格 merchant_memo 最多 250 個字）。 */
export const REMARK_MAX_LENGTH = 250

/**
 * 以字元（code point）計算，emoji 算一個字；表單驗證與送出前再檢查一次使用。
 * 輸入框用原生 maxlength（emoji 算兩個字），只會比後端更早擋住，不會超過上限。
 */
export function countRemarkChars(value: string): number {
  return Array.from(value).length
}

export function isValidRemark(value: string): boolean {
  return countRemarkChars(value) <= REMARK_MAX_LENGTH
}
