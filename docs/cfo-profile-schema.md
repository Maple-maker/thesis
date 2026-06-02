# AI CFO profile schema

The thesis builder captures a **25-section CFO profile** that powers themes, radar, research, and Ask Thesis.

## Storage

- **Core fields** (flat on `CfoProfile`): legacy questionnaire keys — `age`, `risk`, `horizon`, `interests`, etc.
- **Extended** (`profile.extended.*`): nested sections (identity, goals, tax, crypto, …).
- **Derived** (`profile.derived`): computed scores — never user-edited.
- **Meta** (`profile.meta`): `completedChapters`, `completedSections`, `version`.

## Sections (25)

| # | Section ID | Key fields |
|---|------------|------------|
| 1 | `identity` | name, DOB, residence, employment, military |
| 2 | `goals` | primary + secondary goals, FI target, legacy |
| 3 | `timeHorizon` | years, goal-specific timelines |
| 4 | `risk` | tolerance, max drawdown, leverage |
| 5 | `behavioral` | philosophy, FOMO, panic history |
| 6–24 | income … personalization | See `src/types/cfo-profile.ts` |
| 25 | *(derived)* | `computeDerivedMetrics()` in `src/lib/cfo-derived-metrics.ts` |

## Builder flow

- **Onboarding:** `THESIS_BUILDER_CHAPTERS` (10 chapters) in `src/data/thesis-builder-chapters.ts`
- **Continue later:** `/thesis-profile` — section checklist + scorecard
- **Reveal + Home:** `CfoScorecard` shows readiness scores

## Master scorecard (derived)

Answers the AI CFO’s 10 questions:

1. Goals → `primaryGoal`, `extended.goals`
2. Timeline → `horizon`, `extended.timeHorizon`
3. Risk → `risk`, `extended.risk`
4. Constraints → `values`, `extended.restrictions`
5. Resources → `netInvestable`, `extended.balanceSheet`
6. Behavior → `reactionToDrawdown`, `extended.behavioral`
7. Philosophy → `extended.behavioral.investmentPhilosophy`
8. Unique opportunities → `extended.career`, `extended.militaryStatus`
9. Plan breakers → debt, liquidity, concentration scores
10. Delivery → `extended.communication`

## Adding fields

1. Add type in `src/types/cfo-profile.ts`
2. Add question(s) in `thesis-builder-chapters.ts` with path `extended.{section}.{field}`
3. Optionally tune `computeDerivedMetrics()` weights
