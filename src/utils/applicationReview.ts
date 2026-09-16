import { operatingMarketDisplayLabel } from './operatingMarkets.ts'

export type ReviewFieldKind = 'text' | 'tags' | 'secret' | 'link'

export interface ReviewField {
  key: string
  labelZh: string
  labelEn: string
  value: string | string[]
  kind?: ReviewFieldKind
  secretValue?: string
}

export interface ReviewSection {
  level: 'A' | 'MA' | 'SMA'
  titleZh: string
  titleEn: string
  editPath: string
  fields: ReviewField[]
}

interface OperatorReviewSource {
  currency: string | null
  vendorCodes: string[]
  code: string
  name: string
  adminAccount: string
  boWhitelist: string[]
  apiWhitelist: string[]
  emails: string[]
  operatingMarkets: string[]
  websiteStatus: 'live' | 'in_progress' | null
  website: string
  testAccount: string
  testPassword: string
  remark: string
}

interface AgentReviewSource {
  code: string
  name: string
  adminAccount: string
  boWhitelist: string[]
  emails: string[]
  sameAsA: boolean
  remark: string
}

interface ApplicationReviewSource {
  levels: Array<'A' | 'MA' | 'SMA'>
  operator: OperatorReviewSource
  agentMA: AgentReviewSource
  agentSMA: AgentReviewSource
  vendorNames: Record<string, string>
}

export interface ConfirmationImageData {
  referenceNo: string
  submittedAt: string
  records: ConfirmationRecord[]
}

export interface ConfirmationRecord {
  level: 'A' | 'MA' | 'SMA'
  role: string
  code: string
}

interface ConfirmationImageSource {
  referenceNo: string
  submittedAt: string
  levels: Array<'A' | 'MA' | 'SMA'>
  operator: OperatorReviewSource
  agentMA: AgentReviewSource
  agentSMA: AgentReviewSource
}

const levelMeta = {
  A: { titleZh: '营运商 A', titleEn: 'Operator A', editPath: '/apply/operator' },
  MA: { titleZh: '代理 MA', titleEn: 'Agent MA', editPath: '/apply/agent/ma' },
  SMA: { titleZh: '总代理 SMA', titleEn: 'Super Agent SMA', editPath: '/apply/agent/sma' },
} as const

const hierarchyOrder = ['SMA', 'MA', 'A'] as const

function addField(fields: ReviewField[], field: ReviewField) {
  const hasValue = Array.isArray(field.value) ? field.value.length > 0 : field.value.trim().length > 0
  if (hasValue) fields.push(field)
}

function buildOperatorFields(
  operator: OperatorReviewSource,
  vendorNames: Record<string, string>,
): ReviewField[] {
  const fields: ReviewField[] = []
  addField(fields, {
    key: 'currency',
    labelZh: '币别',
    labelEn: 'Currency',
    value: operator.currency ?? '',
  })
  addField(fields, {
    key: 'vendors',
    labelZh: '产品商',
    labelEn: 'Vendors',
    value: operator.vendorCodes.map((code) => vendorNames[code] ?? code),
    kind: 'tags',
  })
  addField(fields, {
    key: 'code',
    labelZh: '营运商代码',
    labelEn: 'Operator Code',
    value: operator.code,
  })
  addField(fields, {
    key: 'name',
    labelZh: '营运商名称',
    labelEn: 'Operator Name',
    value: operator.name,
  })
  addField(fields, {
    key: 'adminAccount',
    labelZh: '后台账号',
    labelEn: 'Admin Account',
    value: operator.adminAccount,
  })
  addField(fields, {
    key: 'boWhitelist',
    labelZh: '后台白名单',
    labelEn: 'Admin Whitelist',
    value: operator.boWhitelist,
    kind: 'tags',
  })
  addField(fields, {
    key: 'apiWhitelist',
    labelZh: 'API 白名单',
    labelEn: 'API Whitelist',
    value: operator.apiWhitelist,
    kind: 'tags',
  })
  addField(fields, {
    key: 'email',
    labelZh: '联络 Email',
    labelEn: 'Contact Email',
    value: operator.emails,
    kind: 'tags',
  })
  addField(fields, {
    key: 'operatingMarkets',
    labelZh: '运营市场',
    labelEn: 'Operating Markets',
    value: operator.operatingMarkets.map(operatingMarketDisplayLabel),
    kind: 'tags',
  })
  addField(fields, {
    key: 'websiteStatus',
    labelZh: '站台状态',
    labelEn: 'Website Status',
    value:
      operator.websiteStatus === 'live'
        ? '已有网站 / Website Live'
        : operator.websiteStatus === 'in_progress'
          ? '尚在开发中 / In Development'
          : '',
  })

  if (operator.websiteStatus === 'live') {
    addField(fields, {
      key: 'website',
      labelZh: '站台网址',
      labelEn: 'Website URL',
      value: operator.website,
      kind: 'link',
    })
    addField(fields, {
      key: 'testAccount',
      labelZh: '测试账号',
      labelEn: 'Test Account',
      value: operator.testAccount,
    })
    addField(fields, {
      key: 'testPassword',
      labelZh: '测试密码',
      labelEn: 'Test Password',
      value: operator.testPassword ? '••••••••' : '',
      kind: 'secret',
      secretValue: operator.testPassword,
    })
  }

  addField(fields, {
    key: 'remark',
    labelZh: '备注',
    labelEn: 'Remarks',
    value: operator.remark,
  })
  return fields
}

function buildAgentFields(level: 'MA' | 'SMA', agent: AgentReviewSource): ReviewField[] {
  const meta = levelMeta[level]
  const fields: ReviewField[] = []
  addField(fields, {
    key: 'code',
    labelZh: `${meta.titleZh}代码`,
    labelEn: `${meta.titleEn} Code`,
    value: agent.code,
  })
  addField(fields, {
    key: 'name',
    labelZh: `${meta.titleZh}名称`,
    labelEn: `${meta.titleEn} Name`,
    value: agent.name,
  })
  addField(fields, {
    key: 'adminAccount',
    labelZh: '后台账号',
    labelEn: 'Admin Account',
    value: agent.adminAccount,
  })
  addField(fields, {
    key: 'boWhitelist',
    labelZh: '后台 IP 白名单',
    labelEn: 'Admin IP Whitelist',
    value: agent.boWhitelist,
    kind: 'tags',
  })
  addField(fields, {
    key: 'email',
    labelZh: '联络 Email',
    labelEn: 'Contact Email',
    value: agent.emails,
    kind: 'tags',
  })
  addField(fields, {
    key: 'remark',
    labelZh: '备注',
    labelEn: 'Remarks',
    value: agent.remark,
  })
  return fields
}

export function buildApplicationReview(source: ApplicationReviewSource): ReviewSection[] {
  return source.levels.map((level) => {
    const meta = levelMeta[level]
    return {
      level,
      ...meta,
      fields:
        level === 'A'
          ? buildOperatorFields(source.operator, source.vendorNames)
          : buildAgentFields(level, level === 'MA' ? source.agentMA : source.agentSMA),
    }
  })
}

export function buildConfirmationImageData(source: ConfirmationImageSource): ConfirmationImageData {
  return {
    referenceNo: source.referenceNo,
    submittedAt: source.submittedAt,
    records: hierarchyOrder.filter((level) => source.levels.includes(level)).map((level) => {
      const data = level === 'A' ? source.operator : level === 'MA' ? source.agentMA : source.agentSMA
      return {
        level,
        role: `${levelMeta[level].titleZh} / ${levelMeta[level].titleEn}`,
        code: data.code || '—',
      }
    }),
  }
}
