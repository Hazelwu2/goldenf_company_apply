export type CaptchaStatus = 'idle' | 'error' | 'ok'

export function getCaptchaStatus(input: string, code: string): CaptchaStatus {
  const normalizedInput = input.trim().toUpperCase()
  const normalizedCode = code.trim().toUpperCase()
  if (!normalizedCode || normalizedInput.length < normalizedCode.length) return 'idle'
  return normalizedInput === normalizedCode ? 'ok' : 'error'
}
