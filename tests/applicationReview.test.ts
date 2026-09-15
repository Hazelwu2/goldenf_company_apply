import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildApplicationReview,
  buildConfirmationImageData,
} from '../src/utils/applicationReview.ts'
import {
  createConfirmationSvg,
  parseConfirmationImageData,
} from '../src/utils/applicationConfirmationImage.ts'

const operator = {
  currency: 'CNY',
  vendorCodes: ['PP', 'JILI'],
  code: 'GFA1',
  name: '',
  adminAccount: 'gfdemo01',
  boWhitelist: '203.0.113.10, 198.51.100.0/24',
  apiWhitelist: '203.0.113.20',
  email: 'ops@example.com',
  operatingMarkets: ['中国大陆', '越南'],
  websiteStatus: 'live' as const,
  website: 'https://example.com',
  testAccount: 'test-user',
  testPassword: 'secret-password',
  remark: '',
}

const agentMA = {
  code: 'MAGOLD',
  name: 'Gold Agent',
  adminAccount: 'gfma0001',
  boWhitelist: '203.0.113.30',
  email: '',
  sameAsA: false,
  remark: 'Priority setup',
}

const agentSMA = {
  code: '',
  name: '',
  adminAccount: '',
  boWhitelist: '',
  email: '',
  sameAsA: false,
  remark: '',
}

test('review includes every submitted non-empty field and masks the password', () => {
  const sections = buildApplicationReview({
    levels: ['A', 'MA'],
    operator,
    agentMA,
    agentSMA,
    vendorNames: { PP: 'Pragmatic Play', JILI: 'JILI Games' },
  })

  assert.equal(sections.length, 2)
  assert.deepEqual(
    sections[0]?.fields.map((field) => field.key),
    [
      'currency',
      'vendors',
      'code',
      'adminAccount',
      'boWhitelist',
      'apiWhitelist',
      'email',
      'operatingMarkets',
      'websiteStatus',
      'website',
      'testAccount',
      'testPassword',
    ],
  )
  assert.deepEqual(sections[0]?.fields[1]?.value, ['Pragmatic Play', 'JILI Games'])
  assert.equal(sections[0]?.fields.at(-1)?.value, '••••••••')
  assert.equal(sections[0]?.fields.at(-1)?.secretValue, 'secret-password')
  assert.equal(sections[1]?.titleEn, 'Agent MA')
  assert.equal(sections[1]?.fields.some((field) => field.key === 'email'), false)
  assert.equal(sections[1]?.fields.some((field) => field.key === 'remark'), true)
})

test('review omits website credentials when the website is still in development', () => {
  const sections = buildApplicationReview({
    levels: ['A'],
    operator: { ...operator, websiteStatus: 'in_progress' },
    agentMA,
    agentSMA,
    vendorNames: {},
  })

  const keys = sections[0]?.fields.map((field) => field.key)
  assert.equal(keys?.includes('website'), false)
  assert.equal(keys?.includes('testAccount'), false)
  assert.equal(keys?.includes('testPassword'), false)
})

test('download image data contains the reference summary but excludes sensitive fields', () => {
  const imageData = buildConfirmationImageData({
    referenceNo: 'GF-MA-123456',
    submittedAt: '2026/09/15 14:30',
    levels: ['A', 'MA'],
    operator,
    agentMA,
    agentSMA,
  })

  assert.deepEqual(imageData.records, [
    { level: 'MA', role: '代理 MA / Agent MA', code: 'MAGOLD' },
    { level: 'A', role: '营运商 A / Operator A', code: 'GFA1' },
  ])
  assert.equal(JSON.stringify(imageData).includes('secret-password'), false)
  assert.equal(JSON.stringify(imageData).includes('203.0.113.10'), false)
  assert.equal(JSON.stringify(imageData).includes('gfdemo01'), false)
})

test('confirmation image markup includes bilingual title and the application number', () => {
  const svg = createConfirmationSvg({
    referenceNo: 'GF-MA-123456',
    submittedAt: '2026/09/15 14:30',
    records: [
      { level: 'MA', role: '代理 MA / Agent MA', code: 'MAGOLD' },
      { level: 'A', role: '营运商 A / Operator A', code: 'GFA1' },
    ],
  })

  assert.match(svg, /开线确认单/)
  assert.match(svg, /Application Confirmation/)
  assert.match(svg, /组合摘要 \/ Application Summary/)
  assert.match(svg, /GF-MA-123456/)
  assert.match(svg, /代理 MA \/ Agent MA — \(MAGOLD\)/)
  assert.match(svg, /└─ 营运商 A \/ Operator A — \(GFA1\)/)
})

test('confirmation image markup escapes user-provided text', () => {
  const svg = createConfirmationSvg({
    referenceNo: '<script>alert(1)</script>',
    submittedAt: '2026/09/15',
    records: [{ level: 'A', role: '营运商 A / Operator A', code: 'A&B' }],
  })

  assert.equal(svg.includes('<script>'), false)
  assert.match(svg, /&lt;script&gt;/)
  assert.match(svg, /A&amp;B/)
})

test('stored confirmation parser accepts the safe summary and rejects malformed data', () => {
  const valid = JSON.stringify({
    referenceNo: 'GF-A-123456',
    submittedAt: '2026/09/15 14:30',
    records: [{ level: 'A', role: '营运商 A / Operator A', code: 'GFA1' }],
  })

  assert.equal(parseConfirmationImageData(valid)?.referenceNo, 'GF-A-123456')
  assert.equal(parseConfirmationImageData('{bad json'), null)
  assert.equal(parseConfirmationImageData('{"referenceNo":"GF-A-1"}'), null)
})
