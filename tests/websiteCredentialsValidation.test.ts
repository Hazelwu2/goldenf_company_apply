import assert from 'node:assert/strict'
import test from 'node:test'
import {
  hasCompleteWebsiteCredentials,
  isValidWebsiteSection,
} from '../src/utils/validators.ts'

test('website URL and test credentials must be either all present or all empty', () => {
  assert.equal(hasCompleteWebsiteCredentials('', '', ''), true)
  assert.equal(hasCompleteWebsiteCredentials('https://example.com', 'tester01', 'secret'), true)
  assert.equal(hasCompleteWebsiteCredentials('https://example.com', '', ''), false)
  assert.equal(hasCompleteWebsiteCredentials('', 'tester01', 'secret'), false)
  assert.equal(hasCompleteWebsiteCredentials(' https://example.com ', ' ', 'secret'), false)
})

test('website section requires all three fields when the site is live', () => {
  // 规则 2／3／4：三者同时填写才算完整。
  assert.equal(isValidWebsiteSection('live', 'https://example.com', 'tester01', 'secret'), true)
  assert.equal(isValidWebsiteSection('live', 'https://example.com', '', ''), false)
  assert.equal(isValidWebsiteSection('live', 'https://example.com', 'tester01', ''), false)
  assert.equal(isValidWebsiteSection('live', '', 'tester01', 'secret'), false)
})

test('website section rejects a live site that left every field empty', () => {
  // 规则 1：全部留空代表尚在开发，与「已有网站」互相矛盾。
  assert.equal(isValidWebsiteSection('live', '', '', ''), false)
})

test('website section requires every field to stay empty while in development', () => {
  assert.equal(isValidWebsiteSection('in_progress', '', '', ''), true)
  assert.equal(
    isValidWebsiteSection('in_progress', 'https://example.com', 'tester01', 'secret'),
    false,
  )
  assert.equal(isValidWebsiteSection('in_progress', 'https://example.com', '', ''), false)
})

test('website section is invalid until a status is chosen', () => {
  assert.equal(isValidWebsiteSection(null, '', '', ''), false)
})
