# Education & signals roadmap

**North star:** Zero-knowledge — no finance degree required. The app **teaches** while showing data.

**How to use:** Cursor copies **one phase** into `docs/current-slice.md` when ready. Claude Code implements **only** `current-slice.md`. Do not skip phases without explicit approval (dependencies matter).

**Prerequisite:** Reveal slice (`result.reasons` on `onboarding/reveal.tsx`) must ship first.

---

## Phase map

| Phase | Name | Depends on | ~Effort |
|-------|------|------------|---------|
| **E1** | Concept library (data) | Reveal | Small |
| **E2** | ExplainSheet UI | E1 | Small |
| **E3** | Duel: tap metric → explain | E2 | Medium |
| **E4** | Stock detail: tap stat → explain | E2 | Small |
| **E5** | TermLink component | E1, E2 | Small |
| **E6** | Jargon links (rollout) | E5 | Medium |
| **E7** | Home: plain-language fingerprint | — | Medium |
| **E8** | Stock signals data (mock) | — | Small |
| **E9** | Stock signals UI (alerts) | E8 | Medium |
| **E10** | Signals in duel + “why it matters” | E8, E9, E2 | Medium |
| **U1** | Insight UI primitives (Daylight) | E2 | Medium |
| **U2** | Mock context insights (data) | — | Small |
| **U3** | Stock detail: InsightCard | U1, U2, E5 optional | Medium |
| **U4** | InsightSheet (expand narrative) | U1, U2 | Medium |
| **U5** | Themes: minimal ListRow (Autopilot-style) | U1 | Medium |

**Design reference (Public / Autopilot / Coinbase):** `docs/design-reference-insights-ui.md`

---

## E1 — Concept library (data only)

### Goal

Single source of truth for plain-English definitions used everywhere else.

### Tasks

1. Add `src/data/concepts.ts` with type:

   ```ts
   export type ConceptId = "pe-ratio" | "market-cap" | "beta" | ...;

   export type Concept = {
     id: ConceptId;
     term: string;           // display: "P/E ratio"
     short: string;          // one line for links
     body: string;           // 2–4 sentences, plain English
     whyItMatters?: string;  // optional second paragraph
     related?: ConceptId[];
   };
   ```

2. Seed **minimum 12** concepts (v1 set):

   | id | term |
   |----|------|
   | `pe-ratio` | P/E ratio |
   | `market-cap` | Market cap |
   | `dividend-yield` | Dividend yield |
   | `beta` | Beta |
   | `moat` | Economic moat |
   | `expense-ratio` | Expense ratio |
   | `volatility` | Volatility |
   | `drawdown` | Drawdown |
   | `ebitda` | EBITDA |
   | `yoy` | Year over year (YoY) |
   | `run-rate` | Run rate |
   | `etf` | ETF |

3. Export `conceptById(id)`, `allConcepts()`.

### Files

- `src/data/concepts.ts` (new)

### Acceptance

- [ ] All 12 concepts have `term`, `short`, `body` (no lorem)
- [ ] No buy/sell/recommendation language
- [ ] `npx tsc --noEmit` passes
- [ ] **No UI in this phase**

### Non-goals

- ExplainSheet, links, stock signals

---

## E2 — ExplainSheet UI

### Goal

Reusable bottom sheet (or modal) that shows one `Concept` — used by duel, stock detail, TermLink.

### Tasks

1. Add `src/components/ExplainSheet.tsx`:
   - Props: `conceptId: ConceptId`, `visible`, `onClose`
   - Shows: term (title), body, optional whyItMatters, related concepts as tappable chips (can noop or close+reopen)
2. Use Daylight styling (`Screen`/`Card` patterns, brand accents).
3. Optional: `useExplainSheet()` hook returning `{ open, close, sheet }`.

### Files

- `src/components/ExplainSheet.tsx` (new)
- Optionally `src/hooks/useExplainSheet.ts`

### Acceptance

- [ ] Can render any concept from E1
- [ ] Dismiss via backdrop or close control
- [ ] Works on iOS Simulator (no crash)
- [ ] `npx tsc --noEmit` passes
- [ ] **Not wired to duel/stock yet** (smoke test via temporary dev button OK, remove before commit)

### Non-goals

- Wiring every screen; jargon links

---

## E3 — Duel: tap-to-explain metrics

### Goal

On compare/duel, tapping a metric label opens ExplainSheet for that concept.

### Tasks

1. In `src/app/duel.tsx`, map displayed metrics to `ConceptId`:

   | UI label | concept id |
   |----------|----------------|
   | P/E | `pe-ratio` |
   | Mkt cap | `market-cap` |
   | Div yield | `dividend-yield` |
   | Beta / Vol | `volatility` or add `beta` if shown |
   | Moat (if in copy) | `moat` |

