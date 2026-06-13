export type Sector =
  | "Technology"
  | "Energy"
  | "Healthcare"
  | "Financials"
  | "Consumer"
  | "Industrials"
  | "Materials"
  | "Utilities"
  | "Real Estate"
  | "Communication";

export type ThemeId =
  | "clean-energy"
  | "ai-infrastructure"
  | "aging-demographics"
  | "cash-flow-defensives"
  | "emerging-tech"
  | "global-diversification"
  | "compounders"
  | "income"
  | "cybersecurity"
  | "consumer-staples"
  | "fintech"
  | "biotech";

export type StockTag =
  | "growth"
  | "value"
  | "dividend"
  | "speculative"
  | "blue-chip"
  | "mega-cap"
  | "large-cap"
  | "mid-cap"
  | "small-cap"
  | "international"
  | "esg"
  | "moat"
  | "high-volatility"
  | "defensive"
  | "cyclical"
  | "income-heavy"
  | "semiconductor"
  | "ai-compute"
  | "biotech"
  | "pharma"
  | "reit"
  | "infrastructure"
  | "consumer-staples"
  | "consumer-discretionary"
  | "financials"
  | "energy-commodity"
  | "energy-transition"
  | "payments"
  | "cybersecurity"
  | "cloud-software"
  | "turnaround";

export type EtfTag =
  | "broad-market"
  | "growth-tilt"
  | "defensive"
  | "sector-bundle"
  | "thematic"
  | "international"
  | "emerging-markets"
  | "income"
  | "dividend-growth"
  | "low-cost"
  | "higher-fee"
  | "semiconductor"
  | "clean-energy"
  | "healthcare"
  | "cybersecurity"
  | "biotech"
  | "real-estate"
  | "commodity"
  | "active-concentrated"
  | "leveraged-inverse"
  | "small-cap"
  | "income-heavy"
  | "cyclical"
  | "energy-commodity"
  | "consumer-discretionary"
  | "consumer-staples"
  | "fintech"
  | "payments"
  | "ai-compute"
  | "infrastructure"
  | "speculative";

export type Stock = {
  symbol: string;
  name: string;
  sector: Sector;
  themes: ThemeId[];
  tags: StockTag[];
  thesis: string; // one-line thesis fragment, surfaced in the duel
  marketCap: number; // in billions USD
  divYield: number; // %, 0 if none
  peRatio: number | null;
  volatility: "low" | "med" | "high";
  /** Company website domain for logo lookup (Brandfetch CDN). */
  domain?: string;
};

export type ETF = {
  symbol: string;
  name: string;
  expense: number; // %, e.g. 0.03
  themes: ThemeId[];
  tags: EtfTag[];
  description: string;
  holdings: string[]; // stock symbols (top representative holdings)
};

export type ThemeHeat =
  | "Heating up"
  | "Evergreen"
  | "Timeless"
  | "Long arc"
  | "Steady";

export type Theme = {
  id: ThemeId;
  title: string;
  thesis: string; // short blurb for cards
  color: string; // hex for accent (gradient start)
  emoji?: string;
  glyph: string; // icon name from our Icon set
  kicker: string; // ALL-CAPS category label
  heat: ThemeHeat;
  author: string; // e.g. "after Leopold Aschenbrenner", "a structural shift"
  drivers: string[]; // 3-4 key drivers
  keywords?: string[]; // searchable topic terms
};

// ---- User profile (from questionnaire) ----

export type Horizon = "short" | "medium" | "long" | "very-long";
export type RiskTolerance = "very-low" | "low" | "medium" | "high" | "very-high";
export type IncomeNeed = "none" | "some" | "primary";

export type Interest =
  | "climate"
  | "ai"
  | "aging"
  | "crypto"
  | "biotech"
  | "consumer-brands"
  | "international"
  | "small-companies"
  | "cybersecurity"
  | "real-assets"
  | "dividends"
  | "quality-blue-chip"
  | "healthcare"
  | "defense"
  | "energy-commodities"
  | "broad-index"
  | "housing-reits"
  | "fintech-payments"
  | "emerging-markets"
  | "quality-dividend";

