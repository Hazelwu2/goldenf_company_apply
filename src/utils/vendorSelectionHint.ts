export function getVendorSelectionHint(currency: string | null) {
  if (!currency) {
    return {
      zh: '请先选择币别后再选择产品商。',
      en: 'Choose a currency before selecting vendors.',
    }
  }

  return {
    zh: `支持 ${currency} 的产品商优先显示；不支持的项目列于最下方。`,
    en: `Vendors supporting ${currency} appear first; unavailable options are listed last.`,
  }
}
