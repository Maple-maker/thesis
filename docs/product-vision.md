# Thesis — product vision

## What we are

**Investopedia meets NerdWallet** for mobile: educate first, then help users **build a portfolio grounded in an investment thesis** — not hot tips or autopilot trading.

## User journey

```text
Learn (courses + glossary + Ask)
    ↓
Thesis builder (onboarding) → Library (theses) → Watchlist
    ↓
Duels & tools sharpen conviction
    ↓
Affiliate next steps (brokerage, HYSA, credit) when profile-ready
```

## Navigation (4 tabs)

| Tab | Role |
|-----|------|
| **Home** | Ask Thesis, **Thesis Radar**, suggested research, fingerprint, duels, **tools & offers** |
| **Library** | Search theses, topics, stocks, concepts |
| **Learn** | Courses, glossary, Ask Thesis |
| **Watchlist** | Names you're comparing; path to duels |

**Not a tab:** Journal (duel history stays in data; no dedicated tab). Builder (linked from Library).

## Business model

**Affiliate revenue** — we earn when users open vetted accounts we explain in context:

- High-yield savings (emergency fund first)
- Brokerage (when ready to invest)
- Credit cards / credit builder (when building credit or responsible spend)

**Rules:**

- Education and comparison **before** the link
- Clear disclosure on every offer surface (`AFFILIATE_DISCLOSURE`)
- Offers ranked by **user profile**, not highest commission
- Never imply guaranteed returns or that we are a fiduciary

## What we are not

- A broker or RIA
- A stock-picking newsletter
- Robinhood-style "place a trade" funnel as the hero

## Implementation map

| Feature | Status / file |
|---------|----------------|
| Education hub | `(tabs)/education`, `courses/` |
| Library search | `(tabs)/themes`, `library-index.ts` |
| Affiliate cards | `affiliate-offers.ts`, Home "Tools" section |
| Real partner URLs | Replace placeholders in `affiliate-offers.ts` |
| Portfolio backtest | `docs/library-data-sources.md` L3 |
| Silvia-inspired UX | `docs/design-reference-silvia-cfo.md`, Home widgets, `/radar` |
| Ask prompt chips | `ask-prompts.ts`, `ask.tsx` |
| Research modules (gated) | `research-modules.ts`, Home list |
| Live Radar monitors | Phase S1 — natural language + push |
