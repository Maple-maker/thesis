# Thesis Library — how to make it deep (data sources)

**Today:** 12 theses, ~50 stocks, 40+ glossary concepts, topic aliases (oil, blue chip, space, etc.) in `src/data/library-index.ts`.

**Your goal:** Search feels like a real research library + optional **hypothetical backtest** (1y / 5y / 10y) per thesis.

---

## Layer 1 — Expand static content (no API, ship fast)

| What | File | How to grow |
|------|------|-------------|
| Theses | `src/data/themes.ts`, `thesis-personas.ts` | Add 20–40 theses; each needs `keywords[]`, drivers, model ETFs/stocks |
| Topic aliases | `src/data/library-index.ts` → `TOPIC_ALIASES` | Add rows: `futures`, `reits`, `uranium`, `water`, `defense`, etc. |
| Stocks | `src/data/stocks.ts` | More names + `tags[]` (blue-chip, commodity, space, etc.) |
| Concepts | `src/data/concepts.ts` | Link new terms (commodities, futures, hard assets) |
| Courses | `src/data/courses.ts` | Cross-link lessons to library topics |

**Claude Code slice L1:** “Add 15 theses + 80 stocks + expand TOPIC_ALIASES from `docs/library-expansion-list.md`.”

---

## Layer 2 — Licensed market data (for real charts & backtests)

Use for **illustrative** historical curves only; label “demo / delayed / not advice.”

| Provider | Good for | Cost | Notes |
|----------|----------|------|-------|
| [Polygon.io](https://polygon.io) | US stocks, ETFs, aggregates | Paid tiers | Easy REST; good for 1d bars |
| [Financial Modeling Prep](https://site.financialmodelingprep.com) | Fundamentals, historical price | Free tier limited | Popular for indie apps |
| [Alpha Vantage](https://www.alphavantage.co) | Daily history | Free tier rate-limited | OK for prototypes |
| [Tiingo](https://www.tiingo.com) | EOD prices | Paid | Clean CSV/API |
| [Nasdaq Data Link](https://data.nasdaq.com) | Macro, some equities | Varies | Quandl datasets |

**ETF holdings overlap** (for “thesis portfolio”):  
- [ETF.com](https://www.etf.com) / issuer factsheets (manual)  
- [Securities.io](https://sec.gov) — N-PORT / 13F for serious builds  

---

## Layer 3 — Hypothetical thesis performance (1y / 5y / 10y)

**Product framing:** “If you had held a **representative basket** for this thesis (not advice), here’s how it would have moved.”

### v1 (mock, no API)

- Precompute in `src/data/thesis-backtest-mock.ts` per `ThemeId`:  
  `{ "1y": 12.4, "5y": 8.1, "10y": 10.2 }` % CAGR + disclaimer  
- Show on `builder/[id].tsx` as **illustrative** bars  

### v2 (real data)

1. Each thesis defines `modelETFs: string[]` weights in `thesis-personas.ts`  
2. Nightly job (or on-demand API route) fetches adjusted close for each ETF  
3. Compute weighted return for 1y / 5y / 10y  
4. Store cache in JSON or SQLite  

**Claude Code slice L3:** Wire Polygon/FMP + `src/lib/thesis-backtest.ts`.

---

## Layer 4 — AI-enriched library (optional)

- Generate thesis blurbs from your outline + **human review**  
- **Never** auto-publish buy recommendations  
- Use Ask Thesis to explain how a searched topic maps to user profile  

---

## Content you can send Cursor / Claude Code

1. **Spreadsheet** of theses: name, keywords, 3 drivers, 5 tickers, 2 ETFs  
2. **List of search terms** you care about (your list: hard assets, oil, commodities, futures, space, blue chip, …)  
3. **PDFs / links** you trust (investopedia, Bogleheads, Fed education) — we extract definitions into `concepts.ts`, not verbatim copy  

---

## Regulatory note

Backtests and “performance” copy must say **past performance ≠ future results**, illustrative data, not a recommendation to replicate the basket.
