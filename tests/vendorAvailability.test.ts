import assert from 'node:assert/strict'
import test from 'node:test'
import { VENDORS } from '../src/utils/mockData.ts'
import { groupVendorsForCurrency } from '../src/utils/vendorAvailability.ts'

test('unsupported vendors are collected after every supported vendor', () => {
  const groups = groupVendorsForCurrency(VENDORS, 'VND')

  assert.deepEqual(groups.officialTest.map((vendor) => vendor.code), ['PP', 'JILI'])
  assert.deepEqual(groups.officialOnly.map((vendor) => vendor.code), ['WM'])
  assert.deepEqual(groups.unavailable.map((vendor) => vendor.code), [
    'PG',
    'CMD',
    'SA',
    'AG',
    'SEXY',
  ])
})

test('vendor order remains stable within each availability group', () => {
  const groups = groupVendorsForCurrency(VENDORS, 'THB')

  assert.deepEqual(groups.officialTest.map((vendor) => vendor.code), ['PP', 'PG', 'CMD'])
  assert.deepEqual(groups.officialOnly.map((vendor) => vendor.code), ['AG', 'WM'])
  assert.deepEqual(groups.unavailable.map((vendor) => vendor.code), ['JILI', 'SA', 'SEXY'])
})