2. Make metric **labels** pressable (`Pressable` + subtle underline or info icon).
3. Mount `ExplainSheet` at duel root; one open at a time.

### Files

- `src/app/duel.tsx`
- `src/components/ExplainSheet.tsx` (consume)

### Acceptance

- [ ] Tapping P/E (both sides or shared row) opens correct concept
- [ ] Sheet dismisses; duel state unchanged
- [ ] Duel pick flow still works end-to-end
- [ ] `npx tsc --noEmit` passes

### Non-goals

- Stock signals; home fingerprint

---

## E4 — Stock detail: tap stat → explain

### Goal

Same pattern as E3 on `src/app/stock/[symbol].tsx` stat grid.

### Tasks

1. Wrap `Stat` labels for Mkt Cap, Dividend, P/E, Vol with press → ExplainSheet.
2. Map Vol → `volatility`; add helper text under grid: “Tap a label to learn what it means.”

### Files

- `src/app/stock/[symbol].tsx`

### Acceptance

- [ ] All four stats open correct concept
- [ ] Watchlist toggle unchanged
- [ ] `npx tsc --noEmit` passes

---

## E5 — TermLink component

### Goal

Inline tappable finance terms in copy that open ExplainSheet.

### Tasks

1. Add `src/components/TermLink.tsx`:
   - Props: `conceptId`, `children` (optional override label)
   - Style: brand color, dotted underline, `font-sansSb`
   - `onPress` → parent provides `openConcept(id)` or uses context
2. Add lightweight `ExplainProvider` in `src/app/_layout.tsx` OR pass callback from screens (prefer provider if multiple screens in E6).

### Files

- `src/components/TermLink.tsx`
- Optional: `src/components/ExplainProvider.tsx`

### Acceptance

- [ ] TermLink opens ExplainSheet for wired concept
- [ ] `npx tsc --noEmit` passes

### Non-goals

- App-wide rollout (E6)

---

## E6 — Jargon links (rollout)

### Goal

“Every finance term” in key surfaces links to concepts — incremental, not one PR.

### Rollout order (sub-tasks)

1. **Theme detail** — `src/app/theme/[id].tsx` drivers + thesis: link P/E, moat, ETF if mentioned.
2. **Stock thesis card** — link market cap, dividend, moat in static copy where terms appear.
3. **Duel bull/bear** — `src/lib/cases.ts` or duel UI: link terms in generated text only if easy; else skip.
4. **Onboarding help text** — `questionnaire.ts` help strings: link 1–2 terms max (e.g. drawdown).

### Files

- `src/app/theme/[id].tsx`
- `src/app/stock/[symbol].tsx`
- `src/app/duel.tsx` (if not done in E3)
- `src/data/questionnaire.ts` (light touch)

### Acceptance

- [ ] At least **theme detail + stock detail** use TermLink for ≥3 terms each
- [ ] No broken navigation
- [ ] Copy still readable (not every word linked)
- [ ] `npx tsc --noEmit` passes

### Non-goals

- Linking every string in the app in one pass

---

## E7 — Home: plain-language fingerprint

### Goal

Replace abstract fingerprint bars with readable summary from `UserProfile`.

### Tasks

1. Add `src/lib/profile-summary.ts`:
   - `buildProfileSummary(profile): { headline: string; bullets: string[] }`
   - Use horizon, risk, primaryGoal, incomeNeed, interests (top 2), concerns (top 1), reactionToDrawdown.
2. Update `src/app/(tabs)/index.tsx`:
   - Section “Your investing frame” with headline + 3–5 bullets.
   - Keep bars optional (secondary) or remove if redundant.
3. Optional: add `displayName?: string` to `UserProfile` + one question in questionnaire step 1 — **only if slice explicitly includes it**.

### Files

- `src/lib/profile-summary.ts` (new)
- `src/app/(tabs)/index.tsx`
- Optional: `src/store/types.ts`, `src/data/questionnaire.ts`

### Acceptance

- [ ] Home shows plain English derived from real store profile
- [ ] No recommendation language
- [ ] `npx tsc --noEmit` passes

---

## E8 — Stock signals data (mock due-diligence notes)

### Goal

**Factual, educational alerts** when analyzing a stock — not buy/sell advice. Colleague example: *“XYZ has changed CEOs 4× in the past 3 years.”*

Frame as **“Signals to know”** or **“Due diligence notes”** — things a careful reader would want to notice.

### Tasks

1. Extend `Stock` in `src/store/types.ts` OR separate map:

   ```ts
   export type SignalSeverity = "info" | "notice" | "caution";

   export type StockSignal = {
     id: string;
     symbol: string;
     severity: SignalSeverity;
     title: string;       // short: "Leadership turnover"
     fact: string;        // "4 CEO changes in the last 3 years."
     context?: string;    // "Frequent leadership changes can make strategy less predictable."
     conceptIds?: ConceptId[];  // link to E1 concepts
     asOf?: string;       // "Illustrative · demo data"
   };
   ```

