# Today’s plan — Thesis

**Date:** 2026-05-29  
**Repo:** https://github.com/Maple-maker/thesis  
**North star:** Make the app **teach** (explain terms + diligence signals), building on insight UI already on stock detail.

---

## Start of day (5 min, you)

```bash
cd ~/Projects/thesis   # or your clone path
git pull origin main
claude --version       # prefer 2.1.153 if using DeepSeek endpoint
```

**Claude Code / Claude Project:** Add the GitHub repo. Each session, paste the **Session kickoff** block below — do not rely on chat memory across days.

---

## Already shipped (do not rebuild)

| Area | Status |
|------|--------|
| Onboarding thesis builder intro | Done |
| Reveal + `result.reasons` bullets | Done (`reveal.tsx`) |
| Concept library data | Done (`src/data/concepts.ts`, large set) |
| InsightCard, MetricChip, ListRow | Done (`src/components/ui/`) |
| Stock context insights | Done (`context-insights.ts` + stock detail) |
| Sparkline, ThesisScoreCard, price mock | Done (stock detail) |

---

## Not shipped yet (today’s focus)

| Priority | Phase | What |
|----------|-------|------|
| **1** | **E2** | `ExplainSheet` — required for all tap-to-learn |
| **2** | **E3** | Duel: tap metric labels → ExplainSheet |
| **3** | **E4** | Stock detail: tap Mkt Cap / P/E / Div / Vol → ExplainSheet |
| **4** | **E8 → E9** | Stock signals data + card (CEO churn “Watch” style) |
| **5** | **E5** | `TermLink` + wire into `InsightCard` body/bullets |
| **Stretch** | **U4** | `InsightSheet` “Read more” on stock insight |
| **Stretch** | **U5** | Themes tab uses `ListRow` (Autopilot-minimal) |

Full specs: `docs/education-roadmap.md`, UI patterns: `docs/design-reference-insights-ui.md`.

---

## Session framework for Claude Code

### Rules every session

1. Implement **one phase** only (E2, E3, …).
2. Read `CLAUDE.md` → `docs/current-slice.md` → roadmap section for that phase.
3. Run `npx tsc --noEmit` before saying done.
4. Do **not** commit unless Jaiden asks; do report files changed.
5. Educational tone only — not investment advice.

### Kickoff (paste every new Claude Code session)

```text
Repo: Maple-maker/thesis (pull latest main).

Read CLAUDE.md, docs/current-slice.md, and the roadmap section for today's phase.

Already shipped: reveal reasons, concepts.ts, InsightCard on stock, context-insights, ListRow/MetricChip components.

Implement ONLY phase [E2] from docs/education-roadmap.md. No other phases.

When done: npx tsc --noEmit, list acceptance checks satisfied, suggest manual QA steps in Simulator.
```

Replace `[E2]` with the session phase.

---

## Session A — E2 ExplainSheet (~45–60 min)

**Outcome:** One reusable bottom sheet that displays any `ConceptId`.

**Prompt:**

```text
Implement education phase E2 from docs/education-roadmap.md only.

Create src/components/ExplainSheet.tsx (and optional useExplainSheet hook).
Load copy from src/data/concepts.ts via conceptById().
Daylight styling, dismiss on close/backdrop.
Do not wire duel or stock screens yet (E3/E4).
npx tsc --noEmit when done.
```

**Done when:** Can open sheet for `pe-ratio` from a temporary test button or documented smoke path.

---

## Session B — E3 + E4 Tap to explain (~60–90 min)

**Outcome:** Duel + stock stats teach metrics on tap.

**Prompt:**

```text
Implement E3 then E4 from docs/education-roadmap.md only.

E3: src/app/duel.tsx — pressable metric labels → ExplainSheet (pe-ratio, market-cap, dividend-yield, volatility/moat as mapped in roadmap).
E4: src/app/(tabs)/stock/[symbol].tsx — Stat row taps → ExplainSheet. Add hint "Tap a label to learn what it means."

Requires ExplainSheet from E2. Do not add stock signals or TermLink yet.
npx tsc --noEmit. Verify duel pick flow still works.
```

**Done when:** Simulator — duel compare taps P/E → sheet; stock detail taps Vol → sheet.

---

## Session C — E8 + E9 Stock signals (~60 min)

**Outcome:** Colleague-style diligence notes (e.g. CEO turnover) on stock page.

**Prompt:**

```text
Implement E8 then E9 from docs/education-roadmap.md only.

E8: StockSignal types + src/data/stock-signals.ts — 8+ mock signals, 6+ symbols, include leadership-churn example. Factual tone, no "sell/avoid".
E9: StockSignalsCard on stock detail; merge watch copy with InsightCard where sensible.

Read docs/design-reference-insights-ui.md for Watch/signal tone.
npx tsc --noEmit when done.
```

**Done when:** At least one seeded symbol shows signals card + disclaimer.

---

## Session D — E5 TermLink (stretch, ~45 min)

**Outcome:** Insight bullets can open concept definitions.

**Prompt:**

```text
Implement E5 from docs/education-roadmap.md only.

TermLink component + ExplainProvider or callback pattern.
Wire conceptIds from context-insights into InsightCard whyItMatters lines on stock detail.

npx tsc --noEmit when done.
```

---

## End of day (you, 10 min)

- [ ] Run app: onboarding → reveal → stock with insight → duel → journal
- [ ] `git status` — commit/push if you want Claude Project on fresh main tomorrow
- [ ] Cursor: update `docs/current-slice.md` to tomorrow’s first phase (E6 or U4/U5)
- [ ] Note blockers in `docs/today.md` (API errors, slice deps)

---

## If Claude Code hits API 400 (`system` role)

DeepSeek + Claude Code 2.1.154: pin `claude install 2.1.153 --force` or use native Anthropic. See prior thread / `DISABLE_UPDATES` in `~/.claude/settings.json`.

---

## Tomorrow preview

- **E6** jargon rollout (theme detail, questionnaire help)
- **E7** home plain-language fingerprint
- **E10** signals in duel
- **U4 / U5** InsightSheet + Themes ListRow
