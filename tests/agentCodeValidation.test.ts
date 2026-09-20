import assert from 'node:assert/strict'
import test from 'node:test'
import { isValidAgentCode } from '../src/utils/validators.ts'

test('agent code accepts uppercase alphanumeric values up to twelve characters', () => {
  assert.equal(isValidAgentCode('MA2026'), true)
  assert.equal(isValidAgentCode('A1B2C3D4E5F6'), true)
  assert.equal(isValidAgentCode('A1-B2'), false)
  assert.equal(isValidAgentCode('A1B2C3D4E5F67'), false)
})

test('agent code requires at least two characters', () => {
  // API 规格 §2.3：MA／SMA 为 2～12 个英数字符。
  assert.equal(isValidAgentCode('M'), false)
  assert.equal(isValidAgentCode('1'), false)
  assert.equal(isValidAgentCode(' M '), false)
  assert.equal(isValidAgentCode('MA'), true)
})

test('agent code rejects an empty value', () => {
  assert.equal(isValidAgentCode(''), false)
  assert.equal(isValidAgentCode('   '), false)
})
