export type SubmitErrorLevel = 'A' | 'MA' | 'SMA'

export interface SubmitErrorItem {
  level: SubmitErrorLevel
  fieldLabel: string
  fieldLabelEn: string
  message: string
  messageEn: string
  routePath: string
  anchorId?: string
}

export interface SubmitErrorGroup {
  level: SubmitErrorLevel
  errors: SubmitErrorItem[]
}

const FORM_LEVEL_ORDER: SubmitErrorLevel[] = ['A', 'MA', 'SMA']

export function groupSubmitErrors(errors: SubmitErrorItem[]): SubmitErrorGroup[] {
  return FORM_LEVEL_ORDER.map((level) => ({
    level,
    errors: errors.filter((error) => error.level === level),
  })).filter((group) => group.errors.length > 0)
}
