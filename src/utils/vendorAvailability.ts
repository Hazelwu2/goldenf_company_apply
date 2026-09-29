import type { Vendor } from './vendors'

export interface VendorAvailabilityGroups<T extends Vendor> {
  officialTest: T[]
  officialOnly: T[]
  unavailable: T[]
}

export function supportsCurrency(vendor: Vendor, currency: string) {
  return vendor.currencies.includes(currency)
}

/**
 * 依目前幣別將產品商分組：先判斷是否支援幣別，支援的再依有無測試環境（demo）分組；
 * 不支援的集中到最後，避免停用選項打斷主要選擇流程。各組內維持後端回傳順序。
 */
export function groupVendorsForCurrency<T extends Vendor>(
  vendors: readonly T[],
  currency: string | null,
): VendorAvailabilityGroups<T> {
  const groups: VendorAvailabilityGroups<T> = {
    officialTest: [],
    officialOnly: [],
    unavailable: [],
  }

  for (const vendor of vendors) {
    if (currency && !supportsCurrency(vendor, currency)) {
      groups.unavailable.push(vendor)
    } else if (vendor.demo) {
      groups.officialTest.push(vendor)
    } else {
      groups.officialOnly.push(vendor)
    }
  }

  return groups
}
