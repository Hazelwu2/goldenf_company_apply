import assert from 'node:assert/strict'
import test from 'node:test'
import { getCurrencyChangeImpact } from '../src/utils/currencyChangeImpact.ts'
import type { Vendor } from '../src/utils/vendors.ts'

const VENDORS: Vendor[] = [
  { code: 'JILI', name: 'JILI Games', demo: true, currencies: ['CNY', 'USD', 'VND'] },
  { code: 'CMD', name: 'CMD368', demo: true, currencies: ['USD', 'THB'] },
  { code: 'SA', name: 'SA Gaming', demo: false, currencies: ['CNY', 'USD'] },
  { code: 'WM', name: 'WM Casino', demo: false, currencies: ['THB', 'VND'] },
]

test('currency change separates selected vendors that will be removed from those kept', () => {
  const impact = getCurrencyChangeImpact(['JILI', 'CMD', 'SA'], 'CNY', VENDORS)

  assert.deepEqual(
    impact.remove.map((vendor) => vendor.code),
    ['CMD'],
  )
  assert.deepEqual(
    impact.keep.map((vendor) => vendor.code),
    ['JILI', 'SA'],
  )
})

test('currency change ignores vendor codes that are not in the loaded list', () => {
  const impact = getCurrencyChangeImpact(['UNKNOWN', 'WM'], 'CNY', VENDORS)

  assert.deepEqual(impact.remove.map((vendor) => vendor.code), ['WM'])
  assert.deepEqual(impact.keep, [])
})

test('currency support comes from the vendor list that was loaded from the API', () => {
  const loaded: Vendor[] = [{ code: 'PG', name: 'PG Soft', demo: true, currencies: ['VND'] }]

  const impact = getCurrencyChangeImpact(['PG'], 'VND', loaded)

  assert.deepEqual(impact.remove, [])
  assert.deepEqual(impact.keep, loaded)
})
