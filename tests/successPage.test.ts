import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveSuccessPageSource } from '../src/utils/successPage.ts'

const STORED = JSON.stringify({
  referenceNo: 'APY-20260930-0001',
  submittedAt: '2026/09/30 10:00',
  records: [{ level: 'A', role: '营运商 A / Operator A', code: 'GFA1' }],
})

test('a submission in this session is shown and saved for reloads', () => {
  assert.deepEqual(resolveSuccessPageSource('APY-20260930-0002', STORED), { kind: 'current' })
})

test('after a reload the last saved confirmation is shown without submitting again', () => {
  const source = resolveSuccessPageSource(null, STORED)

  assert.equal(source.kind, 'stored')
  assert.equal(source.kind === 'stored' && source.data.referenceNo, 'APY-20260930-0001')
})

test('opening the success page without any submission sends the user back to the form', () => {
  assert.deepEqual(resolveSuccessPageSource(null, null), { kind: 'none' })
  assert.deepEqual(resolveSuccessPageSource(null, '{"broken":'), { kind: 'none' })
})
