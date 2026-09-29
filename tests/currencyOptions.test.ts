import assert from 'node:assert/strict'
import test from 'node:test'
import { isCurrencySelectionAvailable, toCurrencyOptions } from '../src/utils/currencyOptions.ts'

test('currencies become select options labelled "code name" without losing memo', () => {
  assert.deepEqual(
    toCurrencyOptions([
      { code: 'VND', name: '越南盾', memo: '' },
      { code: 'KVND', name: '(K)越南盾', memo: '1:1000 由營運商轉換' },
    ]),
    [
      { value: 'VND', label: 'VND 越南盾', memo: '' },
      { value: 'KVND', label: 'KVND (K)越南盾', memo: '1:1000 由營運商轉換' },
    ],
  )
})

test('a selected currency is available only while it exists in loaded options', () => {
  const options = [
    { value: 'USD', label: 'USD 美元', memo: '' },
    { value: 'VND', label: 'VND 越南盾', memo: '' },
  ]

  assert.equal(isCurrencySelectionAvailable(options, 'USD'), true)
  assert.equal(isCurrencySelectionAvailable(options, 'CNY'), false)
  assert.equal(isCurrencySelectionAvailable(options, null), false)
})
