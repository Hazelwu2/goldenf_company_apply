import assert from 'node:assert/strict'
import test from 'node:test'
import { CHAT_SOFTWARE_OPTIONS, isValidChatGroup, isValidChatSoftware } from '../src/utils/validators.ts'

test('chat software only accepts the two values the API allows', () => {
  // 大小写依 API 规格：Teams 首字大写、telegram 全小写。
  assert.deepEqual([...CHAT_SOFTWARE_OPTIONS], ['Teams', 'telegram'])
  assert.equal(isValidChatSoftware('Teams'), true)
  assert.equal(isValidChatSoftware('telegram'), true)
})

test('chat software is required and case sensitive', () => {
  assert.equal(isValidChatSoftware(null), false)
  assert.equal(isValidChatSoftware(''), false)
  assert.equal(isValidChatSoftware('teams'), false)
  assert.equal(isValidChatSoftware('Telegram'), false)
  assert.equal(isValidChatSoftware('slack'), false)
})

test('chat group is required and rejects whitespace only', () => {
  assert.equal(isValidChatGroup('GoldenF 开线群组'), true)
  assert.equal(isValidChatGroup(''), false)
  assert.equal(isValidChatGroup('   '), false)
})
