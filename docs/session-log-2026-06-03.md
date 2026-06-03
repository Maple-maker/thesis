# Session log — 3 June 2026

## Where we were
We were in the middle of a **5-phase build sequence**:
1. **Affiliate surfaces** (#1) — funding-critical, the business model
2. **E5+E6 TermLink + rollout** (#2) — make every finance term tappable
3. **Paper/mock portfolio** (#3) — the "build a portfolio grounded in thesis" core action
4. **E10 — Signals in duel** (#4)
5. **U5 — Themes ListRow** (#5)

We shipped **#1 (Affiliate surfaces)**, got halfway through **#2 (TermLink)**, and were on
the next batch of features when the user supplied a **list of product-review notes** that
included a Builder crash and several other bugs. We pivoted from "build more" to
**triage those bugs**.

## What got built this session

### 1. Affiliate surfaces — DONE
- Moved `openAffiliateOffer()` from `components/AffiliateOfferCard.tsx` into
  `data/affiliate-offers.ts` so it's a single shared function. Updated
  `AffiliateOfferCard.tsx`, `BrokerageOffersCard.tsx`, and `app/credit/cards/[id].tsx`
  to import from the data file.
- New component `src/components/home/AffiliateOpportunitiesCard.tsx` — profile-aware,
  shows 1–2 contextual offers, dynamic heading ("Start with savings" / "Manage debt first"
  / "Ready for a brokerage?" / "Explore financial tools"), "See all offers →" link.
- New route `src/app/offers.tsx` — full offer catalog with category filter chips
  ("For you" | Savings | Brokerage | Credit | Credit-builder). Uses existing
  `AffiliateOfferCard` in compact mode.
- Wired into Home tab as a new section between the Research & tools row and Thesis
  Radar. Imported `offersForProfile` from `@/data/affiliate-offers` and memoized.

### 2. TermLink + ExplainProvider — PARTIALLY DONE
- New `src/hooks/use-explain.tsx` — `ExplainProvider` context exposing
  `{ openConcept }`. Initially we forgot to render the `ExplainSheet` inside the
  provider (state-only stub); fixed mid-session.
- New `src/components/TermLink.tsx` — inline tappable term; uses `Text.onPress` (not
  `Pressable` wrapping) so it doesn't break text layout in the middle of paragraphs.
- Updated `src/components/education/GlossaryText.tsx` — added optional
  `onTermPress(termId) => boolean | void` prop. When the callback returns `true`, the
  default `Alert.alert` is suppressed (so we can route to ExplainSheet instead).
- Wired `ExplainProvider` in `src/app/_layout.tsx` wrapping the `<Stack>`.
- Stock detail thesis (`src/app/(tabs)/stock/[symbol].tsx`): `GlossaryText` now gets
  `onTermPress` mapping `{volatility, drawdown, beta, sharpe-ratio}` to matching
  `ConceptId`s and calling `openConcept()`.
- Theme detail thesis (`src/app/(tabs)/theme/[id].tsx`): same `GlossaryText` +
  `onTermPress` pattern, calling the new `useExplain()` hook from the provider.
- Theme detail imports `useExplain` and `GlossaryText`; removed an unused `TermLink`
  import that was left over from a first pass.

**Still pending for #2 (TermLink rollout)**: explicit `<TermLink conceptId="...">` in
static copy across theme drivers, duel bull/bear, onboarding help strings. The auto-
detection via `GlossaryText` covers most surfaces already; the remaining items are
"polish", not "broken".

## Triage pass (after the user supplied the review notes)

### Fixed
- **Builder crash** — `src/app/(tabs)/builder/index.tsx` was referencing
  `builderProfileChips`, `INVESTOR_LENSES`, `convictionLeaderboard`,
  `buildThesisPortfolio`, `backtestPlainEnglish`, `personaForTheme`,
  `MAX_ACTIVE_THEMES`, `ConvictionRankRow` without importing them. These symbols map
  to:
  - `builderProfileChips` ← `@/lib/builder-profile-summary`
  - `INVESTOR_LENSES` ← `@/data/investor-lenses`
  - `convictionLeaderboard`, `ConvictionRankRow` ← `@/lib/conviction-rank`
  - `buildThesisPortfolio` ← `@/lib/thesis-portfolio-builder`
  - `backtestPlainEnglish` ← `@/lib/backtest-narrative`
  - `personaForTheme` ← `@/data/thesis-personas`
  - `MAX_ACTIVE_THEMES` ← `@/lib/thesis-limits`

  All 8 imports added. The 17 builder-related `TS2304` / `TS7006` errors cleared.
- **Offers route placement** — moved `src/app/(tabs)/offers.tsx` →
  `src/app/offers.tsx` so it doesn't auto-become a tab. Added
  `<Stack.Screen name="offers" />` entry. Tab bar stays 5-up (Home / Education /
  Build / Accounts / Watchlist). Updated the Home tab's "See all" link to push
  `/offers` (no `(tabs)` prefix needed now).
- **Stress-test slider back-swipe** — added `gestureEnabled: false` to the `forecast`
  and `thesis-model/index` Stack.Screen entries in `_layout.tsx`. Horizontal slider
  drags no longer trigger the system edge-swipe-back.
- **Debate "doesn't work"** — added a `fetchBackendStatus()` probe to
  `src/app/debate.tsx`. The screen now shows an amber "API server not reachable"
  banner with `cd server && npm run dev` and the `DEEPSEEK_API_KEY` hint when the
  server isn't running, and the error card copy is more actionable.
- **Stock names** — `NVIDIA` → `Nvidia`, `ASML` → `ASML Holding` in
  `src/data/stocks.ts`. Symbol still displays large, name below in proper case.
- **Price disclosure pill** — wrapped `quoteSourceLabel(quote)` (which is either
  "Illustrative", "Massive · live", or "Massive · EOD") in a small bg-surface2 pill
  in the price block. More visible at a glance than the previous 9px plain text.

### Triage items NOT yet fixed (your call next session)
- **Welcome guide positioning / per-section tour** — the `NavigationTutorial`
  overlay appears to be mis-positioned. Likely a `SafeAreaView` / `flex` issue
  inside `NavigationTutorial.tsx`. A real "guide each part of the app" experience
  is a Coach-Mark / spotlight system — multi-session build.
- **CFO AI cascade (cheap → hard models)** — PACE chain exists in
  `server/src/llm.ts`. Missing piece: intent router that picks tier per question.
  ~1–2 day build.
- **Stock prices not accurate** — illustrative by design when `MASSIVE_API_KEY`
  (formerly `POLYGON_API_KEY`) isn't set. Disclosure UI is now more obvious. If
  the user wants free delayed prices via a different provider, that's a separate
  integration.
- **Real company logos** — needs a paid logo service (Clearbit / Brandfetch) or
  hand-rolled SVG library. Not a single-session fix.
- **Journaling weak** — `JournalReviewCard` + `journal.tsx` exist as summary
  views. The fix is richer prompts and an edit-history view. New feature work.
- **Stress test "not believable"** — current model in
  `src/lib/thesis-stress-test.ts` is simple scenario math. The user's intuition
  (multi-LLM debate would make it credible) is correct — that ties into the
  cascade CFO and debate features above.
- **Thesis health → conviction view deep link** — `ThesisHealthCard` shows
  holdings but doesn't deep-link to conviction view. ~1hr fix.
- **Conviction Computer expansion** — `compounder.tsx` exists; expansion is
  scope work.
- **Alerts expansion** — `watchlistAlerts` + badge already in Watchlist tab.
  Expansion is scope work.
- **Builder crash beyond typecheck** — typecheck is clean, but I haven't loaded
  it in the simulator. If it still crashes, next thing to look at is
  `BuilderAllocationPie` import shape and `modelThesis` default state.

### Pre-existing typecheck errors (NOT in scope this session)
These three errors were there before I started; I did not introduce them and
did not attempt to fix them. Listing for awareness:
- `src/data/research-modules.ts(78,45)` — `UserProfile` ↔ `CfoProfile` mismatch
- `src/lib/app-route.ts(1,21)` — `expo-router` `Router` export doesn't exist
- `src/lib/assistant-memory-learn.ts(42,50)` — `MemoryCategory` type narrowing

## State of the build
- `npx tsc --noEmit` is clean for all my changes (only the 3 pre-existing errors
  remain).
- `git log` shows the most recent commit: `dec0dd9 feat: ExplainProvider +
  affiliate refactor + glossary deep links` — work that was committed before this
  session. **The new changes from this session are uncommitted** — there are
  uncommitted modifications and the new files I added.

## Next session — start here
1. **Open the simulator and re-verify the Builder doesn't crash.** If it does,
   inspect `BuilderAllocationPie` and `modelThesis` default state.
2. **Re-verify the Welcome guide positioning** — likely a layout issue in
   `NavigationTutorial.tsx`.
3. **Pick from the remaining triage items** (debatable priority order):
   a. Thesis health → conviction view deep link (quick win, ~1hr)
   b. Continue #2 TermLink rollout (driver explainers, duel copy, onboarding)
   c. Move on to **#3 Paper/mock portfolio** — this is the "core action" gap
      from the user journey (`Learn → Thesis builder → Watchlist → Duels & tools →
      Affiliate next steps`). Watchlist and duels exist; "actually hold" doesn't.
   d. Or pivot to **CFO cascade** since it ties together debates + stress test
      credibility.
4. Eventually: **recommit the changes from this session** before the next round
   of work. They are not yet committed.

## Files touched this session
**Created**
- `src/components/home/AffiliateOpportunitiesCard.tsx`
- `src/app/offers.tsx` (moved from `(tabs)/offers.tsx`)
- `src/hooks/use-explain.tsx`
- `src/components/TermLink.tsx`

**Modified**
- `src/data/affiliate-offers.ts` — added `openAffiliateOffer()`
- `src/components/AffiliateOfferCard.tsx` — re-export removed, import updated
- `src/components/builder/BrokerageOffersCard.tsx` — uses shared function
- `src/app/credit/cards/[id].tsx` — import path updated
- `src/app/(tabs)/index.tsx` — AffiliateOpportunitiesCard wired in
- `src/app/_layout.tsx` — ExplainProvider wrap; `gestureEnabled: false` on
  forecast + thesis-model; offers Stack.Screen added
- `src/components/education/GlossaryText.tsx` — `onTermPress` callback prop
- `src/app/(tabs)/stock/[symbol].tsx` — GlossaryText wired with onTermPress;
  price-source pill style
- `src/app/(tabs)/theme/[id].tsx` — GlossaryText + useExplain wired
- `src/app/(tabs)/builder/index.tsx` — 8 missing imports added
- `src/app/debate.tsx` — backend-reachability probe + clearer error copy
- `src/data/stocks.ts` — `NVIDIA` → `Nvidia`, `ASML` → `ASML Holding`
