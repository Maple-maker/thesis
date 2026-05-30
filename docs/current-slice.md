# Current slice — E2 ExplainSheet

**Owner:** Cursor  
**Implementer:** Claude Code  
**Last updated:** 2026-05-29  
**Status:** Not shipped — no `ExplainSheet.tsx` in repo yet.

---

## Goal

Add reusable **ExplainSheet** so finance terms can be taught from duel metrics, stock stats, and (later) TermLink / insight copy.

## Non-goals

- Wiring duel (E3) or stock stats (E4) — separate sessions after E2
- Stock signals (E8–E9), TermLink (E5), InsightSheet (U4), Themes ListRow (U5)
- New concepts in `concepts.ts` unless a label has no matching `ConceptId`

## Product constraints

- Educational only — not investment advice
- Daylight UI (`src/components/ui/` patterns)
- Dismissible sheet/modal

## Implementation spec

See **E2** in `docs/education-roadmap.md`:

- `src/components/ExplainSheet.tsx` — props: `conceptId`, `visible`, `onClose`
- Load via `conceptById()` from `src/data/concepts.ts`
- Show: `term`, `body`, optional `whyItMatters`, related concepts (chips OK as noop)
- Optional: `src/hooks/useExplainSheet.ts`

## Files to touch

| File | Intent |
|------|--------|
| `src/components/ExplainSheet.tsx` | New |
| `src/hooks/useExplainSheet.ts` | Optional |

## Acceptance checks

- [ ] Any concept from `concepts.ts` renders in sheet
- [ ] Close control works
- [ ] `npx tsc --noEmit` passes
- [ ] No duel/stock wiring required this slice

## Verify

```bash
cd /Users/jaidenrabatin/Projects/thesis
npx tsc --noEmit
```

## Context

**Shipped:** reveal reasons, `concepts.ts`, `InsightCard` + `context-insights` on stock, `ListRow`/`MetricChip`.  
**Today plan:** `docs/today.md`  
**Next after E2:** E3 duel taps → E4 stock stats → E8/E9 signals.
