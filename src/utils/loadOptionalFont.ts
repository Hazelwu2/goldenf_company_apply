/**
 * LXGW WenKai GB 為選配字型，只用在標題／C10 成功頁帶一點溫度。
 * 以動態注入 <link> 的方式延後載入，避免整檔字重拖慢 first paint。
 * 找不到 CDN 或載入失敗時，靠 fontFamily.display 的 fallback chain
 * （退回 Noto Sans SC / system-ui）— 版面不會壞。
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
