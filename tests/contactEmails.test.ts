import assert from 'node:assert/strict'
import test from 'node:test'
import { areValidEmails, isValidEmailEntry, splitEntries } from '../src/utils/validators.ts'

test('pasted text splits on commas, semicolons, spaces and line breaks', () => {
  assert.deepEqual(splitEntries('a@example.com, b@example.com'), [
    'a@example.com',
    'b@example.com',
  ])
  // 从 Outlook 贴上时会带分号分隔。
  assert.deepEqual(splitEntries('a@example.com; b@example.com'), [
    'a@example.com',
    'b@example.com',
  ])
  assert.deepEqual(splitEntries('a@example.com\nb@example.com'), [
    'a@example.com',
    'b@example.com',
  ])
  assert.deepEqual(splitEntries('  '), [])
})

test('contact email stays optional', () => {
  assert.equal(areValidEmails([]), true)
})

test('contact email accepts a single address or several', () => {
  assert.equal(areValidEmails(['ops@example.com']), true)
  assert.equal(areValidEmails(['ops@example.com', 'billing@example.com']), true)
})

test('contact email rejects the whole field when any address is malformed', () => {
  assert.equal(areValidEmails(['ops@example.com', 'not-an-email']), false)
  assert.equal(areValidEmails(['not-an-email']), false)
  assert.equal(areValidEmails(['ops@example.com', 'missing@domain']), false)
})

test('individual email entry validation', () => {
  assert.equal(isValidEmailEntry('ops@example.com'), true)
  assert.equal(isValidEmailEntry('ops@sub.example.co.uk'), true)
  assert.equal(isValidEmailEntry('missing@domain'), false)
  assert.equal(isValidEmailEntry('no-at-sign.com'), false)
  assert.equal(isValidEmailEntry(''), false)
})
