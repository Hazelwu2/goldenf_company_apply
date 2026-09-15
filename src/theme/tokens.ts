/**
 * 設計 Token — 單一事實來源
 *
 * 視覺方向：霧森林綠＋暖灰，降低長時間閱讀的白光與高彩度刺激。
 * 這裡先定義「原始色票」，theme-overrides.ts 再把它們映射進 Naive UI 的語意色。
 */

export const fontFamily = {
  base: `"Noto Sans SC", "PingFang SC", "Microsoft JhengHei", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`,
  mono: `ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", Menlo, Consolas, monospace`,
  /**
   * 選配：只用在標題／C10 成功頁，帶一點溫度。以動態 <link> 分包載入，
   * 避免拖慢 first paint（見 src/utils/loadOptionalFont.ts）。
   */
  display: `"LXGW WenKai GB", "Noto Sans SC", system-ui, sans-serif`,
}

export const palette = {
  // 主色：低彩度森林綠；白字對比 7.48:1
  primary: '#3E5B4C',
  primaryHover: '#334B41',
  primaryPressed: '#293D35',
  primarySuppl: '#9CAFA4',

  // 語意色
  success: '#47715A',
  successHover: '#3B624C',
  successPressed: '#304F3E',
  successSuppl: '#AFC6B6',

  warning: '#A15817',
  warningHover: '#8C4C13',
  warningPressed: '#743E10',
  warningSuppl: '#D9B17B',

  error: '#A84F48',
  errorHover: '#93423C',
  errorPressed: '#7E3732',
  errorSuppl: '#D8AAA6',

  info: '#5C6962',
  infoHover: '#4B5751',
  infoPressed: '#3B4640',
  infoSuppl: '#AAB3AD',

  // 中性色 / 背景
  bodyBg: '#F3F2ED',
  cardBg: '#FCFBF8',
  border: '#D2D5CD',
  divider: '#E1E3DC',

  textBase: '#252A27',
  text1: '#252A27',
  text2: '#4B5650',
  text3: '#65716B',
  textDisabled: '#8C958F',
} as const

/**
 * 夜森林深色票：保留品牌的霧綠辨識度，但把主色提亮、彩度壓低。
 * 深色介面不能只是反相，因此背景、邊框與文字都有獨立的明度階層。
 */
export const darkPalette = {
  primary: '#9BB8A6',
  primaryHover: '#ACC6B5',
  primaryPressed: '#83A390',
  primarySuppl: '#6F8979',

  success: '#8EBA9B',
  successHover: '#A1C8AC',
  successPressed: '#78A486',
  successSuppl: '#5F7E69',

  warning: '#D6A15F',
  warningHover: '#E2B273',
  warningPressed: '#BC8749',
  warningSuppl: '#8E6C43',

  error: '#D28A82',
  errorHover: '#DFA099',
  errorPressed: '#B8746D',
  errorSuppl: '#8C5E59',

  info: '#AEB8B1',
  infoHover: '#C1C9C3',
  infoPressed: '#929E96',
  infoSuppl: '#6E7A72',

  bodyBg: '#171C19',
  cardBg: '#1F2521',
  border: '#3B453E',
  divider: '#303932',

  textBase: '#F1F0E9',
  text1: '#F1F0E9',
  text2: '#D1D6D0',
  text3: '#AEB8B1',
  textDisabled: '#7C8780',
} as const

export const radius = {
  base: '6px',
  small: '4px',
} as const

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const
