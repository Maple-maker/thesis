# Feature spec — Portfolio Builder + Investor Lenses

**Status:** Design spec — not a Hermes slice yet. Break into slices per phase below before handing to Claude Code.
**Milestone:** M1 (Duel-to-Journal conviction loop) → extends into M2 (personalized learning)

---

## The core problem this solves

Right now Thesis has watchlists and duels, but no place where a user says "this is my portfolio." The conviction loop is incomplete: users pick stocks in duels but there's no accumulation point where they see *what they own and why.*

The investor lenses feature solves a second problem: "copy Buffett" is a great entry point (people know the name), but mindless copying produces zero financial literacy. The constraint we impose — *you must state your own reason before any stock is added* — is the mechanism that separates Thesis from every copy-portfolio product.

---

## Feature map

```
Portfolio tab (new first-class tab)
├── Builder home — holdings list + stats + tension flags
├── Add a holding — search + conviction gate
│   └── Conviction gate — WHY are you adding this? (required)
│       └── Educational nudge — context based on their reason
├── Copy a lens — investor philosophy browser
│   ├── Lens detail — framework + holdings + profile match check
│   └── Add from lens — triggers conviction gate per stock
└── Portfolio health — (future) concentration, correlation, theme balance
```

---

## Data model additions

### `PortfolioHolding` (new type in `src/store/types.ts`)

```ts
export type ConvictionReason =
  | "long-term-growth"
  | "fits-my-thesis"
  | "valuation"
  | "gut-feeling"
  | "following-someone"
  | "income-yield"
  | "diversification"
  | "other";

export type PortfolioHolding = {
  id: string;                      // unique, auto-generated
  symbol: string;
  addedAt: number;                 // timestamp
  reason: ConvictionReason;
  note: string;                    // user's free-text, can be empty
  sourceLens?: string;             // investor lens id if added via "copy a lens"
  allocationPct: number;           // user-set or equal-weighted default
};
```

### Store additions (`src/store/index.ts`)

```ts
// New slice
portfolio: PortfolioHolding[];
addHolding: (holding: Omit<PortfolioHolding, "id" | "addedAt">) => void;
removeHolding: (symbol: string) => void;
updateAllocation: (symbol: string, pct: number) => void;
```

Equal-weight default: when a holding is added, set `allocationPct = 100 / (portfolio.length + 1)` and redistribute all existing holdings evenly. User can then manually adjust.

### `InvestorLens` (new data type in `src/data/investor-lenses.ts`)

```ts
export type InvestorLens = {
  id: string;
  name: string;                    // "Warren Buffett"
  persona: string;                 // "The Quality Compounder"
  tagline: string;                 // "The Oracle of Omaha"
  initial: string;                 // for avatar: "W"
  color: string;                   // hex, maps to theme-like brand color
  framework: string;               // 2-3 sentence investing philosophy
  quote: string;                   // real quote
  timeHorizon: Horizon;
  riskLevel: "low" | "moderate" | "high";
  criteria: string[];              // what they look for (3-4 items)
  modelStocks: string[];           // symbol array
  stockRationale: Record<string, string>; // symbol → why they'd hold it
  matchWarnings: string[];         // things to check against user profile
};
```

### Seed data — 6 initial lenses

| ID | Name | Persona | Stocks |
|----|------|---------|--------|
| `buffett` | Warren Buffett | Quality Compounder | BRK.B, AAPL, COST, MA, V |
| `wood` | Cathie Wood | Disruptive Innovator | TSLA, CRSP, RKLB, PLTR, IONQ |
| `dalio` | Ray Dalio | All-Weather | KO, JNJ, WMT, GLD, TLT |
| `lynch` | Peter Lynch | Growth at a Fair Price | WMT, SBUX, HD, AMZN, NKE |
| `graham` | Benjamin Graham | Value Investor | BRK.B, JPM, PG, JNJ, T |
| `simons` | Jim Simons (principle) | Quantitative | (ETFs: SPY, QQQ, VWO, BND — diversified, evidence-based) |

