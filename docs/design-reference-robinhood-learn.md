# Design reference — Robinhood Learn / Educate

**Source:** User screen recording (2026-05-30) + public Robinhood Learn patterns.  
**Use with:** `docs/education-full-program.md` phases C3–C5, lesson player C4.

**Thesis rule:** Adapt **structure and clarity**, not Robinhood branding, neon, or “Learn and Earn” crypto rewards.

---

## What Robinhood Educate does well (steal the pattern)

### 1. Learning hub

- Dedicated place to **browse paths**, not buried in settings.
- Clear **progress** (started / completed).
- Short modules — “before your first trade” mental model.

**Thesis:** `/learn` → **Courses | Glossary | Ask** with progress rings on course cards.

### 2. Bite-sized lessons (reading flow)

- One idea per screen; **Next** advances (not a wall of text).
- Friendly illustrations or simple icon metaphors per lesson.
- Titles like “Why invest?”, “What’s the stock market?” — question-shaped headers.

**Thesis:** Lesson player = **paginated sections** (1–2 short paragraphs per step), progress dots at top, **~3–5 min** per lesson label.

### 3. Interactive “goals” lesson (quiz-style)

- Robinhood shipped “What are your goals?” — taps for short / medium / long term.
- **Thesis already has questionnaire** — do not duplicate. Instead:
  - Lesson epilogue: “This matches what you told us in your thesis builder” (read-only profileAside).
  - Optional **knowledge check** (1–2 multiple choice, no rewards): “What does compound interest mean?”

### 4. Contextual entry points

- Cards on **Home** and **Browse** surfacing the next lesson.
- **Thesis:** Home card “Continue: Credit & borrowing · Lesson 2” + Themes/duel empty states link to relevant course.

### 5. Glossary / articles (secondary)

- Long-form hub on web; in-app = modules first.
- **Thesis:** Glossary = existing `learn.tsx` concept cards; courses = primary path.

---

## What NOT to copy

| Robinhood | Why skip in Thesis |
|-----------|-------------------|
| Learn and Earn (crypto rewards) | Regulatory / advice optics; not educational core |
| “Make your first trade” CTA in lesson footer | Thesis is decision-support, not brokerage |
| Surfaces that reduced funding in A/B | No pressure to “fund account” |
| Generic goals quiz | Replaced by thesis-builder onboarding |

---

## Thesis lesson player spec (Robinhood-inspired, Daylight)

### Layout (one step per page)

```text
[←]  Lesson title          Step 2 of 5
● ● ○ ○ ○

[Optional icon / glyph in brand-bg circle]

## Section heading
Body paragraph (max ~80 words).
Tap term → ExplainSheet.

[Primary: Continue]
[Secondary: Mark complete] (last step only)
```

### Course catalog card (ListRow + Robinhood clarity)

```text
[icon]  Credit & borrowing
        4 lessons · ~18 min
        ████░░  50% complete
        >
```

### Knowledge check (optional C4b)

- Single screen at lesson end; 2 MC options; instant feedback (“Not quite — …” / “Right — …”).
- No money, no crypto, no streak gamification.

---

## Content mapping (your requested topics → Robinhood-style paths)

| Robinhood-style path | Thesis course |
|---------------------|---------------|
| Why invest / goals | Investing building blocks + profileAside |
| Stock market basics | Investing building blocks |
| Budgeting / credit | Credit & borrowing (+ build credit lesson) |
| Retirement accounts | Retirement & tax-advantaged accounts |
| Interest & compounding | Money foundations |

---

## Claude Code implementation notes

| Phase | Robinhood pattern to implement |
|-------|-------------------------------|
| **C3** | Hub with course cards + progress |
| **C4** | Paginated lesson player, step indicator, Continue CTA |
| **C4b** (stretch) | End-of-lesson knowledge check |
| **C6** | Home “Continue learning” card |
| **C5** | Persist last lesson + % complete |

**Components to add:**

- `LessonProgressDots` — `src/components/ui/LessonProgressDots.tsx`
- `LessonStepView` — body + optional `TermLink`
- `CourseProgressBar` — thin bar on catalog cards

**Styling:** Daylight (`bg`, `bg-surface`, `brand`, `font-displayX`) — not Robinhood black/green neon.

---

## Differentiators (sell Thesis vs Robinhood Educate)

1. **Thesis-linked** — lessons reference questionnaire + matched themes.  
2. **Ask Thesis** — profile-aware Q&A (Robinhood uses articles + support).  
3. **Duels + journal** — apply learning to choices, not “place a trade.”  
4. **Diligence signals** — “Watch” notes (CEO churn, etc.) on stocks.

---

## If refining from the recording

Drop **PNG screenshots** of key frames into `assets/reference/robinhood-learn/` and add captions under this doc — Claude Code can match spacing and hierarchy more closely.
