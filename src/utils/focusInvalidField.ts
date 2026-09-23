/** 将第一个验证失败的栏位带回视窗中央，并把键盘焦点交给可操作元件。 */
export function focusInvalidField(fieldId: string) {
  const field = document.getElementById(fieldId)
  if (!field) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  field.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })

  const control = field.querySelector<HTMLElement>(
    'input:not([disabled]), textarea:not([disabled]), button:not([disabled]), [role="radio"], [role="combobox"], [tabindex]:not([tabindex="-1"])',
  )
  window.requestAnimationFrame(() => control?.focus({ preventScroll: true }))
}
