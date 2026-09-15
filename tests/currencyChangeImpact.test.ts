import assert from 'node:assert/strict'
import test from 'node:test'
import { getCurrencyChangeImpact } from '../src/utils/currencyChangeImpact.ts'

test('currency change separates selected vendors that will be removed from those kept', () => {
  const impact = getCurrencyChangeImpact(['JILI', 'CMD', 'SA'], 'CNY')

  assert.deepEqual(
    impact.remove.map((vendor) => vendor.code),
    ['CMD'],
  )
  assert.deepEqual(
    impact.keep.map((vendor) => vendor.code),
    ['JILI', 'SA'],
  )
})

test('currency change ignores vendor codes that no longer exist', () => {
  const impact = getCurrencyChangeImpact(['UNKNOWN', 'WM'], 'CNY')

  assert.deepEqual(impact.remove.map((vendor) => vendor.code), ['WM'])
  assert.deepEqual(impact.keep, [])
})
