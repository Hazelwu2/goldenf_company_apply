import { VENDORS, type VendorOption } from './mockData.ts'

export function getCurrencyChangeImpact(selectedCodes: string[], nextCurrency: string): {
  remove: VendorOption[]
  keep: VendorOption[]
} {
  const selectedVendors = selectedCodes
    .map((code) => VENDORS.find((vendor) => vendor.code === code))
    .filter((vendor): vendor is VendorOption => Boolean(vendor))

  return {
    remove: selectedVendors.filter((vendor) => !vendor.currencies.includes(nextCurrency)),
    keep: selectedVendors.filter((vendor) => vendor.currencies.includes(nextCurrency)),
  }
}
