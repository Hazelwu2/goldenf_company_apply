import type { VendorOption } from './mockData'

export interface VendorAvailabilityGroups<T extends VendorOption> {
  officialTest: T[]
  officialOnly: T[]
  unavailable: T[]
}

/**
 * 依目前币别分组产品商：可选项目保留原本环境分组与资料顺序，
 * 不支援项目则集中到最后，避免停用选项打断主要选择流程。
 */
export function groupVendorsForCurrency<T extends VendorOption>(
  vendors: readonly T[],
  currency: string | null,
): VendorAvailabilityGroups<T> {
  const groups: VendorAvailabilityGroups<T> = {
    officialTest: [],
    officialOnly: [],
    unavailable: [],
  }

  for (const vendor of vendors) {
    if (currency && !vendor.currencies.includes(currency)) {
      groups.unavailable.push(vendor)
    } else if (vendor.env === 'official_test') {
      groups.officialTest.push(vendor)
    } else {
      groups.officialOnly.push(vendor)
    }
  }

  return groups
}
