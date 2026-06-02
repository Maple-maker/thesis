# Design reference — Robinhood Learn (ETF lesson)

**Source:** `robinhood.com/education/lesson/naseL4BTPCSLq587rWxxK` — user screenshots 2026-05-30.  
**Assets:** `assets/Screenshot_2026-05-30_at_13.35*.png` (reference frames).  
**Use with:** `docs/education-full-program.md` phases **C3–C5**, **C4b** (quizzes).

**Thesis rule:** Copy **lesson architecture** and **pedagogy**; use **Daylight** (light text panel + brand accent visual panel), not Robinhood black/neon web theme.

---

## Lesson anatomy (from “What’s an ETF?” module)

Robinhood strings **~10+ steps** into one module:

| Step type | Example from screenshots | Purpose |
|-----------|-------------------------|---------|
| **Intro** | “What’s an ETF?” + **4 min** pill + 3 short paragraphs + promise (“At the end…”) | Set expectations |
| **Concept** | “What’s a stock?” — fictional **Cam’s Climbing Gear**, bold **stock** / **shares**, bullet examples | Anchor metaphor |
| **Concept** | “What’s the stock market?” — **trading**, hours, **Did you know?** (market ≠ economy) | Build vocabulary |
| **Concept** | “How are stocks traded?” — buyer/seller, **GEAR** ticker | Link narrative |
| **Concept** | “What’s a public company?” — callback to Cam’s purchase | Story continuity |
| **Analogy** | “ETFs are like smoothies” — blender illustration, multi-asset sip | Memorable frame |
| **Concept** | “Different ETFs… different assets” — smoothie **flavors** | Extend analogy |
| **Concept** | “ETFs can help with risk management” — **diversification**, smoothie callback | Tie to goals |
| **Concept** | “Keeping your cool” — **risk tolerance**, emotions | Bridge to profile |
| **Quiz** | “What represents a piece of ownership?” → **A stock** → **Exactly!** feedback | Check understanding |
| **Quiz** | “What are the two sides of any trade?” — 3 options, radio style | Another check |

**URL pattern:** `.../lesson/{id}?origin=/&source=browse#section-N` — one route, **indexed sections**.

---

## UI patterns (screenshots)

### Split panel (desktop / tablet)

```text
┌─────────────────────────┬─────────────────────────┐
│  PROGRESS BAR (thin)    │                    [X]  │
│  [4 min] (intro only)   │                         │
│                         │   Illustration /        │
│  Headline (large)       │   metaphor art          │
│  Short paragraphs       │   (3D or flat SVG)      │
│  Bold key terms         │                         │
│  Did you know? (opt)    │                         │
│                         │                         │
│  [ Continue ]           │                         │
└─────────────────────────┴─────────────────────────┘
   TEXT: black bg, white type     VISUAL: bold color bg
```

**Thesis (Daylight) adaptation:**

```text
┌─────────────────────────┬─────────────────────────┐
│  segmented progress     │                    [X]  │
│  [~4 min]               │   theme.color panel     │
│  font-displayX headline │   Icon glyph large      │
│  font-sansMd body       │   or course illustration│
│  bold → font-sansBold   │                         │
│  TermLink (brand teal)  │                         │
│  profileAside (brand-bg)│                         │
│  [ Continue ]           │                         │
└─────────────────────────┴─────────────────────────┘
   bg-surface / white          brand-bg or theme tint
```

On **phone:** stack **visual on top** (shorter), text below — still one step per screen.

### Progress bar

- Full-width thin line; **completed segments = white/brand**, remainder muted.
- Maps to `stepIndex / totalSteps` — not only dot indicators.

### Intro step extras

- Pill: clock icon + **“4 min”** (use `estimatedMin` on `Lesson`).

### Body copy rules (from Robinhood)

- **Short paragraphs** (2–4 lines max per block).
- **Bold** first use of a term (`exchange-traded fund`, `diversification`).
- **Callbacks:** “Think back to our smoothie example…” — courses should define one `courseMetaphor` string per course.
- **Did you know?** optional callout component — one sentence, prefixed label.
- **Fictional company** (Robinhood): Cam’s Climbing Gear / GEAR — **Thesis:** optional `courseNarrative` (“your watchlist names”) or neutral examples; avoid implying real tickers unless from `stocks.ts` demo set.

