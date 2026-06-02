# Design reference — Silvia CFO → Thesis

**Thesis difference:** Silvia assumes literacy. Thesis **teaches first**, then offers the same sharp tools.

| Silvia | Thesis adaptation | Where |
|--------|-------------------|--------|
| Dashboard + Ask Silvia | **Home** — Ask card + prompt chips | `(tabs)/index` |
| Radar feed | **Thesis Radar** — thesis/watchlist insights (mock → API) | Home + `/radar` |
| Suggested Research | **Research** menu — gated by education level | Home + Learn |
| Scenario / simulation | **Research** (v2) + plain-English preface | Phase R1 |
| Portfolio concentration | Watchlist + duel + fingerprint | Existing |
| Net worth tracking | Out of v1 (needs Plaid) | Roadmap |
| SMS/email alerts | Push notifications (v2) | Roadmap |

## Education gate (critical)

Before deep research runs, user should see:

- Link to relevant **course** or **glossary** term
- One-line "Prerequisite" on each research module

Example: "Stress test my portfolio" → links to diversification + drawdown concepts first.

## Monetization fit

- **Buy a home** / **Spending insights** → affiliate (HYSA, credit, mortgage partners later)
- **Brokerage** → after emergency fund + Learn path complete

## Phases

| Phase | Deliverable |
|-------|-------------|
| **S0** (now) | Home UI: Ask chips, Radar mock feed, Research list |
| **S1** | `/radar` full screen + create monitor (natural language, local mock) |
| **R1** | Research flows: scenario, portfolio analysis (illustrative backtest) |
| **A3–A5** | Ask Thesis chat with same prompt chips |

Assets: `assets/Screenshot_2026-05-30_at_14.05*.png`

## Go deeper (mobile-native)

- **No book lists** in glossary — `youtube-resources.ts` + `GoDeeperVideos` opens YouTube.
- Empty states use `NotFoundState` with suggested videos + Library/Learn CTAs.
