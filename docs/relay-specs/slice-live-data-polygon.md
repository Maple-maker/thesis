# Slice — Live stock price fetch layer (Polygon.io)

**Owner:** Cursor (planning)
**Implementer:** Claude Code — implement this slice only. Read `AGENTS.md` before starting.

**Status:** Not started
**Prerequisite:** Quick Take slice must ship first.

---

## Goal

Replace the static `returnYTD` and `return1y` values in `src/data/stock-financials.ts` with a thin live-data fetch layer using **Polygon.io** (free tier). Prices appear in the model portfolio rows on `quick-take/result.tsx` and on `stock/[symbol].tsx`.

---

## Non-goals

- Real-time streaming / websocket prices
- Options, fundamentals, or earnings via Polygon
- Changing any scoring or theme logic
- Building a brokerage or trading feature of any kind

---

## Product constraints

- Data is **educational and illustrative** — all price display must carry: `"Prices delayed ≥15 min · Educational only · Not investment advice"`
- The app must degrade gracefully if the API call fails — fall back to mock data silently
- Free Polygon tier: 5 API calls/min, 15-min delay. This is sufficient for a demo/beta.

---

## API

**Polygon.io** — [polygon.io](https://polygon.io)
- Free tier, no trading license required for educational apps
- Endpoint used: `GET /v2/aggs/ticker/{ticker}/prev`
  - Returns: `c` (close), `o` (open), `v` (volume), date
- API key stored in `src/lib/polygon.ts` via `process.env.EXPO_PUBLIC_POLYGON_KEY`

> Human step: Sign up at polygon.io, get a free API key, add `EXPO_PUBLIC_POLYGON_KEY=your_key` to `.env`.

---

## New file: `src/lib/polygon.ts`

```ts
const BASE = "https://api.polygon.io";
const KEY  = process.env.EXPO_PUBLIC_POLYGON_KEY ?? "";

export type LiveQuote = {
  symbol:    string;
  close:     number;   // previous session close
  open:      number;
  change:    number;   // close - open
  changePct: number;   // (close - open) / open
  date:      string;   // "YYYY-MM-DD"
};

/** Fetch previous-day OHLCV for a single symbol. */
export async function fetchQuote(symbol: string): Promise<LiveQuote | null> {
  if (!KEY) return null;
  try {
    const res = await fetch(
      `${BASE}/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${KEY}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const r = json?.results?.[0];
    if (!r) return null;
    return {
      symbol,
      close:     r.c,
      open:      r.o,
      change:    r.c - r.o,
      changePct: (r.c - r.o) / r.o,
      date:      new Date(r.t).toISOString().slice(0, 10),
    };
  } catch {
    return null;
  }
}

/** Batch fetch up to 5 symbols (respects free-tier rate limit). */
export async function fetchQuotes(symbols: string[]): Promise<Record<string, LiveQuote>> {
  const results: Record<string, LiveQuote> = {};
  // Sequential to stay under 5 req/min on free tier
  for (const sym of symbols.slice(0, 5)) {
    const q = await fetchQuote(sym);
    if (q) results[sym] = q;
  }
  return results;
}
```

---

## Changes to `quick-take/result.tsx`

1. Add `useState<Record<string, LiveQuote>>({})` and `useEffect` that calls `fetchQuotes(topSymbols)` on mount.
2. Update `StockRow` to accept `quote?: LiveQuote` and render:
   - Price: `$${quote.close.toFixed(2)}` in `font-mono`
   - Change: `+2.3%` or `-1.1%` in `text-pos` / `text-neg`
   - If no quote: show `—` (em dash) in ink-3
3. Add disclaimer row below stock list: `"Prices delayed ≥15 min · Educational only · Not investment advice"` — ink-3, 11px, centered.

---

## Changes to `stock/[symbol].tsx`

Same pattern: fetch single quote on mount, display price + daily change at top of screen alongside existing data. Degrade to `—` if API unavailable.

---

## Files to create / touch

| File | Action |
|------|--------|
| `src/lib/polygon.ts` | **Create** — fetch utility |
| `src/app/quick-take/result.tsx` | **Edit** — add live price display |
| `src/app/stock/[symbol].tsx` | **Edit** — add live price display |
| `.env` (human step) | Add `EXPO_PUBLIC_POLYGON_KEY` |

---

## Acceptance checks

- [ ] `fetchQuote("NVDA")` returns a valid `LiveQuote` when key is set
- [ ] Falls back to `—` gracefully when API key absent or call fails
- [ ] Price + daily change visible on model portfolio rows (result.tsx)
- [ ] Price + daily change visible on stock detail screen
- [ ] Disclaimer visible on both screens
- [ ] No recommendation language added
- [ ] `npx tsc --noEmit` passes

---

## Verify

```bash
cd /Users/jaidenrabatin/Projects/thesis
npx tsc --noEmit
npm run ios   # QA: model portfolio shows prices, tapping stock shows price
```
