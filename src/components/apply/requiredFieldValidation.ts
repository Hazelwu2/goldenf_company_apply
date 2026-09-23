export type RequiredFieldValue = string | readonly unknown[] | null | undefined

export function isRequiredValueMissing(value: RequiredFieldValue): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  return value.length === 0
}

export function shouldShowRequiredError(options: {
  touched: boolean
  value: RequiredFieldValue
  disabled?: boolean
  active?: boolean
}): boolean {
  const { touched, value, disabled = false, active = true } = options
  return touched && active && !disabled && isRequiredValueMissing(value)
}
