import assert from 'node:assert/strict'
import test from 'node:test'
import { getVendorSelectionHint } from '../src/utils/vendorSelectionHint.ts'

test('vendor hint explains that selection depends on the selected currency', () => {
  assert.deepEqual(getVendorSelectionHint('VND'), {
    zh: '支持 VND 的产品商优先显示；不支持的项目列于最下方。',
    en: 'Vendors supporting VND appear first; unavailable options are listed last.',
  })
})

test('vendor hint explains why vendor selection is unavailable before choosing a currency', () => {
  assert.deepEqual(getVendorSelectionHint(null), {
    zh: '请先选择币别后再选择产品商。',
    en: 'Choose a currency before selecting vendors.',
  })
})
