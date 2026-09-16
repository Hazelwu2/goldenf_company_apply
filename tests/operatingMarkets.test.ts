import assert from 'node:assert/strict'
import test from 'node:test'
import {
  operatingMarketDisplayLabel,
  operatingMarketOptions,
} from '../src/utils/operatingMarkets.ts'

test('operating market options expose ISO alpha-2 values including Hong Kong and Macao', () => {
  const values = operatingMarketOptions.map((option) => option.value)

  assert.equal(values.includes('VN'), true)
  assert.equal(values.includes('TH'), true)
  assert.equal(values.includes('HK'), true)
  assert.equal(values.includes('MO'), true)
})

test('operating market labels stay bilingual and carry the ISO code', () => {
  const vietnam = operatingMarketOptions.find((option) => option.value === 'VN')

  assert.ok(vietnam)
  assert.equal(vietnam.labelEn, 'Vietnam')
  assert.match(vietnam.label, /VN$/)
  assert.notEqual(vietnam.labelZh, vietnam.labelEn)
})

test('display label turns an ISO code into readable bilingual text', () => {
  assert.equal(operatingMarketDisplayLabel('VN'), '越南 / Vietnam · VN')
  assert.equal(operatingMarketDisplayLabel('HK'), '香港 / Hong Kong · HK')
})

test('display label passes through a code that is not a known market', () => {
  assert.equal(operatingMarketDisplayLabel('ZZ'), 'ZZ')
})

test('market names use simplified chinese, overriding traditional upstream data', () => {
  const byValue = new Map(operatingMarketOptions.map((option) => [option.value, option.labelZh]))

  assert.equal(byValue.get('TW'), '台湾')
  assert.equal(byValue.get('MK'), '北马其顿')
  assert.equal(byValue.get('BQ'), '荷兰加勒比区')
})

test('dominica and the dominican republic use the correct simplified chinese names', () => {
  const byValue = new Map(operatingMarketOptions.map((option) => [option.value, option.labelZh]))

  // 上游把「多米尼加」（多米尼加共和国）错给了 Dominica，会造成选错国家。
  assert.equal(byValue.get('DM'), '多米尼克')
  assert.equal(byValue.get('DO'), '多米尼加')
})
