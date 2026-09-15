import type { ConfirmationImageData } from './applicationReview'

export function parseConfirmationImageData(value: string | null): ConfirmationImageData | null {
  if (!value) return null
  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object') return null
    const candidate = parsed as Partial<ConfirmationImageData>
    if (typeof candidate.referenceNo !== 'string' || typeof candidate.submittedAt !== 'string') {
      return null
    }
    if (!Array.isArray(candidate.records)) return null
    const recordsAreValid = candidate.records.every(
      (record) =>
        record &&
        typeof record === 'object' &&
        typeof record.role === 'string' &&
        typeof record.code === 'string' &&
        typeof record.name === 'string',
    )
    return recordsAreValid ? (candidate as ConfirmationImageData) : null
  } catch {
    return null
  }
}

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (character) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;',
    }
    return entities[character] ?? character
  })
}

export function createConfirmationSvg(data: ConfirmationImageData): string {
  const width = 1200
  const rowHeight = 96
  const height = 500 + data.records.length * rowHeight
  const records = data.records
    .map((record, index) => {
      const y = 386 + index * rowHeight
      return `
        <rect x="72" y="${y}" width="1056" height="72" rx="12" fill="#F3F2ED" stroke="#D2D5CD"/>
        <text x="96" y="${y + 28}" class="role">${escapeXml(record.role)}</text>
        <text x="96" y="${y + 53}" class="record">${escapeXml(record.code)} · ${escapeXml(record.name)}</text>`
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <style>
      text { font-family: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif; fill: #252A27; }
      .eyebrow { font-size: 20px; letter-spacing: 2px; fill: #65716B; }
      .title { font-size: 38px; font-weight: 700; }
      .label { font-size: 20px; fill: #4B5650; }
      .reference { font-family: ui-monospace, monospace; font-size: 46px; font-weight: 700; fill: #293D35; letter-spacing: 2px; }
      .role { font-size: 19px; font-weight: 600; fill: #3E5B4C; }
      .record { font-family: ui-monospace, monospace; font-size: 21px; }
      .footer { font-size: 18px; fill: #65716B; }
    </style>
    <rect width="1200" height="${height}" fill="#F3F2ED"/>
    <rect x="40" y="40" width="1120" height="${height - 80}" rx="20" fill="#FCFBF8" stroke="#D2D5CD"/>
    <rect x="72" y="40" width="84" height="5" rx="2.5" fill="#9CAFA4"/>
    <text x="72" y="102" class="eyebrow">GOLDENF · COMPANY APPLY</text>
    <text x="72" y="158" class="title">開線確認單 · Application Confirmation</text>
    <text x="72" y="218" class="label">開線編號 / Application Reference No.</text>
    <text x="72" y="278" class="reference">${escapeXml(data.referenceNo)}</text>
    <text x="72" y="326" class="label">提交時間 / Submitted At　${escapeXml(data.submittedAt)}</text>
    ${records}
    <text x="72" y="${height - 88}" class="footer">請妥善保存此確認單，查詢時請提供開線編號。</text>
    <text x="72" y="${height - 58}" class="footer">Keep this confirmation and provide the application number for future enquiries.</text>
  </svg>`
}
