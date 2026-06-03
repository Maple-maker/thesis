# Reflect Pillar — Full Build Gameplan

**Status:** Ready for implementation
**Plan source:** `.claude/plans/elegant-sleeping-dusk.md`
**Date:** June 3, 2026

---

## Why This Matters

The app already has strong Learn, Research, Thesis, and Execute pillars:
- 14 education courses + glossary
- 4-agent AI debate system
- Full thesis builder with conviction scoring
- Plaid-linked accounts + Portfolio X-Ray + Investor Lenses
- Two-tier AI chat (Assistant + Pro CFO)

The **Reflect** pillar is the weakest. Users make decisions but can't close the loop by learning from outcomes. This build fixes that and adds the signature Conviction Compounder on top.

---

## Architecture Rule

Each tier builds on the previous one. Journal entries feed health monitoring. Stress testing feeds conviction compounding. **Build in order — do not skip ahead.** Dependencies are real.

---

# Tier 1 — Close the Reflect Loop

## Task 1: Investment Journal 2.0

### Goal

Turn the read-only duel log (`src/app/(tabs)/journal.tsx`) into a real decision journal with free-form notes, emotional state capture, and entry types beyond duels. Then surface a monthly review card on the home screen.

### Current state

`src/app/(tabs)/journal.tsx` — displays `journal` entries from the Zustand store. Entries are only created when a user completes a Duel (picks winner + reason). No free-form notes. No reflection. Store types in `src/store/types.ts` define `JournalEntry` with fields: `id`, `createdAt`, `type`, `symbols`, `winner`, `reason`, `note`.

### What to build

**A. Extend the journal data model** (`src/store/types.ts`)
- Add `emotionalState?: "confident" | "uncertain" | "anxious" | "excited"`
- Add `freeformNote?: string` (longer reflection text)
- Add entry types: `"duel" | "buy" | "sell" | "thesis-change" | "watchlist-add" | "watchlist-remove" | "general"`
- Add `tags?: string[]` for user-defined labels
- Add `relatedThesisId?: string` to link entries to a thesis model

**B. Update journal screen** (`src/app/(tabs)/journal.tsx`)
- Add "New entry" button (FAB or header right)
- Filter chips by entry type
- Show emotional state emoji/icon on each entry card
- Expand entry cards to show freeform notes inline

**C. New entry composer** (`src/components/journal/JournalComposer.tsx`)
- Symbol selector (search existing watchlist/holdings)
- Entry type picker (chips: Duel, Buy, Sell, Thesis Change, General)
- Emotional state selector (4 emoji chips: confident, uncertain, anxious, excited)
- Free-form text input (multiline, placeholder: "What were you thinking? What did you learn?")
- Save → adds to store `journal[]` via `addJournalEntry()`

**D. Monthly review card on home** (`src/app/(tabs)/index.tsx`)
- New `JournalReviewCard` component
- Shows: "You made X decisions this month. Here's what you learned."
- Lists recent journal entries with emotional states
- Links to full journal
- Only shows if journal has ≥3 entries in the past 30 days

**E. Store actions** (`src/store/index.ts`)
- `addJournalEntry(entry)` — create a new journal entry
- `updateJournalEntry(id, updates)` — edit an existing entry
- `deleteJournalEntry(id)` — remove an entry

### Acceptance checks

- [ ] User can create a journal entry from scratch (not just from duels)
- [ ] User can select emotional state when creating an entry
- [ ] User can write a free-form note
- [ ] Journal entries appear in reverse chronological order with emotional state visible
- [ ] Filter chips work (show only Duel entries, only Buy entries, etc.)
- [ ] Home screen shows JournalReviewCard when user has ≥3 entries this month
- [ ] `npx tsc --noEmit` passes
- [ ] Existing duel-based journal entries still display correctly

### Files

