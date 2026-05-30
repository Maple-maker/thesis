# Today’s plan — Thesis (education expansion)

**Date:** 2026-05-29  
**Repo:** https://github.com/Maple-maker/thesis  
**Program:** [`docs/education-full-program.md`](education-full-program.md)

---

## North star today

Ship the **foundation for courses + Ask Thesis**, not everything in one shot.

| Priority | Phase | Outcome |
|----------|-------|---------|
| 1 | **C1** | `courses.ts` data model |
| 2 | **C2** | 4 courses × 4 lessons (credit, compound interest, Roth IRA, etc.) |
| 3 | **C3** | Learn hub: **Ask \| Courses \| Glossary** |
| Stretch | **A1** | Assistant system prompt + context builder |

**Active slice:** `docs/current-slice.md` → **C1**

---

## Claude Code kickoff

```text
Repo: Maple-maker/thesis — git pull origin main.

Read CLAUDE.md, docs/current-slice.md, docs/education-full-program.md, docs/education-slices/MASTER-education-build.md.

Implement ONLY phase C1. Full education program is phased — do not build Ask UI or all 16 lessons in this session.

npx tsc --noEmit when done.
```

---

## This week (order)

```text
C1 → C2 → C3 → C4 → C5 → C6   (courses)
A1 → A2 → A3 → A4 → A5         (Ask Thesis AI)
```

Finish **E3/E4** (duel + stock ExplainSheet taps) if not already on `main`.

---

## End of day

- [ ] Push `docs/*` + any `src/` changes
- [ ] Cursor sets `current-slice.md` to **C2** for tomorrow
