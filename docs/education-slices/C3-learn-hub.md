# Claude Code — C3 Learn hub shell

```text
Repo: Maple-maker/thesis — git pull origin main first.

Read:
1. CLAUDE.md
2. docs/current-slice.md
3. docs/education-full-program.md (C3)
4. src/app/learn.tsx (current = full glossary — refactor)
5. src/data/courses.ts (C2 — 16 lessons)
6. src/components/ui/ListRow.tsx, Card.tsx

Implement ONLY phase C3. Do NOT build lesson player (C4) or full Ask chat (A3).

## Goal

Turn /learn into a hub with three paths: Ask Thesis | Courses | Glossary.

## Tasks

### 1) Refactor learn.tsx

- Default view = **hub** (ScrollView):
  - Keep header: kicker "Learn", title, close (router.back())
  - Subtitle: educational, zero-jargon framing
  - Three large entry **Cards** (or ListRow-style), Daylight styling:

    **Ask Thesis**
    - Subtitle: "Questions answered in plain English, framed by your profile."
    - onPress → router.push("/ask")

    **Courses**
    - Subtitle: "Short lessons — credit, compounding, Roth IRA, stocks & ETFs."
    - onPress → router.push("/courses")

    **Glossary**
    - Subtitle: "Tap any term for a full explainer."
    - onPress → setView("glossary") OR router.push("/learn/glossary") if you split routes

- **Glossary view**: extract existing tiered concept list from current learn.tsx into same file (view state) or `src/components/learn/GlossaryView.tsx` — preserve expand/collapse, ExplainSheet if already wired, experience filter via conceptsForExperience.

- Hub shows optional footer disclaimer: "Educational tool — not investment advice."

### 2) Courses catalog (minimal — not C4 player)

Add `src/app/courses/index.tsx`:
- Stack screen (register in src/app/_layout.tsx)
- Header back → router.back()
- Title "Courses"
- List all courses from courses() using ListRow:
  - leading: icon in brand-bg circle (cap / book / compass — pick per course)
  - title: course.title
  - subtitle: `${lessons.length} lessons · ~${totalMin} min` (sum estimatedMin)
  - onPress → router.push(`/courses/${course.id}`) 

Add `src/app/courses/[courseId]/index.tsx` — **syllabus stub only**:
- courseById, lessonsForCourse
- List lessons with order + title + estimatedMin
- onPress lesson → Alert or Text "Lesson player coming in C4" OR disabled — do NOT implement full player
- This is OK for C3; C4 replaces stub

### 3) Ask stub

Add `src/app/ask.tsx`:
- Register in _layout (modal like learn)
- Header + back
- Placeholder: "Ask Thesis — coming soon" + short disclaimer
- Optional: 2–3 disabled suggestion chips (non-functional)
- C3 must not implement assistant-chat (A2)

### 4) Root layout

Update src/app/_layout.tsx Stack.Screen entries:
- courses (folder) — stack push
- ask — modal presentation slide_from_bottom (match learn)

### 5) Do NOT

- LessonPlayerLayout / quiz UI (C4)
- course-recommendations (C6)
- Zustand progress (C5) — show 0% or hide progress on catalog
- Change C2 lesson content

## Acceptance

- [ ] /learn opens hub with 3 entries
- [ ] Glossary still works (same content as before)
- [ ] /courses lists 4 courses with lesson counts
- [ ] /courses/[id] shows syllabus of 4 lessons
- [ ] /ask opens stub
- [ ] Close/back navigation works
- [ ] npx tsc --noEmit passes

When done: list files changed + Simulator QA steps.
```
