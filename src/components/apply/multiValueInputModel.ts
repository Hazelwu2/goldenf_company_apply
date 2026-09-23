export type ValidMultiValueTagItem = {
  entry: string
  valid: true
}

export type InvalidMultiValueTagItem = {
  entry: string
  valid: false
}

export type MultiValueTagItem = ValidMultiValueTagItem | InvalidMultiValueTagItem

export type MultiValueInputView = {
  items: MultiValueTagItem[]
  invalidCount: number
  summary:
    | {
        zh: string
        en: string
      }
    | undefined
  hasInvalidEntries: boolean
  tagsRole: undefined
  alertRole: 'alert' | undefined
  alertLive: 'polite' | undefined
  inputStatus: 'error' | undefined
  errorIconName: 'AlertCircleOutline'
  errorIconAriaHidden: true
  summaryIconName: 'AlertCircleOutline'
  summaryIconAriaHidden: true
}

export function buildMultiValueTagItems(
  entries: string[],
  validate: (entry: string) => boolean,
): MultiValueTagItem[] {
  return entries.map((entry) => {
    if (validate(entry)) return { entry, valid: true }
    return { entry, valid: false }
  })
}

export function buildMultiValueInputView(
  entries: string[],
  validate: (entry: string) => boolean,
  errorZh: string,
  errorEn: string,
): MultiValueInputView {
  const items = buildMultiValueTagItems(entries, validate)
  const invalidCount = items.filter((item) => !item.valid).length
  const hasInvalidEntries = invalidCount > 0

  return {
    items,
    invalidCount,
    summary: hasInvalidEntries
      ? {
          zh: errorZh,
          en: errorEn,
        }
      : undefined,
    hasInvalidEntries,
    tagsRole: undefined,
    alertRole: hasInvalidEntries ? 'alert' : undefined,
    alertLive: hasInvalidEntries ? 'polite' : undefined,
    inputStatus: hasInvalidEntries ? 'error' : undefined,
    errorIconName: 'AlertCircleOutline',
    errorIconAriaHidden: true,
    summaryIconName: 'AlertCircleOutline',
    summaryIconAriaHidden: true,
  }
}
