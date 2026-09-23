import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isRequiredValueMissing,
  shouldShowRequiredError,
} from '../src/components/apply/requiredFieldValidation'

test('required values treat blank text, empty collections, and missing selections as empty', () => {
  assert.equal(isRequiredValueMissing(undefined), true)
  assert.equal(isRequiredValueMissing(null), true)
  assert.equal(isRequiredValueMissing(''), true)
  assert.equal(isRequiredValueMissing('   '), true)
  assert.equal(isRequiredValueMissing([]), true)

  assert.equal(isRequiredValueMissing('Teams'), false)
  assert.equal(isRequiredValueMissing(['TW']), false)
})

test('required errors appear only after blur and clear as soon as the value is supplied', () => {
  assert.equal(shouldShowRequiredError({ touched: false, value: '' }), false)
  assert.equal(shouldShowRequiredError({ touched: true, value: '' }), true)
  assert.equal(shouldShowRequiredError({ touched: true, value: 'filled' }), false)
  assert.equal(shouldShowRequiredError({ touched: true, value: ['filled'] }), false)
})

test('disabled or conditionally inactive required fields never show an error', () => {
  assert.equal(shouldShowRequiredError({ touched: true, value: '', disabled: true }), false)
  assert.equal(shouldShowRequiredError({ touched: true, value: '', active: false }), false)
})
