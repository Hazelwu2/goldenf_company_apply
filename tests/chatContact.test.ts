import assert from 'node:assert/strict'
import test from 'node:test'
import { CHAT_SOFTWARE_OPTIONS, isValidChatGroup, isValidChatSoftware } from '../src/utils/validators.ts'

test('chat software only accepts the two values the API allows', () => {
  // API 规格只接受全小写的 teams、telegram。
  assert.deepEqual([...CHAT_SOFTWARE_OPTIONS], ['teams', 'telegram'])
  assert.equal(isValidChatSoftware('teams'), true)
  assert.equal(isValidChatSoftware('telegram'), true)
})

test('chat software is required and case sensitive', () => {
  assert.equal(isValidChatSoftware(null), false)
  assert.equal(isValidChatSoftware(''), false)
  assert.equal(isValidChatSoftware('Teams'), false)
  assert.equal(isValidChatSoftware('Telegram'), false)
  assert.equal(isValidChatSoftware('slack'), false)
})

test('chat group is required and rejects whitespace only', () => {
  assert.equal(isValidChatGroup('GoldenF 开线群组'), true)
  assert.equal(isValidChatGroup(''), false)
  assert.equal(isValidChatGroup('   '), false)
})
