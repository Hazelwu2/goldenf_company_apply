import type { AgentFormState, OperatorFormState } from '@/types/apply'
import {
  areValidEmails,
  areValidWhitelist,
  isValidAdminAccount,
  isValidAgentCode,
  isValidChatGroup,
  isValidChatSoftware,
  isValidOperatorCode,
  isValidWebsiteUrl,
} from '@/utils/validators'

export interface InvalidFieldTarget {
  key: string
  id: string
}

export function getFirstInvalidOperatorField(
  form: OperatorFormState,
): InvalidFieldTarget | null {
  const checks: Array<[boolean, InvalidFieldTarget]> = [
    [Boolean(form.currency), { key: 'currency', id: 'field-operator-currency' }],
    [form.vendorCodes.length > 0, { key: 'vendors', id: 'field-operator-vendor' }],
    [isValidOperatorCode(form.code), { key: 'code', id: 'field-operator-code' }],
    [
      isValidAdminAccount(form.adminAccount),
      { key: 'adminAccount', id: 'field-operator-admin-account' },
    ],
    [
      areValidWhitelist(form.boWhitelist),
      { key: 'boWhitelist', id: 'field-operator-bo-whitelist' },
    ],
    [
      areValidWhitelist(form.apiWhitelist),
      { key: 'apiWhitelist', id: 'field-operator-api-whitelist' },
    ],
    [areValidEmails(form.emails), { key: 'emails', id: 'field-operator-email' }],
    [
      isValidChatSoftware(form.chatSoftware),
      { key: 'chatSoftware', id: 'field-operator-chat-software' },
    ],
    [
      isValidChatGroup(form.chatGroup),
      { key: 'chatGroup', id: 'field-operator-chat-group' },
    ],
    [
      form.operatingMarkets.length > 0,
      { key: 'operatingMarkets', id: 'field-operator-markets' },
    ],
    [Boolean(form.websiteStatus), { key: 'websiteStatus', id: 'field-operator-website-status' }],
  ]

  for (const [valid, target] of checks) {
    if (!valid) return target
  }

  if (form.websiteStatus === 'live') {
    if (!isValidWebsiteUrl(form.website)) {
      return { key: 'website', id: 'field-operator-website' }
    }
    if (!form.testAccount.trim()) {
      return { key: 'testAccount', id: 'field-operator-test-account' }
    }
    if (!form.testPassword.trim()) {
      return { key: 'testPassword', id: 'field-operator-test-password' }
    }
  }

  return null
}

export function getFirstInvalidAgentField(
  form: AgentFormState,
  level: 'MA' | 'SMA' = 'MA',
): InvalidFieldTarget | null {
  const prefix = `field-agent-${level.toLowerCase()}`
  const checks: Array<[boolean, InvalidFieldTarget]> = [
    [isValidAgentCode(form.code), { key: 'code', id: `${prefix}-code` }],
    [
      isValidAdminAccount(form.adminAccount),
      { key: 'adminAccount', id: `${prefix}-admin-account` },
    ],
    [
      areValidWhitelist(form.boWhitelist),
      { key: 'boWhitelist', id: `${prefix}-bo-whitelist` },
    ],
    [areValidEmails(form.emails), { key: 'emails', id: `${prefix}-email` }],
  ]

  for (const [valid, target] of checks) {
    if (!valid) return target
  }

  return null
}
