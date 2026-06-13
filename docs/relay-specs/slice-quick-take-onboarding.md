# Slice — Quick Take onboarding + model portfolio reveal

**Owner:** Cursor (planning)
**Implementer:** Claude Code — implement this slice only. Read `AGENTS.md` before starting.

**Status:** Not started
**Prerequisite:** Current slice (`reveal.tsx` reasons) must ship first.

---

## Goal

Add a **pre-signup Quick Take flow** that runs before the user creates an account. It asks 5 focused questions, produces a Thesis recommendation, and shows a model portfolio with performance — giving a first-time visitor a reason to sign up before they've committed to anything.

The existing Thesis Builder (4 chapters, 16 questions) remains intact as the post-signup deep-build experience.

---

## Why this shape

The current onboarding requires full questionnaire completion before any payoff. A new user with no account hits 16 questions with no preview of what they'll get. Quick Take flips this: **demonstrate value first, collect commitment second**.

---

## Non-goals (this slice)

- Auth / sign-up implementation — human-only step, do not build
- Replacing or modifying the existing Thesis Builder flow
- Live stock price API integration — separate slice (Track 2)
- Any changes to `theme-engine.ts` scoring rules
- Personalized learning paths, Stress Test, CFO features

---

## Product constraints

- Educational tool — **not investment advice**. No buy/sell language anywhere.
- Model portfolio is a "starting point to learn from," not a recommendation.
- Every screen that shows stock names or performance must carry the disclaimer: `"Educational · illustrative only · not investment advice"`
- Preserve Daylight tokens (`bg`, `bg-surface`, `brand`, `ink`, `ink-2`, `ink-3`) and existing UI primitives.

---

## New route structure

```
src/app/
  quick-take/
    index.tsx        ← entry screen ("See your investing lens in 2 min")
    step/[index].tsx ← 5 question screens (reuse StepScreen pattern)
    result.tsx       ← Thesis name + model portfolio card
```

The existing `onboarding/` routes are untouched.

The root redirector (`src/app/index.tsx`) should route:
- `onboarding === "not-started"` → `/quick-take` (new)
- `onboarding === "in-progress"` → `/onboarding/step/0` (existing)
- `onboarding === "complete"` → `/(tabs)` (existing)

---

## Quick Take question set (5 questions)

These are a distilled subset of existing `UserProfile` fields. They map directly to existing `QuestionId` values — no new store fields needed.

```ts
// src/data/quick-take-questions.ts  (new file)

import type { Step } from "@/data/questionnaire";
import type { Horizon, RiskTolerance } from "@/store/types";

export const QUICK_TAKE_STEPS: Step[] = [
  {
    id: "qt-horizon",
    title: "When do you need this money?",
    subtitle: "This shapes everything.",
    questions: [
      {
        kind: "choice",
        id: "horizon",
        prompt: "",
        options: [
          { value: "short",     label: "Within 3 years" },
          { value: "medium",    label: "3–7 years" },
          { value: "long",      label: "7–15 years" },
          { value: "very-long", label: "15+ years" },
        ],
      },
    ],
  },
  {
    id: "qt-risk",
    title: "How do you handle a bad month?",
    subtitle: "Your honest answer, not your optimistic one.",
    questions: [
      {
        kind: "choice",
        id: "reactionToDrawdown",
        prompt: "",
        options: [
          { value: "panic-sell", label: "I'd want out" },
          { value: "hold",       label: "Hold and don't look" },
          { value: "buy-more",   label: "Buy more — sale prices" },
        ],
      },
    ],
  },
  {
    id: "qt-goal",
    title: "What's the main job for this money?",
    subtitle: "",
    questions: [
      {
        kind: "choice",
        id: "primaryGoal",
        prompt: "",
        options: [
          { value: "retirement",  label: "Long-term retirement" },
          { value: "wealth",      label: "General wealth building" },
          { value: "income",      label: "Generate income now" },
          { value: "exploration", label: "Learn the market" },
        ],
      },
    ],
  },
  {
    id: "qt-interest",
    title: "What theme pulls at you most?",
    subtitle: "Pick one — you can add more later.",
    questions: [
      {
        kind: "choice",
        id: "qtInterest",  // single-choice proxy; see mapping below
        prompt: "",
        options: [
          { value: "ai",      label: "AI & technology" },
          { value: "climate", label: "Clean energy & climate" },
          { value: "health",  label: "Healthcare & biotech" },
          { value: "brands",  label: "Consumer brands" },
          { value: "none",    label: "No strong preference" },
        ],
      },
    ],
  },
  {
    id: "qt-risk-tolerance",
    title: "How much volatility can you stomach?",
    subtitle: "",
    questions: [
      {
        kind: "choice",
        id: "risk",
        prompt: "",
        options: [
          { value: "low",      label: "Keep it steady" },
          { value: "medium",   label: "Some swings are fine" },
          { value: "high",     label: "I can handle big swings" },
          { value: "very-high", label: "Volatility doesn't bother me" },
        ],
      },
    ],
  },
];
```

**`qtInterest` mapping** — before calling `generateThemes()`, convert `profile.qtInterest` to `profile.interests[]`:

