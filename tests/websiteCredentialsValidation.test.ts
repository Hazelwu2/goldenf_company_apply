import assert from 'node:assert/strict'
import test from 'node:test'
import {
  hasCompleteWebsiteCredentials,
  isValidWebsiteSection,
  isValidWebsiteUrl,
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

test('website URL must be a real http(s) address', () => {
  assert.equal(isValidWebsiteUrl('https://example.com'), true)
  assert.equal(isValidWebsiteUrl('http://example.com'), true)
  assert.equal(isValidWebsiteUrl('https://a.example.co.uk/path?q=1'), true)
  assert.equal(isValidWebsiteUrl('  https://example.com  '), true)
})

test('website URL rejects free text and missing scheme', () => {
  assert.equal(isValidWebsiteUrl('随便乱填'), false)
  assert.equal(isValidWebsiteUrl('example.com'), false)
  assert.equal(isValidWebsiteUrl('https://'), false)
  assert.equal(isValidWebsiteUrl('https://nodot'), false)
  assert.equal(isValidWebsiteUrl('https://example.com.'), false)
  assert.equal(isValidWebsiteUrl('http://exa mple.com'), false)
  assert.equal(isValidWebsiteUrl(''), false)
})

test('website URL rejects non-http schemes', () => {
  // javascript: / data: 不可通过，避免把可执行内容当成网址存下来。
  assert.equal(isValidWebsiteUrl('javascript:alert(1)'), false)
  assert.equal(isValidWebsiteUrl('data:text/html,hi'), false)
  assert.equal(isValidWebsiteUrl('ftp://example.com'), false)
})

test('a live site with a malformed URL cannot be submitted', () => {
  assert.equal(isValidWebsiteSection('live', '随便乱填', 'tester01', 'secret'), false)
  assert.equal(isValidWebsiteSection('live', 'https://example.com', 'tester01', 'secret'), true)
})
