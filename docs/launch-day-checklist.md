# Launch-day checklist (rough beta)

Use with `docs/tomorrow-gameplan.md`. Market data provider deferred — bundled catalog only.

## Phase 2 — Ask CFO + macro (~45 min)

- [ ] API: `curl http://127.0.0.1:8787/v1/health` → `ok: true`
- [ ] Optional: `FRED_API_KEY` in `server/.env` for Fed funds on macro card
- [ ] Home → **Macro & markets** loads (Treasury at minimum)
- [ ] Home → **Ask** chip **Fed & rates** → auto-sends, answer cites real %
- [ ] **Macro news** chip works
- [ ] Learn page macro card loads

**Dev note:** Ask works in `__DEV__` without `/pro`. Set `EXPO_PUBLIC_DEV_PRO=0` in root `.env` to test paywall.

## Phase 3 — Duels + builder + thesis match (~2 hr)

### Duels
- [ ] Home → **Load demo**
- [ ] Home → **Buffett vs your book**
- [ ] Duel → Portfolios → featured matchups (load demo if empty)
- [ ] Duel → compare shows **Thesis match** with 7-factor on stocks
- [ ] Switch bull/bear tab → conviction breakdown updates
- [ ] Securities: `NVDA` vs `SMH`, swap, flip
- [ ] Watchlist → 2 tickers → Duel

### Builder
- [ ] Library/Themes → **Builder** or Home → thesis builder
- [ ] **Build your own thesis** → save name + conviction → appears on Builder hub
- [ ] **Conviction ranking** lists (needs ≥1 theme adopted)
- [ ] **Does this fit?** ticker → full breakdown → Duel vs VOO

## Phase 4 — Forecast (~45 min)

- [ ] Research → **Scenario planning**
- [ ] Presets: house, kid, job loss, retire 55
- [ ] Life events add/remove; sliders move chart + baseline
- [ ] **Ask CFO about this scenario** → seed auto-sends

## Phase 5 — Full demo (~60 min)

Run `docs/current-slice.md` steps 1–9 plus builder + forecast.

Fix only **P0** blockers (crashes, blank screens, 503 chat).

## Parking lot

- Polygon / full market catalog
- Yahoo live search (`MARKET_LIVE_SEARCH=0` is fine)
- Production Plaid / affiliates
