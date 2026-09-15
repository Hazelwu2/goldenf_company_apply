export function getVendorSelectionHint(currency: string | null) {
  if (!currency) {
    return {
      zh: '请先选择币别后再选择产品商。',
      en: 'Choose a currency before selecting vendors.',
    }
  }

  return {
    zh: `仅显示支持 ${currency} 币别的产品商。`,
    en: `Only vendors that support ${currency} are shown.`,
  }
}
