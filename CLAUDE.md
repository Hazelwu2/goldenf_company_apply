# Claude instructions

UI work: before changing any page, component, color, typography, spacing, responsive behavior, copy, or interaction, read and follow [`docs/UI_DESIGN_SYSTEM.md`](docs/UI_DESIGN_SYSTEM.md). Treat it as the product UI contract. Reuse existing semantic tokens and components, then complete its pre-delivery checklist.

Vendor dropdown (產品商下拉選單): [`docs/產品商下拉選單規格.md`](docs/產品商下拉選單規格.md) is the single source of truth for its rules. Any change to vendor filtering, grouping, invalid-selection handling, or the vendor list API must update that doc (including its code map and decision log) in the same change. Other docs only describe API formats and link to it.

## Agent skills

### Issue tracker

Issues and specs are tracked as local Markdown under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The default Matt Pocock skills triage vocabulary is used. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context domain documentation layout. See `docs/agents/domain.md`.