| Action | File |
|--------|------|
| Modify | `src/store/types.ts` |
| Modify | `src/store/index.ts` |
| Modify | `src/app/(tabs)/journal.tsx` |
| Create | `src/components/journal/JournalComposer.tsx` |
| Create | `src/components/journal/JournalReviewCard.tsx` |
| Modify | `src/app/(tabs)/index.tsx` (home screen) |

---

## Task 2: Watchlist Alerts

### Goal

Users add stocks to their watchlist but get no notifications when conditions change. Add simple price-target and conviction-change alerts that make the watchlist an active tool.

### Current state

`src/app/(tabs)/watchlist.tsx` — lists watched symbols with conviction scores, search, duel dock, and radar suggestions. Pipeline states (exploring → shortlisted → in-model → passed) exist in store. No alert/notification system.

### What to build

**A. Alert data model** (`src/store/types.ts`)
```ts
interface WatchlistAlert {
  id: string;
  symbol: string;
  type: "price-above" | "price-below" | "conviction-change";
  threshold?: number;        // price target
  convictionDirection?: "up" | "down";
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
}
```

**B. Alert logic** (`src/lib/watchlist-alerts.ts`)
- `checkPriceAlerts(symbol, currentPrice, alerts)` → returns triggered alerts
- `checkConvictionAlerts(symbol, currentScore, previousScore, alerts)` → returns triggered alerts
- `formatAlertMessage(alert)` → human-readable notification text
- Price check against mock/live market data
- Conviction check by comparing current vs. stored conviction score

**C. Alert UI on watchlist** (`src/app/(tabs)/watchlist.tsx`)
- Bell icon on each watchlist row → opens alert setup sheet
- "Set price alert" / "Set conviction alert" options
- Show existing alerts with enable/disable toggle
- Badge count of active alerts on the watchlist tab

**D. Alert list screen** (`src/components/watchlist/WatchlistAlertsSheet.tsx`)
- Lists all active alerts grouped by symbol
- Shows triggered alerts with timestamp
- Swipe to delete
- Clear all triggered button

### Acceptance checks

- [ ] User can set a price target alert on a watched symbol
- [ ] User can set a conviction change alert on a watched symbol
- [ ] Alerts are listed with enable/disable state
- [ ] Alert badge count shows on watchlist tab
- [ ] Triggered alerts are visually distinct
- [ ] `npx tsc --noEmit` passes

### Files

| Action | File |
|--------|------|
| Modify | `src/store/types.ts` |
| Modify | `src/store/index.ts` |
| Create | `src/lib/watchlist-alerts.ts` |
| Modify | `src/app/(tabs)/watchlist.tsx` |
| Create | `src/components/watchlist/WatchlistAlertsSheet.tsx` |

---

# Tier 2 — Differentiate

## Task 3: Thesis Health Monitor

### Goal

Per-holding health status — green/yellow/red — that tells users if their thesis is still on track. Integrates with Event Briefs for automated alerts when held companies report earnings or have major developments.

### Current state

Holdings come from Plaid (`src/store/index.ts` → `holdings[]`). Event briefs system exists (`/radar`, `/brief/[id]`). Conviction scores exist (`src/lib/thesis-score.ts`). Portfolio X-Ray exists (`src/app/xray.tsx`).

### What to build

**A. Health scoring logic** (`src/lib/thesis-health.ts`)
- `computeHoldingHealth(holding, thesisModel, marketData)` → `"green" | "yellow" | "red"`
- Checks: conviction score trend, recent earnings, price vs thesis assumptions, management changes
- `getHealthTriggers(holding)` → list of recent events affecting health
- Green: conviction ≥70, no negative catalysts, price within 10% of thesis assumptions
- Yellow: conviction 40–69, or recent mixed earnings, or price 10–20% off
- Red: conviction <40, or negative earnings surprise, or price >20% off, or management change

**B. Home screen health card** (`src/components/home/ThesisHealthCard.tsx`)
- Shows health status dots for each tracked holding
- Green/Yellow/Red count summary
- "X holdings need attention" callout
- Tap → navigates to health detail

