/**
 * 栏位验证规则（对应规格 §3，代理代码规则已依最新调整）。
 * 仅做格式验证：营运商代码 2–4 英数、不含 0；代理／总代理代码 2–12 码英数；
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

/** 代理／总代理代码：2–12 码英数字符（对应 API 规格 §2.3）。 */
export function isValidAgentCode(raw: string): boolean {
  return /^[A-Za-z0-9]{2,12}$/.test(raw.trim())
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

/**
 * 将贴上或输入的文字拆成多笔项目：以逗号、分号、空白或换行分隔，去除空白项。
 * 支援分号是因为从 Outlook 等客户端复制收件者时会以分号分隔。
 * IP 与 Email 都不含这些字元，故可共用同一组分隔符。
 */
export function splitEntries(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
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

/** 白名单：至少一笔，且每一笔都必须合法。 */
export function areValidWhitelist(entries: string[]): boolean {
  if (entries.length === 0) return false
  return entries.every(isValidWhitelistEntry)
}

/** 单笔 Email 格式验证。 */
export function isValidEmailEntry(token: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(token.trim())
}

/** 联络 Email：选填，可填多笔；只要有填，每一笔都必须合法。 */
export function areValidEmails(emails: string[]): boolean {
  return emails.every(isValidEmailEntry)
}

/** 站台网址、测试账号、测试密码必须同时填写，或同时留空。 */
export function hasCompleteWebsiteCredentials(
  website: string,
  testAccount: string,
  testPassword: string,
): boolean {
  const values = [website, testAccount, testPassword].map((value) => value.trim())
  return values.every(Boolean) || values.every((value) => !value)
}

/**
 * 站台区块整体规则（站台状态 + 三个栏位一起判断）：
 * - 已有网站：站台网址、测试账号、测试密码三者必须同时填写。
 * - 尚在开发中：三者必须同时留空。
 * - 尚未选择状态：一律视为未完成。
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
  return status === 'live' ? isFilled : !isFilled
}

/**
 * 通讯软体允许值，直接送出至 Create API 的 chat_software。
 * 大小写依 API 规格：`Teams` 首字大写、`telegram` 全小写。
 */
export const CHAT_SOFTWARE_OPTIONS = ['Teams', 'telegram'] as const

export type ChatSoftware = (typeof CHAT_SOFTWARE_OPTIONS)[number]

/** 通讯软体：必填，且只接受规格允许的两个值（区分大小写）。 */
export function isValidChatSoftware(value: string | null): boolean {
  if (value === null) return false
  return (CHAT_SOFTWARE_OPTIONS as readonly string[]).includes(value)
}

/** 通讯群组：必填，去除前后空白後不可为空。 */
export function isValidChatGroup(raw: string): boolean {
  return raw.trim().length > 0
}
