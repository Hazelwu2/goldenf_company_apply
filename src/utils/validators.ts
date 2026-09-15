/**
 * 欄位驗證規則（對應規格 §3，代理代碼規則已依最新調整）。
 * 僅做格式驗證：營運商代碼 2–4 英數、不含 0；代理／總代理代碼最多 12 碼英文；
 * 帳號 6–10 小寫英數；IP 僅驗格式，不驗地區、不做網段顯示。
 */

/** 營運商代碼：2–4 英數字符，不得含數字 0（送出前應先用 toUpperCase 正規化）。 */
export function isValidOperatorCode(raw: string): boolean {
  const value = raw.trim()
  if (value.length < 2 || value.length > 4) return false
  if (!/^[A-Za-z0-9]+$/.test(value)) return false
  if (value.includes('0')) return false
  return true
}

/** 代理／總代理代碼：1–12 碼英文字母（不含數字）。 */
export function isValidAgentCode(raw: string): boolean {
  return /^[A-Za-z]{1,12}$/.test(raw.trim())
}

/** 依代碼規則正規化輸入：轉大寫、濾掉不允許的字元、裁切到最大長度。 */
export function normalizeCodeInput(
  raw: string,
  opts: { maxLength: number; allowDigits: boolean },
): string {
  const pattern = opts.allowDigits ? /[^A-Z0-9]/g : /[^A-Z]/g
  return raw.toUpperCase().replace(pattern, '').slice(0, opts.maxLength)
}

/** 後台帳號：6–10 個小寫英數字符。 */
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

/** 將逗號 / 空白 / 換行分隔的多筆 IP 拆成陣列（去除空白行）。 */
export function splitWhitelist(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
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

export function isValidWhitelist(raw: string): boolean {
  const entries = splitWhitelist(raw)
  if (entries.length === 0) return false
  return entries.every(isValidWhitelistEntry)
}

/** Email：選填，填了才驗格式。 */
export function isValidEmail(raw: string): boolean {
  if (!raw.trim()) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim())
}