**C. Health detail screen** (`src/app/thesis-health.tsx`)
- List of holdings with health status, conviction score, and trigger reasons
- Tap holding → expanded view with health history and specific triggers
- Link to Event Briefs for relevant holdings

**D. Integration with Event Briefs**
- When a held company has a new event brief, flag it in the health monitor
- Cross-reference brief tickers with holdings
- Show "New brief available" badge on affected holdings

### Acceptance checks

- [ ] Each holding shows green/yellow/red health status
- [ ] Health card appears on home screen
- [ ] Health detail screen lists all holdings with status and reasons
- [ ] Event brief integration flags relevant holdings
- [ ] `npx tsc --noEmit` passes

### Files

| Action | File |
|--------|------|
| Create | `src/lib/thesis-health.ts` |
| Create | `src/components/home/ThesisHealthCard.tsx` |
| Create | `src/app/thesis-health.tsx` |
| Modify | `src/app/(tabs)/index.tsx` (home screen) |
| Modify | `src/app/_layout.tsx` (register route) |

---

## Task 4: Thesis Stress Testing

### Goal

"Here's my thesis for NVDA. What could go wrong?" Structured stress test that runs a thesis through adverse scenarios and outputs a resilience rating. Reuses the 4-agent debate infrastructure.

### Current state

`server/src/llm-debate.ts` — 4-agent debate system (Value, Growth, Macro, Bear). `src/app/debate.tsx` — client debate UI. `src/app/thesis-model/index.tsx` — completed thesis model view.

### What to build

**A. Stress test engine** (`src/lib/thesis-stress-test.ts`)
- `runStressTest(thesisModel, symbol)` → stress test result
- Scenarios: margin compression, competitive threat, rate hike, growth slowdown, regulatory risk
- For each scenario: severity (low/medium/high), impact on conviction, specific risks
- Overall resilience rating (0–100)
- Uses existing debate backend with a "stress test" prompt configuration

**B. Stress test UI** (`src/components/thesis/StressTestSheet.tsx`)
- "Stress Test" button on thesis model screen and builder portfolio screen
- Modal/sheet showing scenario cards with severity badges
- Toggle scenarios on/off before running
- Results view: scenario → impact → specific risks
- Overall resilience score with color coding
- Link to run a full debate on the most impactful scenario

**C. Integration with thesis model** (`src/app/thesis-model/index.tsx`)
- Add "Stress Test" button in the thesis model header
- Show last stress test result + date
- Re-run button

### Acceptance checks

- [ ] User can stress test a thesis model against 5 scenarios
- [ ] Each scenario shows severity and specific risks
- [ ] Overall resilience score displayed
- [ ] Results link to full debate
- [ ] `npx tsc --noEmit` passes

### Files

| Action | File |
|--------|------|
| Create | `src/lib/thesis-stress-test.ts` |
| Create | `src/components/thesis/StressTestSheet.tsx` |
| Modify | `src/app/thesis-model/index.tsx` |
| Modify | `src/app/(tabs)/builder/portfolio.tsx` |

---

# Tier 3 — Signature Feature

## Task 5: Conviction Compounder™

### Goal

The signature Thesis feature. Measures whether users are becoming better investors over time — not by portfolio returns (which are partially luck), but by decision quality. Requires Tiers 1–2 data sources to be live before starting.

### What to build

**A. Compounder engine** (`src/lib/conviction-compounder.ts`)
- `computeInvestorScore(userId)` → 0–100 dynamic score
- Weighted dimensions:
  - Forecast accuracy (30%): how often price/revenue/growth predictions were correct
  - Thesis quality (25%): average conviction score of active theses
  - Risk assessment (15%): ability to identify risks before they materialize
  - Position sizing (15%): diversification and allocation discipline
  - Decision discipline (10%): journal entry frequency and emotional state patterns
  - Learning velocity (5%): rate of improvement across all dimensions
