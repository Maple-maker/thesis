# Paste queue — after each C phase completes

`git pull` → paste **next block** only.

| Done | Paste file |
|------|------------|
| C1 | C2 below |
| C2 | C3 below |
| C3 | C4 below |
| C4 | C5 below |
| C5 | C6 below |
| C6 | A1 in MASTER-education-build.md |

---

## C3 (after C2)

See `C3-learn-hub.md`

---

## C4 (after C3)

```text
Repo: Maple-maker/thesis — git pull. Implement ONLY C4.

Read: CLAUDE.md, docs/design-reference-robinhood-learn.md, src/data/courses.ts, src/components/ExplainSheet.tsx.

Add src/app/courses/[courseId]/[lessonId].tsx — full lesson player:
- One screen per lesson step (content | quiz from courses.ts)
- Segmented progress bar; Continue; X → syllabus
- Content: title, paragraphs, didYouKnow?, profileAside, conceptLinks → ExplainSheet
- Quiz: options, brand highlight on correct, feedback, Continue
- LessonPlayerLayout: text panel + visual (Icon/glyph); stack on narrow screens
- Last step: keyTakeaways; mark flow OK without C5 store (local state OK)

Wire syllabus lesson rows: router.push(`/courses/${courseId}/${lessonId}`) — remove C3 stub.

Daylight only. No trade CTAs. npx tsc --noEmit.
```

---

## C5 (after C4)

```text
Repo: Maple-maker/thesis — git pull. Implement ONLY C5.

Extend src/store: completedLessons, markLessonComplete, courseProgressPercent helpers. Persist AsyncStorage.
Wire lesson player Mark complete + catalog/syllabus progress bars.
npx tsc --noEmit.
```

---

## C6 (after C5)

```text
Repo: Maple-maker/thesis — git pull. Implement ONLY C6.

Add src/lib/course-recommendations.ts. "Recommended for you" on Learn hub + optional Home card from UserProfile.
npx tsc --noEmit.
```
