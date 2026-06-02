# Stock research framework (Thesis app)

Structured prompts for **nested radar research** inside the user's thesis model — educational only, not financial advice.

## Two modes

| Mode | When | Structure |
|------|------|-----------|
| **Thematic book** | Sector portfolio | Sector temperature → macro backdrop → tiered holdings → per-name bull/bear |
| **Conviction dossier** | Single ticker | Conviction score → snapshot → business model → moat → bull/bear → key metric → scenarios → thesis fit |

## In the codebase

| Piece | Path |
|-------|------|
| Prompt builders | `src/data/conviction-research-framework.ts` |
| Radar templates | `src/data/radar-search-templates.ts` |
| Discovery UI | `src/app/(tabs)/watchlist.tsx` + `WatchlistRadarSuggestions` |
| API | `POST /v1/research/thesis-radar` |
| UI | Thesis model → Search radar; Stock → Thesis fit → conviction dossier |

## Product rules

- Educational only; no buy/sell/hold or position sizes from the model
- Always nest under **user's** themes + model weights
- Market data for valuation comes from Massive/Polygon or Yahoo on the server
