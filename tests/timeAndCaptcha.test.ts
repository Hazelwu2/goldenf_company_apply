import assert from 'node:assert/strict'
import test from 'node:test'
import { getCaptchaStatus } from '../src/utils/captcha.ts'
import { formatSubmittedAt } from '../src/utils/dateTime.ts'

test('submission time includes the user UTC offset', () => {
  const timestamp = '2026-09-15T06:22:00.000Z'

  assert.equal(formatSubmittedAt(timestamp, -480), '2026/09/15 14:22 (UTC+8)')
  assert.equal(formatSubmittedAt(timestamp, -330), '2026/09/15 11:52 (UTC+5:30)')
  assert.equal(formatSubmittedAt(timestamp, 300), '2026/09/15 01:22 (UTC-5)')
})

test('captcha stays idle until the complete code is entered', () => {
  assert.equal(getCaptchaStatus('', 'HKPCE'), 'idle')
  assert.equal(getCaptchaStatus('HKP', 'HKPCE'), 'idle')
})

test('captcha validates immediately once the complete code is entered', () => {
  assert.equal(getCaptchaStatus('hkpce', 'HKPCE'), 'ok')
  assert.equal(getCaptchaStatus('HKPCX', 'HKPCE'), 'error')
  assert.equal(getCaptchaStatus('HKPCEE', 'HKPCE'), 'error')
})
