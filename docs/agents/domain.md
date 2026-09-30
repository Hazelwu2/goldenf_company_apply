# Domain Docs

## Before exploring, read these

- `CONTEXT.md` at the repo root
- `CONTEXT-MAP.md` if it exists
- Relevant ADRs under `docs/adr/`

If these files do not exist, proceed silently.

## File structure

This is a single-context repository:

```
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Use the glossary's vocabulary

Use terms as defined in `CONTEXT.md`. Avoid synonyms that the glossary explicitly rejects.

If a required concept is missing, reconsider the terminology or note the gap for domain modeling.

## Flag ADR conflicts

Explicitly report when a proposed change contradicts an existing ADR instead of silently overriding it.
