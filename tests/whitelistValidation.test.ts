import assert from 'node:assert/strict'
import test from 'node:test'
import { areValidWhitelist, isValidWhitelistEntry } from '../src/utils/validators.ts'

test('whitelist requires at least one entry', () => {
  assert.equal(areValidWhitelist([]), false)
  assert.equal(areValidWhitelist(['203.0.113.10']), true)
})

test('whitelist accepts IPv4, IPv6 and CIDR entries', () => {
  assert.equal(areValidWhitelist(['203.0.113.10', '198.51.100.0/24']), true)
  assert.equal(areValidWhitelist(['2001:db8::1']), true)
})

test('whitelist rejects the whole field when any entry is malformed', () => {
  assert.equal(areValidWhitelist(['203.0.113.10', 'not-an-ip']), false)
  assert.equal(areValidWhitelist(['999.0.0.1']), false)
})

test('individual whitelist entry validation', () => {
  assert.equal(isValidWhitelistEntry('203.0.113.10'), true)
  assert.equal(isValidWhitelistEntry('198.51.100.0/24'), true)
  assert.equal(isValidWhitelistEntry('203.0.113.10/999'), false)
  assert.equal(isValidWhitelistEntry('not-an-ip'), false)
})
