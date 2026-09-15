/**
 * 栏位验证规则（对应规格 §3，代理代码规则已依最新调整）。
 * 仅做格式验证：营运商代码 2–4 英数、不含 0；代理／总代理代码最多 12 码英文；
 * 账号 6–10 小写英数；IP 仅验格式，不验地区、不做网段显示。
 */

/** 营运商代码：2–4 英数字符，不得含数字 0（送出前应先用 toUpperCase 正规化）。 */
export function isValidOperatorCode(raw: string): boolean {
  const value = raw.trim()
  if (value.length < 2 || value.length > 4) return false
  if (!/^[A-Za-z0-9]+$/.test(value)) return false
  if (value.includes('0')) return false
  return true
}

/** 代理／总代理代码：1–12 码英文字母（不含数字）。 */
export function isValidAgentCode(raw: string): boolean {
  return /^[A-Za-z]{1,12}$/.test(raw.trim())
}

/** 依代码规则正规化输入：转大写、滤掉不允许的字元、裁切到最大长度。 */
export function normalizeCodeInput(
  raw: string,
  opts: { maxLength: number; allowDigits: boolean },
): string {
  const pattern = opts.allowDigits ? /[^A-Z0-9]/g : /[^A-Z]/g
  return raw.toUpperCase().replace(pattern, '').slice(0, opts.maxLength)
}

/** 后台账号：6–10 个小写英数字符。 */
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
  // 仅做宽松格式检查，不验地区 / 网段语意
  return /^[0-9a-fA-F:]+$/.test(token) && token.includes(':')
}

/** 将逗号 / 空白 / 换行分隔的多笔 IP 拆成阵列（去除空白行）。 */
export function splitWhitelist(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** 白名单格式验证：仅验 IP（可含 CIDR），不验地区。空字串视为「尚未填写」，由必填规则另外处理。 */
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

/** Email：选填，填了才验格式。 */
export function isValidEmail(raw: string): boolean {
  if (!raw.trim()) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim())
}