---

## Screen specifications

### Screen 1 — Portfolio Builder home (`src/app/(tabs)/portfolio.tsx`)

**Header:** "Build what you actually believe." — kicker: "YOUR PORTFOLIO"

**Stats row (3 cards):**
- Holdings count
- Reasons logged (holdings with a non-empty reason)
- Themes covered (unique theme IDs across holdings)

**Tension flag** — surfaces when two holdings have conflicting volatility profiles or opposite thesis alignments. Rule: if `portfolio` includes both a `volatility: "high"` AND a `volatility: "low"` stock from the same theme, show the amber card. Copy: "Tension: [A] and [B] pull in opposite directions on [dimension]. Explore in next Duel."

**Holdings list** — rows with: symbol (mono), company name + theme, allocation bar (proportional), allocation %, and a "No reason" amber pill if `reason === undefined` (for stocks added before gate was built).

**CTAs:**
- Primary: "Add a holding" → stock search → conviction gate
- Secondary: "Copy a lens" → investor lens browser

---

### Screen 2 — Conviction gate (`src/components/ConvictionGate.tsx`)

Shown as a bottom sheet (or full modal) whenever a stock is added — from search, from a lens, or from a duel result.

**Stock header:** symbol + name + volatility tag

**Required field: "Why are you adding [symbol]?"**

Reason options (single select, required to proceed):
```ts
const CONVICTION_REASONS = [
  { id: "long-term-growth",   label: "I believe in the long-term growth story", icon: "trending-up" },
  { id: "fits-my-thesis",     label: "It fits my thesis theme",                 icon: "target" },
  { id: "valuation",          label: "The valuation looks compelling",           icon: "scale" },
  { id: "gut-feeling",        label: "Gut feeling / momentum",                   icon: "flame" },
  { id: "following-someone",  label: "Following someone I respect",              icon: "users" },
  { id: "income-yield",       label: "I want the dividend income",               icon: "piggy-bank" },
  { id: "diversification",    label: "Portfolio diversification",                icon: "layout-grid" },
];
```

**Optional note field:** free-text, placeholder "Add your thinking..." — stored in `PortfolioHolding.note`.

**Educational nudge** — shown after reason is selected, before confirm:
- `gut-feeling` → show P/E or key risk metric for the stock + "Learn: [concept]" pill
- `following-someone` → "You should own your reason, not just the ticker. What specifically do you agree with?"
- `valuation` → show P/E vs sector average if available in `stock-financials.ts`
- `fits-my-thesis` → confirm it maps to one of their themes; flag if it doesn't
- `long-term-growth` → show revenue growth YoY from financials

**Confirm:** "Add to portfolio" — disabled until reason is selected.

**Reminder:** "Your reason is saved to your Conviction Journal. We'll bring it back when this stock appears in a Duel."

---

### Screen 3 — Investor lens browser (`src/app/(tabs)/lenses.tsx` or sub-route)

**Header:** "Study a framework, build your own." — sub: "These aren't copy-paste portfolios. They're lenses — ways of thinking you can adapt, question, and make your own."

**Lens cards** — for each `InvestorLens`:
- Avatar circle with initial (colored per lens)
- Name + persona
- Time horizon + risk level tags
- One-line quote (italic)
- Stock pills (first 3 + "+N more")
- Arrow button → lens detail

**Note at bottom:** "When you add a stock from a lens, we'll ask you why — you should own your reason, not just the ticker."

---

### Screen 4 — Investor lens detail (`src/app/(tabs)/lenses/[id].tsx`)

