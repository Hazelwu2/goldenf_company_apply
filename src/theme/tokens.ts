/**
 * 设计 Token — 单一事实来源
 *
 * 视觉方向：雾森林绿＋暖灰，降低长时间阅读的白光与高彩度刺激。
 * 这里先定义「原始色票」，theme-overrides.ts 再把它们映射进 Naive UI 的语意色。
 */

export const fontFamily = {
  base: `"Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`,
  mono: `ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", Menlo, Consolas, monospace`,
  /**
   * 选配：只用在标题／C10 成功页，带一点温度。以动态 <link> 分包载入，
   * 避免拖慢 first paint（见 src/utils/loadOptionalFont.ts）。
   */
  display: `"LXGW WenKai GB", "Noto Sans SC", system-ui, sans-serif`,
}

export const palette = {
  // 主色：低彩度森林绿；白字对比 7.48:1
  primary: '#3E5B4C',
  primaryHover: '#334B41',
  primaryPressed: '#293D35',
  primarySuppl: '#9CAFA4',

  // 语意色
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
 * 夜森林深色票：保留品牌的雾绿辨识度，但把主色提亮、彩度压低。
 * 深色介面不能只是反相，因此背景、边框与文字都有独立的明度阶层。
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

  error: '#F09A92',
  errorHover: '#F5AAA3',
  errorPressed: '#D78179',
  errorSuppl: '#A96560',

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
  control: '8px',
} as const

export const formControl = {
  height: '48px',
  paddingInline: '0 12px',
  fontSize: '16px',
  optionHeight: '44px',
} as const

export const radioControl = {
  size: '20px',
  fontSize: '16px',
  labelPadding: '0 0 0 10px',
} as const

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const
