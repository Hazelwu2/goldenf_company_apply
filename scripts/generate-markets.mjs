/**
 * 从 world-countries（mledoze/countries）产生精简的营运市场清单。
 * 只保留 ISO 3166-1 alpha-2 代码与中英文名称，避免把整份资料集打包进前端。
 *
 * 用法：yarn generate:markets
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import countries from 'world-countries'

/** mledoze/countries 的 zho 翻译少数仍是繁体，这里覆写成简体以符合 UI 语言规范。 */
const simplifiedNameOverrides = {
  TW: '台湾',
  MK: '北马其顿',
  BQ: '荷兰加勒比区',
}

const rows = countries
  .filter((country) => country.status === 'officially-assigned' && Boolean(country.cca2))
  .map((country) => [
    country.cca2,
    simplifiedNameOverrides[country.cca2] ?? country.translations.zho?.common ?? country.name.common,
    country.name.common,
  ])
  .sort((a, b) => a[1].localeCompare(b[1], 'zh-Hans'))

const body = rows.map(([code, zh, en]) => `  ['${code}', '${zh}', '${en}'],`).join('\n')

const file = `// 此档由 scripts/generate-markets.mjs 依 world-countries 自动产生，请勿手动编辑。
// 重新产生：yarn generate:markets

/** [ISO 3166-1 alpha-2, 简体中文名, 英文名]，已依中文名排序。 */
export const RAW_MARKETS: ReadonlyArray<readonly [string, string, string]> = [
${body}
]
`

const target = fileURLToPath(new URL('../src/utils/operatingMarkets.generated.ts', import.meta.url))
writeFileSync(target, file)
console.log(`Wrote ${rows.length} markets to ${target}`)