**Sections:**
1. Investor avatar + name + persona
2. Framework card — 2-3 sentence philosophy
3. Stats grid: time horizon, risk level
4. "What they look for" — 3-4 criteria with icons (moat, pricing power, FCF, etc.)
5. Model holdings — symbol + name + rationale pill
6. **Profile match card** — compares their approach against user's questionnaire profile:
   - Green: aligned (e.g., long horizon matches)
   - Amber: tension (e.g., panic-sell drawdown + Buffett's hold-through-50%-drops requirement)
7. CTA: "Add these holdings (with my own reasons)" — triggers conviction gate for each stock, one by one

**Key design principle:** The match card is NOT a "compatibility score." It's educational friction — it shows the user what they're accepting if they adopt this framework, and where they might struggle.

---

## The conviction loop (how it connects to existing features)

```
Add holding → Conviction gate (reason logged)
       ↓
   Duel picks same stock
       ↓
Journal: "You said [reason] when you added [symbol] — does that still hold?"
       ↓
Stress Test (M3): "Your thesis for TSLA was 'long-term growth' — 
                   here's what the bear case looks like"
```

This is the flywheel. The conviction gate is not a one-time tax — it's the first record in a running dialogue the app has with the user about why they own what they own.

---

## Tension detection logic (`src/lib/portfolio-health.ts`)

```ts
export type PortfolioTension = {
  symbolA: string;
  symbolB: string;
  dimension: "volatility" | "horizon" | "thesis-conflict";
  description: string;
};

export function detectTensions(
  holdings: PortfolioHolding[],
  stocks: Stock[]
): PortfolioTension[] {
  const tensions: PortfolioTension[] = [];
  for (let i = 0; i < holdings.length; i++) {
    for (let j = i + 1; j < holdings.length; j++) {
      const a = stocks.find(s => s.symbol === holdings[i].symbol);
      const b = stocks.find(s => s.symbol === holdings[j].symbol);
      if (!a || !b) continue;
      if (a.volatility === "high" && b.volatility === "low") {
        tensions.push({
          symbolA: a.symbol,
          symbolB: b.symbol,
          dimension: "volatility",
          description: `${a.symbol} is high-volatility; ${b.symbol} is low-volatility — these pull in different directions.`,
        });
      }
    }
  }
  return tensions.slice(0, 2); // max 2 shown at once
}
```

---

## Files to create

| File | Purpose |
|------|---------|
| `src/store/types.ts` | Add `PortfolioHolding`, `ConvictionReason` types |
| `src/store/index.ts` | Add portfolio slice (`portfolio`, `addHolding`, `removeHolding`, `updateAllocation`) |
| `src/data/investor-lenses.ts` | Seed 6 lenses with frameworks, quotes, model stocks, rationales |
| `src/app/(tabs)/portfolio.tsx` | Builder home screen |
| `src/app/(tabs)/lenses.tsx` | Lens browser screen |
| `src/app/(tabs)/lenses/[id].tsx` | Lens detail screen |
| `src/components/ConvictionGate.tsx` | Bottom sheet / modal — reason picker + note + nudge |
| `src/lib/portfolio-health.ts` | `detectTensions()` + future concentration checks |

---

## Compliance guardrails

- No percentage allocations shown as "recommended" — users set their own
- No performance projections on any holding
- Model stocks on lens detail: always labeled "Illustrative · educational only"
- Conviction gate copy never says "good choice" or validates the pick — it educates about what they're accepting
- Tension flags are educational observations, not warnings to sell: "These pull in different directions" not "You shouldn't own both"
- All investor quotes must be real, sourced quotes — not fabricated
- Lens detail match card uses the word "tension" not "incompatible" or "wrong"

---

## Implementation phases (for slicing)

**Phase P1** — Foundation (2 slices):
- P1a: Data layer — `PortfolioHolding` types + store slice + `investor-lenses.ts` seed data
- P1b: Portfolio home screen — holdings list, stats row, empty state

**Phase P2** — Conviction gate (1 slice):
- `ConvictionGate.tsx` + wire it into watchlist add flow + link back to JournalEntry

**Phase P3** — Investor lenses (2 slices):
- P3a: Lens browser + lens detail (read-only)
- P3b: "Add from lens" flow — triggers conviction gate per stock

**Phase P4** — Intelligence layer (1 slice):
- `portfolio-health.ts` tension detection + tension flag card on home screen

Each phase is a clean Hermes slice. P1 is prerequisite for everything else.
