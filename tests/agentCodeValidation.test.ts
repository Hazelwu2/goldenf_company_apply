import assert from 'node:assert/strict'
import test from 'node:test'
import { isValidAgentCode } from '../src/utils/validators.ts'

test('agent code accepts uppercase alphanumeric values up to twelve characters', () => {
  assert.equal(isValidAgentCode('MA2026'), true)
  assert.equal(isValidAgentCode('A1B2C3D4E5F6'), true)
  assert.equal(isValidAgentCode('A1-B2'), false)
  assert.equal(isValidAgentCode('A1B2C3D4E5F67'), false)
})
