# Current slice — C1 Course data model

**Owner:** Cursor  
**Implementer:** Claude Code  
**Last updated:** 2026-05-29  
**Program:** `docs/education-full-program.md` · Master prompts: `docs/education-slices/MASTER-education-build.md`

---

## Goal

Start **structured courses** (separate from glossary). Add types + empty/skeleton curriculum file — no UI this slice.

## Non-goals

- 16 lessons of copy (C2), Learn hub (C3), AI assistant (A1–A5)
- Changing `concepts.ts` content (except types import if needed)

## Product constraints

- Educational only — not investment advice
- Lessons will later include: credit score, interest rates, compound interest, Roth IRA (C2)

## Implementation spec

See **C1** in `docs/education-full-program.md`:

- `src/data/courses.ts`
- Types: `CourseId`, `Course`, `Lesson`, `LessonSection`
- Exports: `courses()`, `courseById(id)`, `lessonsForCourse(courseId)`, `lessonById(lessonId)`

Skeleton: define 4 `CourseId`s with titles/descriptions only; lessons array empty or 1 placeholder each.

## Acceptance checks

- [ ] Types exported and used consistently
- [ ] Four course IDs defined matching program doc
- [ ] `npx tsc --noEmit` passes
- [ ] No UI routes added

## Verify

```bash
cd /Users/jaidenrabatin/Projects/thesis
npx tsc --noEmit
```

## Next slice

**C2** — fill 16 lessons (4 courses × 4 lessons).
