import assert from 'node:assert/strict'
import test from 'node:test'
import type { Vendor } from '../src/utils/vendors.ts'
import { groupVendorsForCurrency } from '../src/utils/vendorAvailability.ts'

const VENDORS: Vendor[] = [
  { code: 'PP', name: 'Pragmatic Play', demo: true, currencies: ['CNY', 'USD', 'THB', 'VND'] },
  { code: 'PG', name: 'PG Soft', demo: true, currencies: ['CNY', 'THB'] },
  { code: 'AG', name: 'AG Asia Gaming', demo: false, currencies: ['CNY', 'THB'] },
  { code: 'SA', name: 'SA Gaming', demo: false, currencies: ['CNY', 'USD'] },
  { code: 'WM', name: 'WM Casino', demo: false, currencies: ['THB', 'VND'] },
  { code: 'JILI', name: 'JILI Games', demo: true, currencies: ['VND'] },
]

test('currency support is checked first, then demo decides production & test or production only', () => {
  const groups = groupVendorsForCurrency(VENDORS, 'VND')

  assert.deepEqual(groups.officialTest.map((vendor) => vendor.code), ['PP', 'JILI'])
  assert.deepEqual(groups.officialOnly.map((vendor) => vendor.code), ['WM'])
  assert.deepEqual(groups.unavailable.map((vendor) => vendor.code), ['PG', 'AG', 'SA'])
})

test('vendor order from the backend is kept within each group', () => {
  const groups = groupVendorsForCurrency(VENDORS, 'THB')

  assert.deepEqual(groups.officialTest.map((vendor) => vendor.code), ['PP', 'PG'])
  assert.deepEqual(groups.officialOnly.map((vendor) => vendor.code), ['AG', 'WM'])
  assert.deepEqual(groups.unavailable.map((vendor) => vendor.code), ['SA', 'JILI'])
})
