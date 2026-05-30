# Slice template

Copy into `docs/current-slice.md` when starting new work.

```markdown
# Current slice

**Owner:** Cursor (planning / framing)  
**Implementer:** Claude Code or Cursor Agent

**Last updated:** YYYY-MM-DD

## Goal

(one paragraph — what ships in this slice)

## Non-goals

- (explicit out-of-scope items)

## Product constraints

- Educational only — not investment advice
- (any slice-specific constraints)

## Files to touch

| File | Intent |
|------|--------|
| `path` | what to change |

## Acceptance checks

- [ ] (testable outcome)
- [ ] `npx tsc --noEmit` passes
- [ ] (manual QA step)

## Context for implementer

(bullets: prior art, APIs, design notes)

## After this slice

(next slice one-liner for Cursor backlog)
```
