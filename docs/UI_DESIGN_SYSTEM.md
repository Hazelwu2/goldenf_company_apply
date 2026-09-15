# GoldenF Company Apply UI Design System

This is the UI contract for humans and coding agents. Read it before modifying any user-facing page or component. Follow the rules literally; do not invent a new visual direction when a rule or existing component already covers the requirement.

## Required workflow

1. Identify an existing page or component with the closest interaction.
2. Reuse its structure, semantic CSS variables, bilingual pattern, and spacing.
3. Add a new token only when no existing semantic token expresses the purpose.
4. Check light, dark, desktop, and 375 px mobile layouts.
5. Complete the checklist at the end of this document before reporting completion.

When a product request conflicts with this contract, preserve accessibility and ask which visual rule may change. A single feature request does not authorize a site-wide redesign.

## Product character

The interface is a calm, trustworthy, bilingual business form. The visual direction is **mist forest green with warm neutral surfaces**. It should feel considered and human, not decorative, futuristic, glossy, or like a generic AI-generated dashboard.

Use these qualities:

- Calm: low saturation, warm gray surfaces, restrained status colors.
- Clear: strong information hierarchy and readable Chinese and English.
- Tactile: thin borders, small offset shadows, and a short top accent on major cards.
- Focused: one obvious primary action per decision point.
- Compact but breathable: standard form density with clear section gaps.

## Sources of truth

- Raw light and dark palettes, typography families, radius, and spacing: `src/theme/tokens.ts`.
- Naive UI mappings: `src/theme/theme-overrides.ts`.
- Runtime semantic CSS variables and global surface rules: `src/App.vue`.
- Shared form primitives: `src/components/apply/`.

Use semantic variables in components. A component must not introduce a raw hex color. If a token changes, keep `src/theme/tokens.ts`, `src/theme/theme-overrides.ts`, and the matching variables in `src/App.vue` synchronized.

## Color contract

Blue is not part of this product palette. Interactive emphasis uses forest green. Warning, error, and success colors communicate status; they are not decorative accents.

| Purpose | Light | Dark | CSS variable |
|---|---:|---:|---|
| Primary | `#3E5B4C` | `#9BB8A6` | `--color-primary` |
| Primary hover | `#334B41` | `#ACC6B5` | `--color-primary-hover` |
| Primary pressed | `#293D35` | `#83A390` | `--color-primary-pressed` |
| Page background | `#F3F2ED` | `#171C19` | `--color-page` |
| Main surface | `#FCFBF8` | `#1F2521` | `--color-surface` |
| Muted surface | `#EEEEE7` | `#282F2A` | `--color-surface-muted` |
| Hover surface | `#F5F4EF` | `#2D352F` | `--color-surface-hover` |
| Border | `#D2D5CD` | `#3B453E` | `--color-border` |
| Strong border | `#BCC3BB` | `#56635A` | `--color-border-strong` |
| Primary text | `#252A27` | `#F1F0E9` | `--color-text` |
| Secondary text | `#4B5650` | `#D1D6D0` | `--color-text-secondary` |
| Muted text | `#65716B` | `#AEB8B1` | `--color-text-muted` |
| Warning | `#A15817` | `#D6A15F` | `--color-warning` |
| Error | `#A84F48` | `#D28A82` | `--color-error` |
| Success | `#47715A` | `#8EBA9B` | `--color-success` |

Rules:

- Use `--color-page` for the viewport and `--color-surface` for primary cards.
- Use muted surfaces to group related information, not as a second page background.
- Text contrast must be at least 4.5:1 for normal text.
- Never communicate status by color alone; pair color with text or an icon.
- Do not add gradients, neon colors, saturated blue, pure white page backgrounds, or pure black surfaces.

## Typography

- Base stack: `fontFamily.base` from `src/theme/tokens.ts`.
- Codes, application numbers, IP addresses, and machine values: `fontFamily.mono`.
- Default body size: 16 px with line-height 1.5 or greater.
- Form control and primary label size: 15–16 px.
- English companion text: 13–14 px. Never below 12 px.
- Page heading: 22–28 px, weight 700.
- Card or section heading: 16–18 px, weight 600.

Chinese is the primary line and English is the companion line. English must remain readable; opacity alone must not make it faint.

## Bilingual content

Every user-facing label, instruction, validation message, button, navigation item, dialog, and result message must be understandable in both Simplified Chinese and English.

Preferred patterns:

```text
后台白名单
Admin Whitelist
```

```text
确认送出  Confirm & Submit
```

Use stacked text for form labels and longer descriptions. Use same-line text for short buttons and compact status labels. When a proper name is identical in both languages, such as `Pragmatic Play`, render it once.

