import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveApiMode } from '../src/api/apiMode.ts'

test('development defaults to mock when API mode is not configured', () => {
  assert.equal(resolveApiMode(undefined, { production: false }), 'mock')
  assert.equal(resolveApiMode('', { production: false }), 'mock')
})

test('explicit mock and live modes are honoured in every environment', () => {
  assert.equal(resolveApiMode('mock', { production: false }), 'mock')
  assert.equal(resolveApiMode('live', { production: false }), 'live')
  assert.equal(resolveApiMode('mock', { production: true }), 'mock')
  assert.equal(resolveApiMode('live', { production: true }), 'live')
})

test('production refuses to guess the API mode', () => {
  assert.throws(() => resolveApiMode(undefined, { production: true }), /VITE_API_MODE/)
  assert.throws(() => resolveApiMode('', { production: true }), /VITE_API_MODE/)
})

test('unknown API mode is rejected instead of silently falling back', () => {
  assert.throws(() => resolveApiMode('Live', { production: false }), /VITE_API_MODE/)
  assert.throws(() => resolveApiMode('prod', { production: true }), /VITE_API_MODE/)
})
