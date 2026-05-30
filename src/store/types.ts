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
  | "small-cap"
  | "international"
  | "esg"
  | "moat"
  | "high-volatility";

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
};

export type ETF = {
  symbol: string;
  name: string;
  expense: number; // %, e.g. 0.03
  themes: ThemeId[];
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
  emoji?: string; // legacy, optional
  glyph: string; // icon name from our Icon set
  kicker: string; // ALL-CAPS category label
  heat: ThemeHeat;
  author: string; // e.g. "after Leopold Aschenbrenner", "a structural shift"
  drivers: string[]; // 3-4 key drivers
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
  | "real-assets";

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

export type JournalEntry = {
  id: string;
  createdAt: number;
  winner: string; // symbol
  loser: string; // symbol
  reason: JournalReason;
  note?: string;
};

export type DuelResult = {
  winner: string;
  loser: string;
  etfSuggestion?: string; // symbol of ETF that holds both
};