Do not place essential information only in a placeholder. Keep a visible bilingual label and helper text. ARIA labels must also be bilingual.

## Layout and spacing

- Main form and confirmation content: maximum width 720 px.
- Success result content: maximum width 600 px unless a wider summary requires 720 px.
- Page horizontal padding: `clamp(16px, 4vw, 40px)`.
- Section gap: 16–24 px.
- Field group gap: 12–18 px.
- Card padding: 20–24 px desktop, 16 px mobile.
- Form label column: about 150 px desktop; stack label above value on narrow screens.
- Use spacing tokens from `src/theme/tokens.ts` before adding a custom value.

At 680 px and below, simplify the stepper and allow actions to span the available width. At 560 px and below, two-column review rows become one column. Never introduce horizontal page scrolling at 375 px.

## Surfaces and cards

Major cards use:

- `--color-surface` background.
- 1 px `--color-border` border.
- 6–9 px radius.
- `--shadow-card` or `--shadow-selected` when elevation is needed.
- A short, muted green accent at the top edge for personality.

Use one card for one conceptual group. Avoid placing every row inside its own card. Inside a card, prefer dividers and muted grouped surfaces.

## Forms

- Always show a persistent bilingual label.
- Put format guidance immediately below the control.
- Show validation beside the affected field.
- List only invalid whitelist entries; do not repeat valid input as tags.
- Use searchable multi-select for long vendor lists. Collapse selected values with `+N` when space is limited.
- Omit empty optional fields from review screens.
- Mask passwords on review screens and provide a labeled show/hide control.
- Use 44 px minimum touch targets for primary controls.

## Buttons and actions

Each screen has one visually dominant action. Use a primary filled button for the action that advances or preserves critical information. Secondary, back, edit, and preview actions use secondary, text, or quaternary styles.

Button labels start with a verb and are bilingual. Example:

```text
储存开线确认单
Save Confirmation
```

An icon supports the text; it never replaces it. Use the existing SVG icon library, not emoji or Unicode symbols.

Critical actions must show loading and success or error feedback. A disabled action must have nearby bilingual text explaining how to enable it.

## Motion

- Use motion only to explain a state change or route transition.
- Standard duration: 150–220 ms.
- Animate opacity and transform, not layout dimensions.
- Respect `prefers-reduced-motion` and show the final state immediately.

## Application-specific patterns

### Fixed stepper

The stepper stays fixed at the top. Its height and the application shell offset use the same `--app-stepper-height` variable. Desktop shows Chinese and English; compact mobile may hide text when the numbered sequence remains understandable and has a bilingual accessible name.

### Review before submission

Group fields by company level. Show all non-empty values that will be submitted. Omit internal-only, empty, disabled, and irrelevant fields. Provide a bilingual edit action for each group. Display arrays as readable tags and machine values in monospace.

### Successful submission

Use one core result card. The application number is the strongest visual element, with its copy action beside or immediately below it. Place the image-saving action in the same card as the only primary button; do not split the number, download prompt, and application summary into separate nested cards. Put submission time, application hierarchy, and the leave-page reminder below a divider as secondary information. The saved confirmation image includes only the application number, submission time, application levels, codes, and names. It excludes passwords, admin accounts, email addresses, and IP allowlists.

## Good and bad examples

Good:

- `color: var(--color-text-muted)` for explanatory text.
- Reuse `FieldLabel`, `FieldHint`, `BilingualHint`, and `StepFooterActions`.
- A bilingual error beside the field plus keyboard focus on failed submit.
- A single primary action supported by clearly subordinate actions.

Bad:

- `color: #1677ff` inside a component.
- Chinese-only placeholder, toast, dialog, or icon label.
- English text at 10 px or very low opacity.
- A grid of identical floating cards with no information hierarchy.
- A primary button for every available action.
- Passwords or IP allowlists in a downloadable confirmation image.

## Pre-delivery checklist

Every item must pass before UI work is complete:

- [ ] All visible copy and accessible names are bilingual.
- [ ] Components use semantic tokens; no new raw component hex colors exist.
- [ ] Light and dark themes both preserve hierarchy and readable contrast.
- [ ] Keyboard focus is visible and follows a logical order.
- [ ] Primary touch targets are at least 44 × 44 px.
- [ ] Loading, success, empty, disabled, and error states are understandable.
- [ ] The layout works without horizontal scrolling at 375, 768, 1024, and 1440 px.
- [ ] `prefers-reduced-motion` is respected.
- [ ] Sensitive information is masked and excluded from shareable artifacts.
- [ ] `yarn lint`, `yarn test`, and `yarn build` pass.
- [ ] The changed flow is manually checked in the browser.