2. Add `src/data/stock-signals.ts`:
   - `signalsForSymbol(symbol): StockSignal[]`
   - Seed **8–12 signals** across **6+ symbols** (not every stock needs one)
   - Example signal types (mock):
     - `leadership-churn` — CEO changes
     - `high-volatility` — aligns with existing vol field
     - `concentration-customer` — “Top customer ~40% of revenue”
     - `regulatory-overhang` — generic educational note
     - `dividend-cut-history` — illustrative

3. Disclaimer constant: `SIGNAL_DISCLAIMER = "Illustrative facts for education only — not live data or advice."`

### Files

- `src/store/types.ts` (types)
- `src/data/stock-signals.ts` (new)

### Acceptance

- [ ] At least 6 symbols have ≥1 signal
- [ ] Copy is factual tone, not “avoid this stock” / “sell”
- [ ] `npx tsc --noEmit` passes
- [ ] **No UI in this phase**

### Non-goals

- Live news APIs, SEC filings, push notifications

---

## E9 — Stock signals UI (alerts on stock detail)

### Goal

Surface signals when user opens a stock — visible, scannable, trustworthy.

### Tasks

1. Add `src/components/StockSignalsCard.tsx`:
   - Lists signals for symbol; severity → icon/color (`info` brand, `notice` amber, `caution` amber/violet — no alarm-red “panic”)
   - Show `fact` + optional `context`; footer disclaimer
   - Optional: TermLink on terms in `context`
2. Insert in `src/app/stock/[symbol].tsx` below thesis card (above stats).
3. If zero signals, hide card entirely.

### Files

- `src/components/StockSignalsCard.tsx` (new)
- `src/app/stock/[symbol].tsx`

### Acceptance

- [ ] NVDA (or any seeded symbol) shows ≥1 signal in Simulator
- [ ] Disclaimer visible on card
- [ ] No recommendation language
- [ ] `npx tsc --noEmit` passes

### Non-goals

- Push notifications; duel integration (E10)

---

## E10 — Signals in duel + concept bridge

### Goal

When duelling two watchlist names, show **contrasting signals** if any exist — helps user think, not decide for them.

### Tasks

1. On `src/app/duel.tsx`, below head-to-head header (or in a collapsible “Signals to know”):
   - Left column: up to 2 signals for stock A
   - Right column: up to 2 signals for stock B
2. Copy: “Illustrative due diligence notes — not live data.”
3. Tapping a signal term opens ExplainSheet if `conceptIds` set.

### Files

- `src/app/duel.tsx`
- `src/components/StockSignalsCard.tsx` (extract row variant or share list item)

### Acceptance

- [ ] Duel with two seeded symbols shows signals when data exists
- [ ] THIS/THAT flow still works
- [ ] `npx tsc --noEmit` passes

---

## U1 — Insight UI primitives (Daylight, not dark clone)

### Goal

Reusable components matching **clean minimal** reference apps, using **Thesis Daylight** tokens only.

### Tasks

1. Read `docs/design-reference-insights-ui.md` fully.
2. Add components per spec:
   - `src/components/ui/InsightCard.tsx` — headline, attribution, body, `whyItMatters[]`, `watch`, optional `MetricChip` row
   - `src/components/ui/MetricChip.tsx` — `label`, optional `delta`, tone pos/neg/neutral
   - `src/components/ui/ListRow.tsx` — leading circle, optional badge pill, title, subtitle, chevron
3. **No dark `#000` screens** — white/surface cards on `bg` background.
4. Disclaimer footer on `InsightCard`: “Illustrative · not live data · not advice.”

### Files

- `src/components/ui/InsightCard.tsx`, `MetricChip.tsx`, `ListRow.tsx` (new)

### Acceptance

- [ ] Storybook-style smoke: render one example of each in a dev-only route OR temporary block in stock screen (remove if temp)
- [ ] Matches tailwind Daylight tokens
- [ ] `npx tsc --noEmit` passes
- [ ] No Autopilot/copy-portfolio copy in examples

### Non-goals

- Mock narrative data (U2); wiring stock screen (U3)

---

## U2 — Mock context insights (data)

### Goal

Illustrative **price-action context** narratives (Public/Coinbase style) — educational, profile-agnostic or lightly profile-aware.

### Tasks

1. Add `src/data/context-insights.ts`:

   ```ts
   export type ContextInsight = {
     id: string;
     symbol?: string;      // stock-specific
     themeId?: ThemeId;    // theme-specific
     kicker?: string;
     headline: string;
     body: string;
     whyItMatters: string[];
     watch?: string;
     chips?: { label: string; delta?: string; tone?: "pos" | "neg" | "neutral" }[];
     conceptIds?: ConceptId[];  // terms to TermLink in UI
   };
   ```