- `getScoreHistory()` → time series for charting
- `getWeeklyReview()` → AI-generated summary of the week's decisions and outcomes

**B. Compounder dashboard** (`src/components/compounder/CompounderDashboard.tsx`)
- Investor Score gauge (circular, like Fear & Greed Index)
- Dimension breakdown with individual scores
- Score history sparkline (last 3 months)
- "Your strongest dimension" / "Your weakest dimension" callouts
- Learning velocity indicator (↑ improving / → steady / ↓ declining)

**C. Weekly Review** (`src/components/compounder/WeeklyReviewCard.tsx`)
- AI-generated summary: "This week you made X decisions. Your Y was strong. Watch out for Z."
- Links to relevant journal entries
- Action item suggestions: "Review your NVDA thesis — conviction dropped 15 points"

**D. Home screen integration**
- Small investor score gauge on home screen
- Weekly review card (collapsible)
- Streak counter ("3-week decision streak")

### Acceptance checks

- [ ] Investor Score computes and displays (0–100)
- [ ] 6 dimensions tracked with individual scores
- [ ] Score history chart renders
- [ ] Weekly review generates from journal + thesis data
- [ ] Home screen shows mini score gauge
- [ ] `npx tsc --noEmit` passes

### Files

| Action | File |
|--------|------|
| Create | `src/lib/conviction-compounder.ts` |
| Create | `src/components/compounder/CompounderDashboard.tsx` |
| Create | `src/components/compounder/WeeklyReviewCard.tsx` |
| Create | `src/components/compounder/InvestorScoreGauge.tsx` |
| Create | `src/app/compounder.tsx` |
| Modify | `src/app/(tabs)/index.tsx` (home screen) |
| Modify | `src/app/_layout.tsx` (register route) |

---

# Execution Order

```
┌─────────────────────────────────────────────────────┐
│ TIER 1                                              │
│ Task 1: Investment Journal 2.0    (~1 day)          │
│   ↓                                                  │
│ Task 2: Watchlist Alerts           (~1–2 days)       │
├─────────────────────────────────────────────────────┤
│ TIER 2                                              │
│ Task 3: Thesis Health Monitor      (~2–3 days)       │
│   ↓                                                  │
│ Task 4: Thesis Stress Testing      (~2–3 days)       │
├─────────────────────────────────────────────────────┤
│ TIER 3                                              │
│ Task 5: Conviction Compounder™     (~4–5 days)       │
└─────────────────────────────────────────────────────┘
```

Do not skip ahead. Each task produces data that the next tasks consume.

---

# General Rules

1. Read `AGENTS.md` before starting — stack conventions (NativeWind, Zustand, Expo Router, design tokens)
2. Match existing code patterns in `src/components/ui/` for all new components
3. Use `Screen` and `Header` wrappers for all new screens
4. All new state goes through the Zustand store in `src/store/`
5. Design tokens from `tailwind.config.js`: bg, ink, line, brand, pos, neg, amber, violet
6. Run `npx tsc --noEmit` after completing each task — fix any errors before moving on
7. Do not expand scope beyond what's specified in each task
8. Comment in the same style as surrounding code (terse, lowercase, `// ── Section ──` dividers for major blocks)

---

# Quick Reference

| What | Where |
|------|-------|
| Stack conventions | `AGENTS.md` |
| Product principles | `.cursor/rules/` |
| Design tokens | `tailwind.config.js` |
| Store | `src/store/index.ts`, `src/store/types.ts` |
| UI primitives | `src/components/ui/` |
| API client | `src/lib/thesis-api.ts` |
| Conviction scoring | `src/lib/thesis-score.ts`, `src/lib/conviction-rank.ts` |
| AI debate engine | `server/src/llm-debate.ts` |
| Education data | `src/data/courses.ts`, `src/data/concepts.ts` |
| Current slice (what to work on) | `docs/current-slice.md` |