export type Concern =
  | "inflation"
  | "recession"
  | "market-crash"
  | "geopolitical"
  | "regulation"
  | "missing-out";

export type Value =
  | "esg"
  | "made-in-america"
  | "avoid-fossil"
  | "avoid-tobacco-weapons"
  | "no-preference";

export type UserProfile = {
  // step 1: situation
  age: number;
  netInvestable: number; // approximate, USD
  monthlyContribution: number;
  hasEmergencyFund: boolean;
  hasHighInterestDebt: boolean;

  // step 2: goals
  primaryGoal: "retirement" | "wealth" | "house" | "income" | "exploration";
  horizon: Horizon;
  targetReturn: "conservative" | "moderate" | "aggressive";

  // step 3: temperament
  risk: RiskTolerance;
  reactionToDrawdown: "panic-sell" | "hold" | "buy-more";
  experience: "none" | "some" | "experienced";

  // step 4: interests
  interests: Interest[];
  concerns: Concern[];
  values: Value[];
  incomeNeed: IncomeNeed;

  /** Quick Take only — single theme interest proxy, mapped to interests[] at reveal. */
  qtInterest?: string;
};

// ---- Conviction portfolio ----

/** Why the user added a holding — required at the conviction gate. */
export type ConvictionReason =
  | "long-term-growth"
  | "fits-my-thesis"
  | "valuation"
  | "gut-feeling"
  | "following-someone"
  | "income-yield"
  | "diversification"
  | "other";

/**
 * One conviction-tracked holding. Mirrors the `decisions` table JSONB payload
 * (type 'portfolio_add') — keep field names in sync with supabase/functions.
 */
export type PortfolioHolding = {
  id: string; // client-generated, dedupe key for cloud sync
  symbol: string;
  addedAt: number;
  reason: ConvictionReason;
  note: string; // user's free text, may be empty
  sourceLens?: string; // investor lens id when added via "copy a lens"
  allocationPct: number; // equal-weight default, user-adjustable
};

// ---- App state objects ----

export type JournalReason =
  | "better-moat"
  | "cheaper-valuation"
  | "stronger-growth"
  | "more-aligned"
  | "better-management"
  | "safer"
  | "gut"
  | "other";

export type JournalEntryType =
  | "duel"
  | "buy"
  | "sell"
  | "thesis-change"
  | "watchlist-add"
  | "watchlist-remove"
  | "general";

export type EmotionalState = "confident" | "uncertain" | "anxious" | "excited";

export type JournalEntry = {
  id: string;
  createdAt: number;
  type: JournalEntryType;
  /** Symbol chosen in a duel (duel entries only). */
  winner?: string;
  /** Symbol passed over in a duel (duel entries only). */
  loser?: string;
  /** Reason for a duel decision. */
  reason?: JournalReason;
  /** Short note captured at creation time. */
  note?: string;
  /** How the user felt when making the entry. */
  emotionalState?: EmotionalState;
  /** Longer free-form reflection text. */
  freeformNote?: string;
  /** User-defined labels for categorisation. */
  tags?: string[];
  /** Links this entry to a thesis model for cross-referencing. */
  relatedThesisId?: string;
  /** Next suggested revisit (90 days after creation by default). */
  revisitAt: number;
  /** User has snoozed the revisit. */
  revisitSnoozed?: boolean;
};

export type WatchlistAlert = {
  id: string;
  symbol: string;
  type: "price-above" | "price-below" | "conviction-change";
  threshold?: number; // price target
  convictionDirection?: "up" | "down";
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
};

export type DuelResult = {
  winner: string;
  loser: string;
  etfSuggestion?: string; // symbol of ETF that holds both
};
