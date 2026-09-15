/**
 * LXGW WenKai GB 为选配字型，只用在标题／C10 成功页带一点温度。
 * 以动态注入 <link> 的方式延后载入，避免整档字重拖慢 first paint。
 * 找不到 CDN 或载入失败时，靠 fontFamily.display 的 fallback chain
 * （退回 Noto Sans SC / system-ui）— 版面不会坏。
 */
let loaded = false

export function loadOptionalDisplayFont(): void {
  if (loaded || typeof document === 'undefined') return
  loaded = true

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-gb-web@1/style.css'
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}
