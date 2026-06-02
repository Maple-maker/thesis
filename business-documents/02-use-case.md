# Thesis — Use Case Description

## Primary Use Case

**Personal Financial Management (PFM) with Investment Thesis Builder**

Thesis is a mobile application in the Personal Financial Management category — similar to Monarch, Copilot, and Mint with an added educational investing layer. Users connect their existing financial accounts to view their complete financial picture and compare their real portfolio allocation against a self-built investment thesis model.

## User Journey

```
Learn (courses + glossary + Ask AI)
    ↓
Thesis Builder (pick themes, customize allocation, name conviction)
    ↓
Connect Accounts (Plaid — see real portfolio)
    ↓
Compare (real holdings vs thesis model)
    ↓
Research (duel comparisons, catalyst sweeps, AI analyst debates)
    ↓
Act (open brokerage account via affiliate link — execute thesis independently)
```

## Specific Plaid Product Usage

### Auth
**Purpose:** Authenticate users' bank and brokerage accounts so they can link them to Thesis.
**User benefit:** One-tap account linking instead of manual data entry.

### Balance
**Purpose:** Display real-time account balances across all linked accounts.
**User benefit:** Users see their total financial picture — cash, investments, debts — in one place.

### Transactions
**Purpose:** Import 24 months of transaction history for cash flow analysis.
**User benefit:** Users understand their monthly investable capacity before building a thesis. "I have $500/month to invest — how should I allocate it?"

### Investments
**Purpose:** Import brokerage holdings, securities data, cost basis, and portfolio composition.
**User benefit:** Users compare their *actual* portfolio (via Plaid) against their *thesis* portfolio (self-built in the app). This is the core value prop: "Your portfolio is 65% aligned with your AI Infrastructure thesis."

### Investments Refresh
**Purpose:** On-demand holdings updates when users open the app.
**User benefit:** Portfolio data is current, not stale.

### Liabilities
**Purpose:** Import loan data — student loans, credit cards, mortgage, auto loans.
**User benefit:** Full financial context. Users should understand their debt situation before allocating capital to investments.

## User Control

All investment decisions are made **by the user, not by Thesis**:
- The user selects investment themes (AI compute, dividend growth, value, etc.)
- The user customizes portfolio weights (slider-based, manual overrides)
- The user saves their thesis model
- The user decides whether to act on the model (by opening a brokerage account independently)
- Thesis never recommends specific buys, sells, or trades

## Comparison to Similar Platforms

| Feature | Thesis | Monarch | Copilot | Robinhood | Betterment |
|---------|--------|---------|---------|-----------|------------|
| Account aggregation | Yes | Yes | Yes | No | Yes |
| Investment thesis builder | Yes | No | No | No | No |
| Educational courses | Yes | No | No | Yes | No |
| AI research tools | Yes | No | No | No | No |
| Trade execution | No | No | No | Yes | Yes |
| Investment advice | No | No | No | No | Yes |
| AUM fees | No | No | No | No | Yes |

---

*Last updated: June 2026*
