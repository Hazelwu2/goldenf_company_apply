import assert from 'node:assert/strict'
import test from 'node:test'
import { darkThemeOverrides, themeOverrides } from '../src/theme/theme-overrides'

test('shared form controls keep the comfortable form-page dimensions in both themes', () => {
  for (const overrides of [themeOverrides, darkThemeOverrides]) {
    assert.equal(overrides.Input?.heightMedium, '48px')
    assert.equal(overrides.Input?.borderRadius, '8px')
    assert.equal(overrides.Input?.fontSizeMedium, '16px')
    assert.equal(overrides.Input?.paddingMedium, '0 12px')

    const selection = overrides.Select?.peers?.InternalSelection
    assert.equal(selection?.heightMedium, '48px')
    assert.equal(selection?.borderRadius, '8px')
    assert.equal(selection?.fontSizeMedium, '16px')
    assert.equal(selection?.paddingSingle, '0 12px')

    const menu = overrides.Select?.peers?.InternalSelectMenu
    assert.equal(menu?.optionHeightMedium, '44px')
    assert.equal(menu?.optionFontSizeMedium, '16px')
    assert.equal(menu?.optionPaddingMedium, '0 12px')

    assert.equal(overrides.Radio?.radioSizeMedium, '20px')
    assert.equal(overrides.Radio?.fontSizeMedium, '16px')
  }
})
