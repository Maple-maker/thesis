# MASTER — Claude Code: full education program

Use **one phase per session**. Read `docs/education-full-program.md` for full specs.

---

## Session kickoff (paste every time)

```text
Repo: Maple-maker/thesis — git pull origin main first.

Read in order:
1. CLAUDE.md
2. docs/current-slice.md  ← active phase only
3. docs/education-full-program.md
4. .cursor/rules/product-principles.mdc

Already on main (do not rebuild): concepts.ts, learn.tsx glossary, ExplainSheet, InsightCard, reveal reasons, thesis builder onboarding.

Implement ONLY the phase named in docs/current-slice.md.

Rules:
- Educational only — not investment advice
- Daylight UI, reuse src/components/ui/*
- npx tsc --noEmit before done
- List acceptance checks satisfied
- Do not commit unless I ask

Report: files changed, manual QA steps in Simulator.
```

---

## Phase prompts (copy phase into current-slice OR append to kickoff)

### C1 — Course data model

```text
Phase C1 only.

Create src/data/courses.ts with CourseId, Course, Lesson types (see education-full-program.md).
Export courses(), courseById(), lessonById(), lessonsForCourse().
No UI yet. npx tsc --noEmit.
```

### C2 — Pilot course content

```text
Phase C2 only.

Populate 4 courses × 4 lessons each (16 lessons) per education-full-program.md:
Money foundations, Credit & borrowing, Retirement accounts, Investing building blocks.

Reuse concepts.ts where possible; add conceptLinks on lessons.
Add profileAside functions on ≥8 lessons (plain English from UserProfile).
Add interest-rate lesson content in Money foundations (borrowing vs saving).
No UI yet.
```

### C3 — Learn hub shell

```text
Phase C3 only.

Redesign src/app/learn.tsx:
- Header: Learn
- Three entry cards: Ask Thesis, Courses, Glossary
- Glossary = move existing tiered concept list behind "Glossary" section or second screen
- Ask → router.push('/ask') stub OK if A3 not done
- Courses → router.push('/courses') stub OK if C4 not done

Keep modal close behavior. npx tsc --noEmit.
```

### C4 — Course + lesson player (Robinhood Educate–style)

Read docs/design-reference-robinhood-learn.md first.

```text
Phase C4 only.

Add routes:
- src/app/courses/index.tsx — catalog (ListRow + progress bar)
- src/app/courses/[courseId]/index.tsx — syllabus with ~min labels
- src/app/courses/[courseId]/[lessonId].tsx — paginated lesson player:
  one section per screen, LessonProgressDots, Continue/Back, Mark complete on last step
  conceptLinks → ExplainSheet; takeaways on final step only

Robinhood-inspired flow, Daylight styling. No trade/fund CTAs.
npx tsc --noEmit. QA: step through full lesson.
```

### C5 — Progress persistence

```text
Phase C5 only.

Extend src/store: completedLessons: string[], markLessonComplete(id), getters for course progress %.
Persist via existing AsyncStorage middleware.
Wire Mark complete on lesson screen + show progress on catalog. npx tsc --noEmit.
```

### C6 — Recommended courses

```text
Phase C6 only.

Add src/lib/course-recommendations.ts — rank courses from profile (e.g. no emergency fund → credit course first; short horizon → money foundations).
Show "Recommended for you" on Learn hub and optional card on Home.
No new advice language. npx tsc --noEmit.
```

### A1 — Assistant context

```text
Phase A1 only.

Create docs/assistant-system-prompt.md usage in src/lib/assistant-context.ts:
- buildAssistantSystemPrompt(profile, themeIds)
- buildProfileSummary(profile) — reuse or extend profile-summary if exists
- include top 3 themes from themeById

No UI. Unit-testable pure functions. npx tsc --noEmit.
```

### A2 — Chat backend (mock + API)

```text
Phase A2 only.

Create src/lib/assistant-chat.ts:
- sendAssistantMessage({ messages, profile, themeIds })
- mock mode: pattern match + template answers using profile
- api mode: Anthropic messages API if EXPO_PUBLIC_ANTHROPIC_API_KEY set
- EXPO_PUBLIC_ASSISTANT_MODE=mock|api

Document env vars in README. Never commit API keys. npx tsc --noEmit.
```

### A3 — Ask UI

```text
Phase A3 only.

Create src/app/ask.tsx (modal or stack screen):
- Chat UI, disclaimer header, send message via assistant-chat
- Loading + error states
- Link from Learn hub Ask card

Wire _layout.tsx if needed. npx tsc --noEmit.
```

### A4 — Suggested questions

```text
Phase A4 only.

On ask.tsx: horizontal chips with 4–6 profile-aware questions (e.g. "What is a Roth IRA for someone at my tax stage?" generated from templates + profile fields).
Tap fills input. npx tsc --noEmit.
```

### A5 — Guardrails

```text
Phase A5 only.

Harden assistant-chat: detect buy/sell prompts → refusal template from assistant-system-prompt.md.
Empty API key → fallback mock with one-time console warn.
Rate limit: max 1 request / 2s. npx tsc --noEmit.
```

---

## Suggested build order

```text
C1 → C2 → C3 → C4 → C5 → C6
         ↘ A1 → A2 → A3 → A4 → A5   (A1 can start after C2)
E3, E4, E8, E9 in parallel if not on main
```

---

## Single mega-prompt (NOT recommended — context overflow)

Only if you must:

```text
Implement the full education program in docs/education-full-program.md in order C1→C6 then A1→A5. One commit per phase logic but you may batch if I explicitly allow. Stop every 3 phases for tsc. This will take multiple hours — prefer stopping after each phase with a summary.
```

Prefer phased kickoffs above.