```ts
const INTEREST_MAP: Record<string, Interest[]> = {
  ai:      ["ai"],
  climate: ["climate"],
  health:  ["biotech"],
  brands:  ["consumer-brands"],
  none:    [],
};

// In result.tsx, before generateThemes:
const augmented = {
  ...DEFAULT_PROFILE,
  ...profile,
  interests: INTEREST_MAP[profile.qtInterest ?? "none"] ?? [],
};
const result = generateThemes(augmented, 3); // Top 3, not 5
```

> Note: `qtInterest` is a temporary field only used in the Quick Take flow. Add it to `UserProfile` as `qtInterest?: string`. It is not used by the full Thesis Builder.

---

## Result screen (`quick-take/result.tsx`)

### Layout (top to bottom)

1. **Header block**
   - Kicker: `YOUR THESIS PREVIEW` (brand, sansX, uppercase)
   - Headline: `"[Theme title]"` — display font, 32px
   - Sub: "Based on what you told us." — ink-2, 15px

2. **Featured theme card** (reuse `FeaturedCard` from `reveal.tsx`)
   - Gradient background using `theme.color`
   - `theme.thesis` text
   - 2 reasons from `result.reasons[featured.id]` (same `ReasonBullets` pattern)

3. **Model portfolio section**
   - Section label: `YOUR STARTING POINT` (ink-3, sansX, uppercase)
   - 5 stocks from `rankStocksForTheme(featured.id, profile, 5)`
   - Each row: symbol (mono font), company name, sector tag
   - NO prices in this slice — Track 2 adds live prices
   - Disclaimer: `"Illustrative · not a recommendation · educational only"`

4. **Sign-up gate CTA**
   - `Button` label: `"Build your full thesis"`
   - Full-width, size="lg"
   - `onPress`: navigate to sign-up (placeholder — auth is a human step)
   - Below button: `"Already have an account? Sign in"` — ink-3, 13px, tappable

5. **Footer note**
   - "Nothing here is financial advice. Educational tool only." — ink-3, 11px, centered

### Stock row component

```tsx
// Local to result.tsx (or extract to src/components/ui/StockRow.tsx)
function StockRow({ stock }: { stock: Stock }) {
  return (
    <View className="flex-row items-center px-3 py-3 border-b border-line last:border-0">
      <View className="flex-1">
        <View className="flex-row items-center gap-x-2">
          <Text className="text-ink font-monoBold text-[14px]">{stock.symbol}</Text>
          <View className="bg-bg-subtle px-2 py-0.5 rounded-[6px]">
            <Text className="text-ink-3 text-[11px] font-sansX uppercase">{stock.sector}</Text>
          </View>
        </View>
        <Text className="text-ink-2 text-[13px] font-sansMd mt-0.5">{stock.name}</Text>
      </View>
      <Icon name="chevron-right" size={16} color="var(--ink-3)" />
    </View>
  );
}
```

---

## Store changes

Add `qtInterest` to `UserProfile` in `src/store/types.ts`:

```ts
// Existing UserProfile, add:
qtInterest?: string;  // Quick Take only — single theme interest proxy
```

Add to `DEFAULT_PROFILE` in `src/data/questionnaire.ts`:

```ts
qtInterest: undefined,
```

---

## Entry screen (`quick-take/index.tsx`)

Keep it tight. One screen, no chapter list.

```
[logo]   thesis

Your investing lens,
in 2 minutes.

5 questions. A theme that fits.
No account needed.

[Begin →]  (full-width button)

───────────────────
"Not investment advice. Educational tool."
```

Animation: `FadeInDown` on the tagline block, `FadeInUp` on the button — same reanimated pattern as `onboarding/index.tsx`.

---

## Files to create / touch

| File | Action |
|------|--------|
| `src/app/quick-take/index.tsx` | **Create** — entry screen |
| `src/app/quick-take/step/[index].tsx` | **Create** — can be a thin wrapper calling StepScreen logic with `QUICK_TAKE_STEPS` |
| `src/app/quick-take/result.tsx` | **Create** — primary deliverable |
| `src/data/quick-take-questions.ts` | **Create** — question set |
| `src/store/types.ts` | **Edit** — add `qtInterest?: string` to `UserProfile` |
| `src/data/questionnaire.ts` | **Edit** — add `qtInterest: undefined` to `DEFAULT_PROFILE` |
| `src/app/index.tsx` | **Edit** — update root redirector |

---

## Acceptance checks

- [ ] Quick Take entry screen loads on first launch (onboarding === "not-started")
- [ ] 5 questions render correctly, progress bar shows 1/5 → 5/5
- [ ] Answering all 5 and tapping "See my thesis" navigates to `result.tsx`
- [ ] Result screen shows: featured theme card with 2 reasons, 5 stock rows
- [ ] "Build your full thesis" button exists (can be a placeholder `console.log` — auth is human step)
- [ ] Disclaimer visible on result screen
- [ ] No recommendation language ("buy", "you should own", "invest in") anywhere
- [ ] Existing `onboarding/` routes are untouched — long-press logo reset still works
- [ ] `npx tsc --noEmit` passes

---

## Verify

```bash
cd /Users/jaidenrabatin/Projects/thesis
npx tsc --noEmit
npm run ios   # QA: first launch → Quick Take entry screen
```

---

## After this slice

1. **Track 2** — Polygon.io fetch layer replacing mock prices in `stock-financials.ts`; live prices appear in `result.tsx` model portfolio rows
2. **Track 3** — Visual style pass: type contrast, reveal animation upgrade, spacing
3. **Auth integration** — human-only step; sign-up gate CTA gets wired when auth is ready
