import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  buildMultiValueInputView,
  buildMultiValueTagItems,
} from '../src/components/apply/multiValueInputModel'
import { bilingualHintPresentation } from '../src/components/apply/bilingualHintModel'

const readSource = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('tag presentation maps valid and invalid committed entries independently', () => {
  const items = buildMultiValueTagItems(
    ['10.0.0.1', 'not-an-ip', '192.168.1.0/24', 'also-invalid'],
    (entry) => entry.includes('.') && !entry.includes('invalid'),
  )

  assert.deepEqual(
    items,
    [
      { entry: '10.0.0.1', valid: true },
      { entry: 'not-an-ip', valid: false },
      { entry: '192.168.1.0/24', valid: true },
      { entry: 'also-invalid', valid: false },
    ],
  )
  assert.equal(items.filter((item) => !item.valid).length, 2)
  assert.equal('errorZh' in items[0], false)
  assert.equal('errorEn' in items[0], false)
})

test('multi-value view keeps one field-specific alert regardless of invalid entry count', () => {
  const makeView = (entries: string[]) =>
    buildMultiValueInputView(
      entries,
      (entry) => entry === 'valid',
      '格式错误',
      'an invalid format',
    )

  const validOnlyView = makeView(['valid'])
  assert.equal(validOnlyView.invalidCount, 0)
  assert.equal(validOnlyView.summary, undefined)
  assert.equal(validOnlyView.tagsRole, undefined)
  assert.equal(validOnlyView.alertRole, undefined)
  assert.equal(validOnlyView.alertLive, undefined)
  assert.equal(validOnlyView.inputStatus, undefined)

  const oneInvalidView = makeView(['valid', 'bad-one'])
  assert.equal(oneInvalidView.invalidCount, 1)
  assert.deepEqual(oneInvalidView.summary, {
    zh: '格式错误',
    en: 'an invalid format',
  })
  assert.equal(oneInvalidView.tagsRole, undefined)
  assert.equal(oneInvalidView.alertRole, 'alert')
  assert.equal(oneInvalidView.alertLive, 'polite')
  assert.equal(oneInvalidView.inputStatus, 'error')
  assert.equal(oneInvalidView.summaryIconName, 'AlertCircleOutline')
  assert.equal(oneInvalidView.summaryIconAriaHidden, true)

  const threeInvalidView = makeView(['bad-one', 'bad-two', 'bad-three'])
  assert.equal(threeInvalidView.invalidCount, 3)
  assert.deepEqual(threeInvalidView.summary, {
    zh: '格式错误',
    en: 'an invalid format',
  })
  assert.equal(threeInvalidView.tagsRole, undefined)
  assert.equal(threeInvalidView.alertRole, 'alert')
  assert.equal(threeInvalidView.alertLive, 'polite')
  assert.equal(threeInvalidView.errorIconName, 'AlertCircleOutline')
  assert.equal(threeInvalidView.errorIconAriaHidden, true)

  const actualPropsView = buildMultiValueInputView(
    ['bad-ip'],
    () => false,
    'IP 格式错误',
    'Invalid IP format',
  )
  assert.deepEqual(actualPropsView.summary, {
    zh: 'IP 格式错误',
    en: 'Invalid IP format',
  })

  const emailPropsView = buildMultiValueInputView(
    ['bad-email'],
    () => false,
    'Email 格式错误',
    'Invalid email format',
  )
  assert.deepEqual(emailPropsView.summary, {
    zh: 'Email 格式错误',
    en: 'Invalid email format',
  })
})

test('field errors include a decorative vector status icon', () => {
  const source = readSource('src/components/apply/FieldError.vue')

  assert.match(source, /AlertCircleOutline/)
  assert.match(source, /aria-hidden="true"/)
})

test('disabled step guidance uses a warning container and vector icon', () => {
  const source = readSource('src/components/apply/StepFooterActions.vue')

  assert.match(source, /AlertCircleOutline/)
  assert.match(source, /step-footer__hint-icon/)
  assert.match(source, /var\(--color-warning-soft\)/)
  assert.match(source, /var\(--color-warning-border\)/)
})

test('bilingual rules notice uses a neutral information icon and semantic surface', () => {
  assert.deepEqual(bilingualHintPresentation, {
    iconName: 'InformationCircleOutline',
    iconAriaHidden: true,
    surface: 'neutral',
    backgroundToken: '--color-surface-muted',
    borderToken: '--color-border',
  })
})
