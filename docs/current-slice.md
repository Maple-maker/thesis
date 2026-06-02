# Beta demo — all 3 phases

## Phase 1 — Portfolio X-Ray + Duel (`/xray`, `/duel`)

- Effective exposure, overlap flags, gaps, lacking
- Duel: any stock/ETF, thesis fit, overlap %, lacking per side

## Phase 2 — Investor lenses (`/lenses`, `/lenses/[id]`)

- 4 model portfolios with Details / Targets + donut chart
- **vs your book** alignment score + target gaps
- Compare → X-Ray · Duel top holdings

## Phase 3 — Event briefs (`/radar`, `/brief/[id]`)

- Tailored from holdings, themes, watchlist, profile
- Home **Insights & briefs** feed · tap through to full brief
- CTAs: X-Ray, Duel deep links, lenses

## Full demo (~8 min)

**Pre-flight:** API on `:8787`, Expo `.env` keys match server. In dev, Ask CFO works without `/pro` (set `EXPO_PUBLIC_DEV_PRO=0` to test paywall).

1. `npm run dev` — API + Simulator
2. Home → **Load demo** (Accounts or X-Ray)
3. **X-Ray** → NVDA overlap → Duel
4. **Investor lenses** → AI infrastructure → alignment score
5. Home → **Event brief** → read → action
6. **Duel** `SCHD` vs `VYM`
7. **Ask Thesis** — Fed & rates chip (API up; optional `FRED_API_KEY`)
8. **Builder** — conviction ranks · custom thesis · duel from ticker fit
9. **Forecast** — preset + Ask CFO seed

## Config

- Root `.env`: `EXPO_PUBLIC_THESIS_API_URL=http://127.0.0.1:8787`
- `server/.env`: `DEEPSEEK_API_KEY`, `THESIS_APP_SECRET`
