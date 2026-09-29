import { supportsCurrency } from './vendorAvailability'
import type { Vendor } from './vendors'

/** 換幣別時，列出已選產品商中哪些會因為不支援新幣別而被移除、哪些保留。 */
export function getCurrencyChangeImpact(
  selectedCodes: string[],
  nextCurrency: string,
  vendors: readonly Vendor[],
): {
  remove: Vendor[]
  keep: Vendor[]
} {
  const selectedVendors = selectedCodes
    .map((code) => vendors.find((vendor) => vendor.code === code))
    .filter((vendor): vendor is Vendor => Boolean(vendor))

  return {
    remove: selectedVendors.filter((vendor) => !supportsCurrency(vendor, nextCurrency)),
    keep: selectedVendors.filter((vendor) => supportsCurrency(vendor, nextCurrency)),
  }
}
