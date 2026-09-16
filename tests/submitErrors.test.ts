import assert from 'node:assert/strict'
import test from 'node:test'
import { groupSubmitErrors, type SubmitErrorItem } from '../src/utils/submitErrors.ts'

function error(level: SubmitErrorItem['level'], fieldLabel: string): SubmitErrorItem {
  return {
    level,
    fieldLabel,
    fieldLabelEn: fieldLabel,
    message: `${fieldLabel} error`,
    messageEn: `${fieldLabel} error`,
    routePath: `/apply/${level.toLowerCase()}`,
    anchorId: `field-${fieldLabel}`,
  }
}

test('groups submit errors in A, MA, SMA form order while preserving field order', () => {
  const groups = groupSubmitErrors([
    error('MA', 'MA whitelist'),
    error('A', 'A code'),
    error('SMA', 'SMA code'),
    error('A', 'A account'),
  ])

  assert.deepEqual(
    groups.map((group) => ({
      level: group.level,
      fields: group.errors.map((item) => item.fieldLabel),
    })),
    [
      { level: 'A', fields: ['A code', 'A account'] },
      { level: 'MA', fields: ['MA whitelist'] },
      { level: 'SMA', fields: ['SMA code'] },
    ],
  )
})

test('omits role groups that have no errors', () => {
  const groups = groupSubmitErrors([error('SMA', 'SMA code')])

  assert.deepEqual(
    groups.map((group) => group.level),
    ['SMA'],
  )
})
