import { parseCreateApplicationErrors } from '@/api/applyApi'
import { ApiError } from '@/api/http'
import type { CreateApplicationErrors } from '@/api/types'

export type SubmitErrorLevel = 'A' | 'MA' | 'SMA'

export interface SubmitErrorItem {
  level: SubmitErrorLevel
  fieldLabel: string
  fieldLabelEn: string
  message: string
  messageEn: string
  routePath: string
  /** 沒有對應的可編輯欄位時不帶，跳轉到該角色頁面頂端。 */
  anchorId?: string
}

export interface SubmitErrorGroup {
  level: SubmitErrorLevel
  errors: SubmitErrorItem[]
}

const FORM_LEVEL_ORDER: SubmitErrorLevel[] = ['A', 'MA', 'SMA']

export function groupSubmitErrors(errors: SubmitErrorItem[]): SubmitErrorGroup[] {
  return FORM_LEVEL_ORDER.map((level) => ({
    level,
    errors: errors.filter((error) => error.level === level),
  })).filter((group) => group.errors.length > 0)
}

interface FieldTarget {
  zh: string
  en: string
  /** anchor id 去掉角色前綴的部分，例如 `admin-account`。 */
  anchor: string
}

/** Create API 的 request key → 營運商 A 表單欄位；文字與表單標籤一致。 */
const OPERATOR_FIELDS: Record<string, FieldTarget> = {
  code: { zh: '营运商代码', en: 'Operator Code', anchor: 'code' },
  name: { zh: '营运商名称', en: 'Operator Name', anchor: 'name' },
  admin_account: { zh: '后台账号', en: 'Admin Account', anchor: 'admin-account' },
  bo_whitelist: { zh: '后台白名单', en: 'Admin Whitelist', anchor: 'bo-whitelist' },
  api_whitelist: { zh: 'API 白名单', en: 'API Whitelist', anchor: 'api-whitelist' },
  emails: { zh: '联络 Email', en: 'Contact Email', anchor: 'email' },
  currency: { zh: '币别', en: 'Currency', anchor: 'currency' },
  vendors: { zh: '产品商', en: 'Vendors', anchor: 'vendor' },
  operating_markets: { zh: '运营市场', en: 'Operating Markets', anchor: 'markets' },
  website: { zh: '站台网址', en: 'Website URL', anchor: 'website' },
  test_account: { zh: '测试账号', en: 'Test Account', anchor: 'test-account' },
  test_password: { zh: '测试密码', en: 'Test Password', anchor: 'test-password' },
  chat_software: { zh: '通讯软体', en: 'Chat Software', anchor: 'chat-software' },
  chat_group: { zh: '通讯群组', en: 'Chat Group', anchor: 'chat-group' },
  merchant_remark: { zh: '备注', en: 'Remarks', anchor: 'remark' },
}

/** Create API 的 request key → 代理 MA／總代理 SMA 表單欄位。 */
function agentFields(level: 'MA' | 'SMA'): Record<string, FieldTarget> {
  const role = level === 'MA' ? { zh: '代理', en: 'Agent' } : { zh: '总代理', en: 'Super Agent' }
  return {
    code: { zh: `${role.zh}代码`, en: `${role.en} Code`, anchor: 'code' },
    name: { zh: `${role.zh}名称`, en: `${role.en} Name`, anchor: 'name' },
    admin_account: { zh: '后台账号', en: 'Admin Account', anchor: 'admin-account' },
    bo_whitelist: { zh: '后台 IP 白名单', en: 'Admin IP Whitelist', anchor: 'bo-whitelist' },
    emails: { zh: '联络 Email', en: 'Contact Email', anchor: 'email' },
    merchant_remark: { zh: '备注', en: 'Remarks', anchor: 'remark' },
  }
}

const ROLE_PAGES: Record<
  SubmitErrorLevel,
  { path: string; anchorPrefix: string; fields: Record<string, FieldTarget> }
> = {
  A: { path: '/apply/operator', anchorPrefix: 'field-operator', fields: OPERATOR_FIELDS },
  MA: { path: '/apply/agent/ma', anchorPrefix: 'field-agent-ma', fields: agentFields('MA') },
  SMA: { path: '/apply/agent/sma', anchorPrefix: 'field-agent-sma', fields: agentFields('SMA') },
}

/**
 * 把後端以角色分組的驗證錯誤轉成失敗頁的錯誤清單（依 A → MA → SMA，同角色維持後端順序）。
 * 以「角色 + field」查出欄位中英名稱、頁面與 anchor；中英訊息直接用後端的 message／message_en。
 * 沒有可編輯欄位（例如 parent_code）或查不到的 field：名稱退回原始 field、不帶 anchor。
 */
export function mapSubmitErrors(errors: CreateApplicationErrors): SubmitErrorItem[] {
  return FORM_LEVEL_ORDER.flatMap((level) => {
    const page = ROLE_PAGES[level]
    return (errors[level] ?? []).map((error): SubmitErrorItem => {
      const base = { level, message: error.message, messageEn: error.message_en, routePath: page.path }
      const target = Object.hasOwn(page.fields, error.field) ? page.fields[error.field] : undefined
      if (!target) return { ...base, fieldLabel: error.field, fieldLabelEn: error.field }
      return {
        ...base,
        fieldLabel: target.zh,
        fieldLabelEn: target.en,
        anchorId: `${page.anchorPrefix}-${target.anchor}`,
      }
    })
  })
}

export type SubmitFailure =
  /** 後端驗證失敗且有可顯示的逐筆錯誤：導向失敗頁。 */
  | { kind: 'rejected'; errors: SubmitErrorItem[]; vendorsInvalid: boolean }
  /** 其他失敗：留在確認頁顯示提示，資料保留可再送出。 */
  | { kind: 'notice'; tone: 'error' | 'warning'; zh: string; en: string }

const GENERIC_NOTICE: SubmitFailure = {
  kind: 'notice',
  tone: 'error',
  zh: '送出失败，请稍后再试。',
  en: 'Submission failed. Please try again later.',
}

/** 依 Create API 的錯誤種類決定送出失敗後要去失敗頁，還是留在確認頁顯示哪一種提示。 */
export function resolveSubmitFailure(error: unknown): SubmitFailure {
  if (!(error instanceof ApiError)) return GENERIC_NOTICE

  switch (error.kind) {
    case 'business': {
      const errors = parseCreateApplicationErrors(error.data)
      const items = mapSubmitErrors(errors)
      if (items.length > 0) {
        const vendorsInvalid = FORM_LEVEL_ORDER.some((level) =>
          (errors[level] ?? []).some((item) => item.field === 'vendors'),
        )
        return { kind: 'rejected', errors: items, vendorsInvalid }
      }
      if (!error.message) return GENERIC_NOTICE
      return {
        kind: 'notice',
        tone: 'error',
        // 後端 message 語系不固定，只放在中文行；英文行說明狀況，避免同一句重複兩次
        zh: `送出失败：${error.message}`,
        en: 'Submission failed. See the message above, then correct it and submit again.',
      }
    }
    case 'network':
      return {
        kind: 'notice',
        tone: 'error',
        zh: '网络连线失败，请确认网络后重新送出。',
        en: 'Network connection failed. Please check your connection and submit again.',
      }
    case 'no-response':
      return {
        kind: 'notice',
        tone: 'warning',
        zh: '送出结果不确定，申请可能已建立。重新送出若出现代码重复，请联络客服确认，勿重复申请。',
        en: 'The submission result is uncertain and your application may already have been created. If resubmitting reports a duplicate code, please contact customer support instead of applying again.',
      }
    default:
      return GENERIC_NOTICE
  }
}
