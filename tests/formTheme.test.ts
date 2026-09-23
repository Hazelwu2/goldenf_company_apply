import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { darkThemeOverrides, themeOverrides } from '../src/theme/theme-overrides'
import { darkPalette, palette } from '../src/theme/tokens'

function readSource(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

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

test('light theme uses crisp neutral surfaces while preserving the forest green brand', () => {
  assert.equal(palette.primary, '#3E5B4C')
  assert.equal(palette.bodyBg, '#F5F5F5')
  assert.equal(palette.cardBg, '#FFFFFF')
  assert.equal(palette.border, '#D5D9D6')
  assert.equal(palette.divider, '#E5E8E6')
  assert.equal(palette.textBase, '#202522')

  assert.equal(themeOverrides.common?.bodyColor, palette.bodyBg)
  assert.equal(themeOverrides.common?.cardColor, palette.cardBg)
  assert.equal(themeOverrides.common?.borderColor, palette.border)
  assert.equal(themeOverrides.common?.textColorBase, palette.textBase)

  assert.equal(darkPalette.bodyBg, '#171C19')
  assert.equal(darkPalette.cardBg, '#1F2521')

  const appSource = readSource('src/App.vue')
  assert.match(appSource, /--color-page: #f5f5f5/)
  assert.match(appSource, /--color-surface: #ffffff/)
  assert.match(appSource, /--color-border: #d5d9d6/)
  assert.match(appSource, /--color-text: #202522/)
})

test('primary action token keeps the next step prominent in both themes', () => {
  assert.equal(palette.primaryAction, '#3E5B4C')
  assert.equal(palette.primaryActionHover, '#334B41')
  assert.equal(palette.primaryActionPressed, '#293D35')
  assert.equal(darkPalette.primaryAction, '#A7C8B3')

  const appSource = readSource('src/App.vue')
  assert.match(appSource, /--color-primary-action: #3e5b4c/)
  assert.match(appSource, /--color-primary-action: #a7c8b3/)
  assert.match(appSource, /--shadow-primary-action:/)
})

test('multi-value tags use the readable compact-tag scale', () => {
  const source = readSource('src/components/apply/MultiValueInput.vue')

  assert.match(source, /gap: 8px/)
  assert.match(source, /min-height: 34px/)
  assert.match(source, /padding: 4px 10px/)
  assert.match(source, /font-size: 15px/)
})

test('every page width uses the shared responsive layout scale', () => {
  const expectedWidths = new Map([
    ['src/views/apply/SelectComboView.vue', '--layout-width-wide'],
    ['src/views/apply/OperatorFormView.vue', '--layout-width-wide'],
    ['src/views/apply/AgentFormView.vue', '--layout-width-wide'],
    ['src/views/apply/ConfirmView.vue', '--layout-width-reading'],
    ['src/views/apply/RejectedView.vue', '--layout-width-reading'],
    ['src/views/apply/SuccessView.vue', '--layout-width-result'],
    ['src/views/apply/PreviewIndexView.vue', '--layout-width-preview'],
  ])

  for (const [path, widthToken] of expectedWidths) {
    assert.match(readSource(path), new RegExp(`max-width: var\\(${widthToken}\\)`), path)
  }
})

test('review tags remain readable without competing with editable input tags', () => {
  const source = readSource('src/views/apply/ConfirmView.vue')

  assert.match(source, /review-field__tags[\s\S]*gap: 8px/)
  assert.match(source, /review-field__tags[\s\S]*min-height: 30px/)
  assert.match(source, /review-field__tags[\s\S]*font-size: 14px/)
})

test('application hierarchy renders as a prominent titled information card', () => {
  const source = readSource('src/components/apply/OrgHierarchyDiagram.vue')

  assert.match(source, /GitNetworkOutline/)
  assert.match(source, /申请阶层说明/)
  assert.match(source, /Application Hierarchy/)
  assert.match(source, /org-hierarchy__header/)
  assert.match(source, /org-hierarchy__body/)
  assert.match(source, /org-hierarchy__notice/)
  assert.match(source, /\.org-hierarchy[\s\S]*background: var\(--color-surface\)/)
  assert.match(source, /\.org-hierarchy__tree[\s\S]*background: var\(--color-primary-soft\)/)
})