2. Seed **6+ stock insights** and **2+ theme insights** (plain English, mechanics not commands).
3. `insightForSymbol(symbol)`, `insightForTheme(id)` — return undefined if none.

### Example (stock)

- Headline: “Volatility is elevated versus its own one-year range.”
- Why: bullets on beta, sector, earnings window (educational)
- Watch: tie to **StockSignal** id if E8 done, else standalone sentence (CEO churn example on one symbol)

### Files

- `src/data/context-insights.ts` (new)

### Acceptance

- [ ] At least one insight references a **Watch**-style diligence note (CEO churn OK)
- [ ] No buy/sell/autopilot language
- [ ] `npx tsc --noEmit` passes

---

## U3 — Stock detail: InsightCard (“Happening now”)

### Goal

Stock page opens with **context** that elucidates price action (mock), Public/Coinbase pattern on Daylight.

### Tasks

1. In `src/app/stock/[symbol].tsx`, below header, above thesis:
   - If `insightForSymbol(symbol)` → render `InsightCard`
   - Map `whyItMatters`, `watch`, `chips`
2. Wire **TermLink** in body/headline for `conceptIds` (if E5 done; else plain text).
3. “Read more” → opens **U4** sheet if implemented; else expand inline (optional defer to U4).

### Files

- `src/app/stock/[symbol].tsx`
- `InsightCard`, `context-insights.ts`

### Acceptance

- [ ] NVDA or seeded symbol shows insight in Simulator
- [ ] Disclaimer visible
- [ ] Watchlist toggle unchanged
- [ ] `npx tsc --noEmit` passes

---

## U4 — InsightSheet (expanded narrative)

### Goal

Coinbase-style **bottom sheet** for full insight + linked terms.

### Tasks

1. `src/components/InsightSheet.tsx` — modal/sheet, scrollable sections: headline, body, Why it matters, Watch, chips.
2. Open from `InsightCard` “Read more”.
3. Reuse `ExplainSheet` when user taps a `TermLink`.

### Files

- `src/components/InsightSheet.tsx`
- `InsightCard.tsx` (add onPressReadMore)

### Acceptance

- [ ] Sheet opens/closes without navigation bug
- [ ] `npx tsc --noEmit` passes

---

## U5 — Themes tab: ListRow (Autopilot-style)

### Goal

Minimal list aesthetic for theme library — glyph circle, badge, title, subtitle, chevron. **No fake +40% returns.**

### Tasks

1. Refactor `src/app/(tabs)/themes.tsx` “your themes” + library sections to use `ListRow`.
2. Badge examples: `Top match`, `Evergreen`, `3 reasons` (if reveal reasons in store — optional), or `heat`.
3. Keep featured gradient card at top OR replace with one featured ListRow — Cursor preference: **keep featured card** + ListRow for rest.
4. “Explore more” → scroll to library section or noop with label.

### Files

- `src/app/(tabs)/themes.tsx`
- `ListRow.tsx`

### Acceptance

- [ ] Themes list feels airy (padding, no heavy borders)
- [ ] No performance-return pills
- [ ] Navigation to `theme/[id]` works
- [ ] `npx tsc --noEmit` passes

---

## Future (not scheduled)

| Idea | Notes |
|------|--------|
| Push / watchlist alerts | Real-time CEO changes need live data + compliance review |
| Signal engine rules | Derive signals from filings — post-v1 |
| Concept search | Browse all concepts screen |
| Post-duel “what to research” | Checklist, not advice |

---

## Claude Code prompt template (per phase)

Replace `EX` with phase id (E1, E2, …):

```text
Implement education phase EX from docs/education-roadmap.md only.

Read first: CLAUDE.md, AGENTS.md, docs/current-slice.md (Cursor should have copied EX into current-slice).

Rules:
- Educational only — not investment advice
- Do not implement other phases
- Run npx tsc --noEmit when done
- List acceptance checks satisfied

Phase EX details: see docs/education-roadmap.md section "## EX — ..."
```

---

## Suggested sequence after reveal

```
Reveal → E1 → E2 → E3 → E4 → E5 → E6
              ↘ U1 → U2 → U3 → U4 → U5   (insights UI — see design-reference-insights-ui.md)
              ↘ E8 → E9 → E10            (signals / CEO-style watch)
         E7 anytime after reveal
```

**Recommended after E2:** `U1` + `U2` in parallel, then `U3` (stock insight card), then `E8`→`E9` (signals), `U4` (sheet), `U5` (themes list). Term links (E5) before U3 if hyperlinks in insight body are required.

---

## Cursor: activating a phase

Copy the phase section (Goal through Acceptance) into `docs/current-slice.md`, set **Last updated**, add phase id to title, e.g. `# Current slice — E1 Concept library`.
