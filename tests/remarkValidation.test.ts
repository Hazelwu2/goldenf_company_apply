import assert from 'node:assert/strict'
import test from 'node:test'
import { countRemarkChars, isValidRemark, REMARK_MAX_LENGTH } from '../src/utils/validators.ts'

test('remark allows up to 250 characters, as the backend limits', () => {
  assert.equal(REMARK_MAX_LENGTH, 250)
  assert.equal(isValidRemark(''), true)
  assert.equal(isValidRemark('字'.repeat(249)), true)
  assert.equal(isValidRemark('字'.repeat(250)), true)
  assert.equal(isValidRemark('字'.repeat(251)), false)
})

test('an emoji counts as one character, not two', () => {
  assert.equal(countRemarkChars('备注😀'), 3)
  assert.equal(isValidRemark('😀'.repeat(250)), true)
  assert.equal(isValidRemark('😀'.repeat(251)), false)
})
