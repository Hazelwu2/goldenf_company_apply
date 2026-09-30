import assert from 'node:assert/strict'
import test from 'node:test'
import type { VendorDto } from '../src/api/types.ts'
import { splitSelectedVendors, toSelectableVendors } from '../src/utils/vendors.ts'

function dto(overrides: Partial<VendorDto> & { code: string }): VendorDto {
  return {
    name: overrides.code,
    status: 'online',
    demo: true,
    support: { v2: true, v3: false },
    currency: { VND: { vendor: 'VND', rate: '', gf_support: false, decimal: '' } },
    ...overrides,
  }
}

/** 後端 currency 是以幣別代碼為 key 的物件；空字串 vendor 用 key 區分。 */
function currencies(...codes: string[]): VendorDto['currency'] {
  return Object.fromEntries(
    codes.map((vendor, index) => [
      vendor || `EMPTY_${index}`,
      { vendor, rate: '', gf_support: false, decimal: '' },
    ]),
  )
}

test('only online vendors that support 2.0 and at least one currency can be selected', () => {
  const vendors = toSelectableVendors([
    dto({ code: 'OK' }),
    dto({ code: 'OFFLINE', status: 'offline' }),
    dto({ code: 'NO_V2', support: { v2: false, v3: true } }),
    dto({ code: 'V2_MISSING', support: {} }),
    dto({ code: 'NO_CURRENCY', currency: currencies('', '') }),
    dto({ code: 'EMPTY_CURRENCY', currency: {} }),
  ])

  assert.deepEqual(
    vendors.map((vendor) => vendor.code),
    ['OK'],
  )
})

test('selectable vendor keeps backend name, demo flag and non-empty vendor currencies in order', () => {
  const vendors = toSelectableVendors([
    dto({
      code: 'betby',
      name: 'BETBY 體育／BETBY',
      demo: false,
      currency: currencies('VND', '', 'THB'),
    }),
  ])

  assert.deepEqual(vendors, [
    { code: 'betby', name: 'BETBY 體育／BETBY', demo: false, currencies: ['VND', 'THB'] },
  ])
})

test('vendor with oddly typed 2.0 flag or currency entries is treated as unavailable, not as a broken list', () => {
  const vendors = toSelectableVendors([
    dto({ code: 'STRING_V2', support: { v2: 'true' as unknown as boolean } }),
    dto({
      code: 'MIXED',
      currency: {
        BAD: { vendor: 123 as unknown as string, rate: '', gf_support: false, decimal: '' },
        NULL: null as unknown as VendorDto['currency'][string],
        ...currencies('USD'),
      },
    }),
  ])

  assert.deepEqual(vendors, [{ code: 'MIXED', name: 'MIXED', demo: true, currencies: ['USD'] }])
})

const LOADED = toSelectableVendors([
  dto({ code: 'PP', currency: currencies('CNY', 'VND') }),
  dto({ code: 'SA', demo: false, currency: currencies('CNY') }),
  dto({ code: 'OFF', status: 'offline', currency: currencies('CNY') }),
  dto({ code: 'NO_V2', support: { v2: false }, currency: currencies('CNY') }),
])

test('selected vendors that vanished, went offline, lost 2.0 or do not support the currency are invalid', () => {
  const result = splitSelectedVendors(['PP', 'GONE', 'OFF', 'NO_V2', 'SA'], LOADED, 'VND')

  assert.deepEqual(result.valid, ['PP'])
  assert.deepEqual(result.invalid, ['GONE', 'OFF', 'NO_V2', 'SA'])
})

test('all selected vendors are valid when each is selectable and supports the currency', () => {
  assert.deepEqual(splitSelectedVendors(['SA', 'PP'], LOADED, 'CNY'), {
    valid: ['SA', 'PP'],
    invalid: [],
  })
})
