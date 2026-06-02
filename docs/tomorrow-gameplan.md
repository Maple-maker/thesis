# Tomorrow gameplan — Thesis app (long day)

**Date:** Use this on your next off day  
**Goal:** End the day with a demo-ready app: live macro CFO, deep search, portfolio duels, and scenario planning that all feel connected.

**Morning startup (10 min)**

```bash
cd /Users/jaidenrabatin/Projects/thesis

# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — Expo (after API is up)
npm run start:clear

# Quick health
curl -s http://127.0.0.1:8787/v1/health | python3 -m json.tool
```

Confirm root `.env` has `EXPO_PUBLIC_THESIS_API_URL=http://127.0.0.1:8787` and `EXPO_PUBLIC_THESIS_APP_KEY` matching `server/.env` `THESIS_APP_SECRET`.

---

## Phase 1 — Environment & data foundation (≈90 min)

**Why first:** Everything else depends on API + catalogs + macro keys working.

### Do

1. **Server env** — In `server/.env`, set:
   - `DEEPSEEK_API_KEY` (required for Ask)
   - `FRED_API_KEY` (free from [FRED](https://fred.stlouisfed.org/docs/api/api_key.html)) for Fed funds + CPI
   - `THESIS_APP_SECRET` + matching Expo key
   - Leave `ASSISTANT_TOOLS` unset (enabled by default)

2. **Market catalog** — only if you need thousands of tickers offline. Yahoo 429s are common; use the safe script or skip for app work:
   ```bash
   # Gentle (recommended)
   npm run generate:market-catalogs:safe

   # Or disable live Yahoo while developing (server/.env):
   # MARKET_LIVE_SEARCH=0
   ```
   Resume cache: `scripts/.cache/market-quotes.json`. For same-day app work, `npm run bootstrap:stocks-catalog` + bundled ETFs is enough.

3. **After catalog finishes**, reload Expo (`r` in Metro). Spot-check Search for `DRAM`, `SHLD`, `AIS`, and a random small-cap ticker.

### Test chunk ✓

| Check | Pass? |
|-------|-------|
| `GET /v1/health` shows `macro.toolsEnabled` and `fredApiKey: true` | ☐ |
| Home **Macro & markets** card shows Treasury yields (and Fed funds if FRED set) | ☐ |
| Search → ETFs → `AIS` / `DRAM` appear | ☐ |
| Search → Stocks → count label shows thousands (not “49 only”) after catalog run | ☐ |

**Stop if:** API won’t start or chat returns 503 — fix keys before Phase 2.

---

## Phase 2 — Ask CFO + macro tools (≈75 min)

**Why:** News and markets are core to sharpening philosophy; you built the tool layer — prove it end-to-end.

### Do

1. Open **Ask** from Home; use chip **Fed & rates** or type:
   > How do current Fed and Treasury levels affect someone with my growth tilt and linked holdings?

2. In server logs (`ASSISTANT_DEBUG=1` optional), confirm macro prefetch or `toolsUsed` in response.

3. Try **Macro news** chip; answer should reference Fed headlines, not invented dates.

4. Fix gaps you hit (common):
   - Treasury parse wrong → check `server/src/tools/treasury.ts`
   - Tool loop fails → falls back to prefetch only; note in chat UX if needed
   - Weak/short answer → retry with Pro dev user / longer `maxTokens`

5. **Polish (if time):** Show a small “Live macro” badge on assistant messages when `macro.toolsUsed` returned (optional API field already on `/v1/chat`).

### Test chunk ✓

| Check | Pass? |
|-------|-------|
| Macro card on **Learn** loads without infinite spinner | ☐ |
| Ask cites **specific %** for Fed or 10y (not “rates are elevated” only) | ☐ |
| Ask does **not** invent a fake Fed funds number when FRED key missing (should say what’s unavailable) | ☐ |
| Glossary tap on “fed rate” / inflation still works in reply | ☐ |

**Demo script note:** “The CFO pulls live Treasury and Fed data before answering.”

---

## Phase 3 — Duel + portfolio matchups (≈90 min)

**Why:** Differentiator vs generic finance apps; recently added portfolio duels need a full pass.

### Do

1. Home → **Load demo** (holdings) if not already loaded.

2. **Duel** → **Portfolios** tab → run featured matchups:
   - Buffett vs my book
   - Value investing vs AI edge

3. Verify: allocation bars, overlap %, thesis fit scores, pick winner → reason → synthesis.

4. **Securities tab:** `NVDA` vs `SMH`, swap symbol, flip sides.

5. **Lenses** → open any famous lens → **Duel this lens vs my book**.

6. Fix/polish anything broken (journal storing `duelRef`, empty “my portfolio” without demo, compare card layout).

### Test chunk ✓

| Check | Pass? |
|-------|-------|
| Portfolio duel completes full flow (compare → pick → reason → synthesis) | ☐ |
| “My portfolio” duel works after demo load | ☐ |
| Stock/ETF duel swap sheet still works | ☐ |
| Deep link ` /duel?a=lens:buffett-quality&b=portfolio:my` opens compare | ☐ |

**Stretch:** Add 1 featured duel on Home (“Buffett vs your book”) if you want faster demo entry.

---

## Phase 4 — Scenario planning + research loop (≈75 min)

**Why:** “Plan and predict” story pairs with macro and life goals.

### Do

1. **Research modules** → **Scenario planning** (or `/forecast`).

2. Tap presets: **$500k home**, **kid in 3 years**, **job loss**, **retire at 55**.

3. Add/remove **life events** (wedding, promotion, sabbatical).

4. Drag sliders: net worth, savings, tax drag, burn — confirm chart + dashed baseline move.

5. **Ask CFO about this scenario** — seed should pre-fill chat; verify composer text.

6. Cross-link: from forecast, user should understand how macro (rates) affects the same plan (manual Ask question is enough for demo).

### Test chunk ✓

| Check | Pass? |
|-------|-------|
| Chart updates on every slider/preset | ☐ |
| Milestones card shows peak / at-retirement / “runs out” when applicable | ☐ |
| Life event add/remove reflects on chart markers | ☐ |
| Ask CFO seed from forecast lands in composer and sends | ☐ |

---

## Phase 5 — Demo polish & full walkthrough (≈60–90 min)

**Why:** Long build days fail without one clean end-to-end rehearsal.

### Do

1. Run the **8-minute demo** in `docs/current-slice.md` with fresh eyes; update that doc if routes changed.

2. **Learn hub:** courses → one lesson with SVG illustration → glossary term tap.

3. **Search** → add to watchlist → **X-Ray** → overlap → Duel.

4. **Radar** brief → CTAs still route correctly.

5. Note every dead-end, placeholder alert, or “coming soon” — fix only **demo-blocking** items.

6. Optional commits (only if you want snapshots):
   - `market catalogs`
   - `macro tools`
   - `portfolio duels + forecast`

### Test chunk ✓ — full demo rehearsal

| Step | Pass? |
|------|-------|
| 1. `npm run dev` + sim loads | ☐ |
| 2. Home → demo holdings | ☐ |
| 3. Macro card + Ask Fed question | ☐ |
| 4. Search `DRAM` → stock/ETF detail | ☐ |
| 5. Portfolio duel (Buffett vs you) | ☐ |
| 6. Forecast what-if + Ask seed | ☐ |
| 7. X-Ray → Duel symbols | ☐ |
| 8. Lens → duel vs book | ☐ |
| 9. Radar brief | ☐ |

**End state:** You can record a 5–8 min screen capture without hitting a hard blocker.

---

## Suggested schedule (long day)

| Block | Phase | Focus |
|-------|-------|--------|
| Morning | 1 | Env + catalog generator (run early, parallelize) |
| Late morning | 2 | Macro + Ask CFO |
| After lunch | 3 | Duels (portfolio + securities) |
| Afternoon | 4 | Forecast + Ask seed |
| Late afternoon | 5 | Full demo + fix only P0 bugs |

---

## Parking lot (do not block demo)

- Real affiliate partner URLs
- Thesis evolution / life-stage engine on profile
- Plaid production (sandbox is enough)
- Thesis backtest / live prices in chat (`get_spot_price`)
- Pre-existing TS errors in `assistant-memory-learn.ts`, `app-route.ts`

---

## One-line priority if time runs short

**Catalog run + macro Ask working + one portfolio duel + one forecast preset** = shippable story for tomorrow night.
