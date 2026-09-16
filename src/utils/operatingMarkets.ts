import type { SelectOption } from 'naive-ui'
import { RAW_MARKETS } from './operatingMarkets.generated.ts'

export type OperatingMarketOption = SelectOption & {
  value: string
  label: string
  labelZh: string
  labelEn: string
}

/**
 * ISO 3166-1 alpha-2 营运市场选项；value 直接用于 Create API 的 operating_markets。
 * 资料源自 world-countries（mledoze/countries），经 scripts/generate-markets.mjs 精简後产生。
 */
export const operatingMarketOptions: OperatingMarketOption[] = RAW_MARKETS.map(
  ([value, labelZh, labelEn]) => ({
    value,
    label: `${labelZh} / ${labelEn} · ${value}`,
    labelZh,
    labelEn,
  }),
)

const optionByValue = new Map(operatingMarketOptions.map((option) => [option.value, option]))

/** 将 ISO alpha-2 代码转成审核页可读的「中文 / English · CODE」；未知代码原样返回。 */
export function operatingMarketDisplayLabel(code: string): string {
  return optionByValue.get(code)?.label ?? code
}