### Continue button

- Pill outline, bottom-left on text panel; label **Continue** (last step: **Done** or **Mark complete**).

### Quiz step (separate layout branch)

```text
Question (large)
┌─────────────────────────────┐
│ ○  A buyer and seller       │  ← bordered option rows
└─────────────────────────────┘
┌─────────────────────────────┐
│ ●  A stock          ✓       │  ← selected: green border (Thesis: brand)
└─────────────────────────────┘
Exactly! When you buy a stock…   ← instant feedback paragraph
[ Continue ]
```

- **Thesis:** `LessonStep.kind: "content" | "quiz"`
- Quiz: `question`, `options[]`, `correctIndex`, `correctFeedback`, `incorrectFeedback`
- No rewards; max 1–2 quizzes per lesson.

---

## Data model extension (for Claude Code C1/C2)

```ts
type LessonStep =
  | {
      kind: "content";
      id: string;
      title: string;
      paragraphs: string[];
      boldTerms?: string[];
      didYouKnow?: string;
      conceptLinks?: ConceptId[];
      profileAside?: (profile: UserProfile) => string | null;
      visual?: "glyph" | "metaphor" | "none";
    }
  | {
      kind: "quiz";
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
      correctFeedback: string;
      incorrectFeedback: string;
    };

type Lesson = {
  id: string;
  courseId: CourseId;
  title: string;
  estimatedMin: number;
  steps: LessonStep[];  // ordered — replaces flat sections[]
  keyTakeaways: string[]; // show after last step
};
```

---

## Thesis course ↔ Robinhood parallel

| Robinhood module (ETF path) | Thesis course / lesson |
|----------------------------|-------------------------|
| Stock / market / trading basics | Investing building blocks |
| Smoothie → ETF analogy | What is an ETF? (`what-is-etf` concept) |
| Diversification / risk | Money foundations + profile risk lesson |
| Risk tolerance / emotions | Tie to questionnaire + **profileAside** |
| Quizzes | End of lesson `kind: "quiz"` steps |
| Credit / Roth / compound (your list) | Money foundations, Credit, Retirement courses |

---

## Components to build (C4 / C4b)

| Component | Responsibility |
|-----------|----------------|
| `LessonPlayerLayout` | Split / stacked panels, X close, progress segments |
| `LessonContentStep` | Headline, body, DidYouKnow, profileAside, Continue |
| `LessonQuizStep` | Options, selection state, feedback, Continue |
| `LessonTimePill` | `3 min` / `4 min` on first step only |
| `LessonVisualPanel` | Right (or top) — `Icon` + course color; v1 skip 3D blender |

---

## What NOT to copy

- Black/neon web-only aesthetic as default (use Daylight; optional dark lesson mode later).
- Learn and Earn crypto rewards.
- “Fund account” / “Place trade” after lesson.
- Cam’s Climbing Gear verbatim (trademark-style fiction) — use Thesis-native examples.

---

## Claude Code — C4 prompt addition

```text
Read docs/design-reference-robinhood-learn.md (ETF lesson screenshots).

Lesson player must support:
- lesson.steps[] with kind "content" | "quiz"
- Segmented progress bar across steps
- Split layout: text panel + visual panel (stack on narrow screens)
- Intro step shows estimatedMin pill
- Quiz step: bordered options, instant feedback, brand border on correct
- Continue pill button; X closes back to syllabus
- didYouKnow callout component optional on content steps

Daylight tokens only. No trade CTAs.
```

---

## Differentiators (Thesis vs this Robinhood lesson)

1. **profileAside** on content steps — links to thesis builder answers.  
2. **ExplainSheet** on TermLink / bold terms — deeper than one lesson.  
3. **Ask Thesis** after course — questions in context of themes.  
4. **Duels** — apply “stock vs ETF” style thinking without trading.
