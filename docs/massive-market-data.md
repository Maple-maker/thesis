# Massive.com market data (Thesis)

Massive is the rebranded Polygon.io API. Thesis defaults to the **free Stocks Basic** plan behavior and upgrades via `MASSIVE_PLAN` when you pay for more.

## Quick setup (free tier)

In **`server/.env`**:

```bash
MASSIVE_API_KEY=your_key_from_massive.com_dashboard
MASSIVE_PLAN=basic
MARKET_LIVE_SEARCH=1
```

Restart: `npm run server:dev`

Health check: `curl http://127.0.0.1:8787/v1/health` → `market.plan` should be `"basic"`, `quoteMode` `"eod-bars"`.

## What each plan gets in the app

| Plan | Env | Stock price | Chart | Search | Notes |
|------|-----|-------------|-------|--------|-------|
| **Stocks Basic (free)** | `MASSIVE_PLAN=basic` | Previous day close (EOD) | Weekly bars, 2yr history | Ticker search | ~2 API calls per stock; 15 min cache; 12.5s between calls (5/min limit) |
| **Stocks Starter+** | `MASSIVE_PLAN=starter` | 15-min delayed snapshot | Full weekly + market cap | Same | Uses snapshot endpoint (3 calls first load) |
| **Stocks Advanced / full** | `MASSIVE_PLAN=advanced` or `full` | Real-time snapshot | Same | Same | Label shows delayed/realtime per Massive |

## Upgrade path

1. **basic** (default) — development and light personal use; bundled catalog + EOD quotes.
2. **starter** — when you need delayed intraday snapshot prices and market cap on quotes.
3. **developer** / **advanced** — more history, higher rate limits (adjust `MARKET_API_GAP_MS` down).
4. Set `MASSIVE_PLAN=starter` (or higher) in `server/.env` and restart — no code changes.

Optional overrides:

```bash
MARKET_QUOTE_CACHE_MS=900000   # quote cache (default 15m on basic)
MARKET_API_GAP_MS=12500        # throttle between calls (default 12.5s on basic)
MARKET_SEARCH_CACHE_MS=900000  # search cache (default 15m)
```

## API usage in Thesis

| Feature | Endpoints (Basic) |
|---------|-------------------|
| Stock detail | `GET /v2/aggs/ticker/{sym}/prev` + weekly `range/1/week/...` |
| Library search | `GET /v3/reference/tickers?search=...` |
| Radar valuation | Cached quote only on Basic (no extra snapshot) |

## Client

- Stock screen label: **Massive · EOD** (basic) or **Massive · delayed**
- Client caches quotes 15 minutes to match server
- If API returns 429, app falls back to illustrative prices and uses the bundled catalog

## Pricing reference

[https://massive.com/pricing](https://massive.com/pricing) — confirm limits on your account; free tier is commonly **5 requests/minute** on aggregate endpoints.
