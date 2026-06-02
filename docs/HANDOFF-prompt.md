# Handoff prompt for Claude Code — Thesis app

Copy everything below the line into a new Claude Code session to continue work on `/Users/jaidenrabatin/Projects/thesis`.

---

You are picking up work on **Thesis**, an Expo SDK 56 + React Native + TypeScript educate-first investing app. Read `docs/product-vision.md`, `AGENTS.md`, and `docs/current-slice.md` before changing code.

## Product principles

- **Education first, conviction second** — not buy/sell advice.
- **Thesis Radar** lives on **Watchlist** (not a separate tab); `/radar` redirects to watchlist.
- **AEGIS branding was removed**; use “Thesis” / “Conviction dossier” / `src/data/conviction-research-framework.ts`.
- **Do not commit** unless the user explicitly asks. Minimize scope; match existing patterns.

## Stack

- Client: Expo Router, Zustand + AsyncStorage persist, NativeWind.
- Server: `server/` on port **8787** — Massive/Polygon market data, Ask CFO, Plaid stubs.
- Env: root `.env` + `server/.env` — `MASSIVE_API_KEY`, `EXPO_PUBLIC_THESIS_API_URL`, `EXPO_PUBLIC_THESIS_APP_KEY` ↔ `THESIS_APP_SECRET`.
- Docs: `docs/massive-market-data.md`.

## What was built recently (may be uncommitted on `main`)

### Watchlist + Radar + Massive

- `src/lib/radar-market-sync.ts` — `searchMarketLive` + `fetchMarketQuote` merged into radar; quotes on suggestion cards.
- `src/lib/radar-manual-query.ts` — manual note intents (foreign, biotech, income, AI) + Massive hits.
- `src/lib/watchlist-radar-suggestions.ts` — accepts `liveMarketHits`.
- `src/app/(tabs)/watchlist.tsx` — async radar enrichment; list **above** radar when user has items.
- `src/components/watchlist/WatchlistRadarSuggestions.tsx` — Massive price line on cards.

### Onboarding

- `src/data/thesis-builder-chapters.ts` — chapters (not legacy `questionnaire.ts` only).
- `src/data/financial-term-definitions.ts` + `src/components/education/TermHelpBubble.tsx` — **?** bubbles for jargon (capital preservation, burn rate, drawdown, etc.).
- **Military**: `extended.identity.militaryStatus` → `src/data/military-financial-resources.ts`, `MilitaryResourcesSection`, `/military-resources`, Home/Builder/reveal/onboarding help; `src/lib/military-profile.ts`.
- **State + burn + target NW**: `us-state` picker in situation chapter; monthly burn in goals; `TargetNetWorthHint` (4× and 25× annual burn + median income context); mirrors state to `extended.tax.stateTaxResidency`.
- `src/lib/target-net-worth-guide.ts` — used in `cfo-derived-metrics.ts` when target NW empty.
- Restart onboarding: `src/app/thesis-profile.tsx` → `resetOnboarding()` + `/onboarding`.

### Stock/ETF detail + duel

- `src/components/BullBearCaseCard.tsx` + `BullBearCasesSection.tsx` — same bull/bear as duel (`src/lib/cases.ts`), on stock/ETF overview tabs.
- **Reverted** emoji/SVG mascots — use trend/shield icons only.

### Tags

- Expanded `StockTag` / `EtfTag` in `src/store/types.ts`; `src/lib/stock-tags.ts`, `src/lib/etf-tags.ts` enrich curated + catalog securities.

### Watchlist duel UX (latest)

- `src/components/watchlist/WatchlistDuelDock.tsx` — sticky bottom dock: Side A/B slots, horizontal ticker chips, Duel button; **no scrolling past Radar to duel**.
- Watchlist order: **Your list first**, Radar below; duel pick mode hides Radar.

### Backtest / nav fixes (earlier in thread)

- `src/lib/portfolio-backtest.ts`, `src/data/spy-benchmark.ts`, `src/data/symbol-historical-returns.ts` — saner vs SPY; no bogus scale-up.
- `src/lib/app-route.ts` — `returnTo` for stock/ETF detail back to watchlist.

## Data sources (explain to user when asked)

| Feature | Source |
|--------|--------|
| Prices on radar rows | Massive via `GET /v1/market/quote` when server + key configured |
| Radar ranking | Local catalog + themes + manual intents; Massive augments search |
| Watchlist search (3+ chars) | Local + `searchMarketLive` |
| Bull/bear | `src/lib/cases.ts` (tags + financials templates) |

## Not done / agreed next priorities (user paused here)

Pick **one slice** after reading code; user was deciding between:

1. **Conviction loop** — surface duel journal on Home; post-duel “add to thesis model”; 90-day revisit.
2. **Profile → product** — Forecast pre-fill from burn rate + state; NW progress on Home/CFO scorecard.
3. **Military bootstrap** — share sheet for `/military-resources`; radar row **Duel** + **Dossier** CTAs.
4. **Beta polish** — real affiliate URLs; TestFlight path; Plaid vs demo accounts story.

Do **not** assume user wants all four; ask or implement the slice they specify.

## How to run & verify

```bash
cd server && npm run dev   # :8787
# separate terminal:
npm run start             # or npm run ios
curl -s http://127.0.0.1:8787/v1/health
```

- Onboarding: restart via Builder → CFO profile → “Restart onboarding from scratch”.
- Watchlist: 2+ duelable tickers → use **bottom duel dock** chips.
- Military: set Active duty in onboarding → Home military block + `/military-resources`.
- Massive: `massiveConfigured: true` in health when `MASSIVE_API_KEY` set in `server/.env`.

## Key files map

```
src/app/(tabs)/watchlist.tsx          # Radar + duel dock
src/lib/watchlist-radar-suggestions.ts
src/lib/radar-market-sync.ts
src/app/onboarding/step/[index].tsx    # Builder chapters UI
src/data/thesis-builder-chapters.ts
src/app/duel.tsx
src/lib/cases.ts
src/components/watchlist/WatchlistDuelDock.tsx
src/data/military-financial-resources.ts
server/src/market-polygon.ts           # Massive backend
```

## Transcript

Full agent transcript (if context needed):

`/Users/jaidenrabatin/.cursor/projects/Users-jaidenrabatin-Projects-thesis/agent-transcripts/76be57a3-c1f2-4392-90dc-5fd844e45b2f/76be57a3-c1f2-4392-90dc-5fd844e45b2f.jsonl`

Search keywords: `radar`, `Massive`, `military`, `burn rate`, `WatchlistDuelDock`, `BullBear`.

## Suggested first message when resuming

> Read `docs/HANDOFF-prompt.md` and the handoff section above. User priority: [conviction loop | military bootstrap | profile→forecast | beta polish]. Implement the chosen slice with minimal diff, match existing patterns, no commit unless asked.

## Git note

Large local diff on `main` — much of the work above may be **uncommitted**. Run `git status` before assuming what is on remote.
