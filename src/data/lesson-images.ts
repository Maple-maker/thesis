import type { ConceptId } from "./concepts";
import type { CourseId } from "./courses";

/**
 * Minimal Robinhood-style lesson visuals, rendered as animated SVG scenes
 * (see `IllustrationScene`), not stock photos.
 */
export type LessonImageKey =
  | "money-coins"
  | "compound-chart"
  | "inflation-prices"
  | "time-horizon"
  | "credit-card"
  | "credit-score"
  | "debt-balance"
  | "savings-jar"
  | "retirement"
  | "tax-forms"
  | "brokerage"
  | "roth-ira"
  | "dca-calendar"
  | "stocks-chart"
  | "etf-diversify"
  | "risk-volatility"
  | "themes-map"
  | "duel-compare"
  | "quiz-check"
  | "default-foundations"
  | "default-credit"
  | "default-retirement"
  | "default-investing"
  | "bonds-stack"
  | "fed-building"
  | "bitcoin-coin"
  | "global-markets"
  | "diversify-pie"
  | "tax-receipt"
  | "behavior-brain"
  | "dividend-coins"
  | "recession-umbrella";

export type LessonImage = {
  key: LessonImageKey;
  alt: string;
};

const ALT: Record<LessonImageKey, string> = {
  "money-coins": "Interest and savings coins",
  "compound-chart": "Compound growth over time",
  "inflation-prices": "Rising prices and inflation",
  "time-horizon": "Long-term time horizon",
  "credit-card": "Credit card and utilization",
  "credit-score": "Credit score and reports",
  "debt-balance": "Balancing debt and savings",
  "savings-jar": "Emergency savings jar",
  retirement: "Retirement planning",
  "tax-forms": "Taxes and investing",
  brokerage: "Brokerage account",
  "roth-ira": "Roth and traditional accounts",
  "dca-calendar": "Dollar-cost averaging schedule",
  "stocks-chart": "Stock market chart",
  "etf-diversify": "Diversified ETF portfolio",
  "risk-volatility": "Market volatility",
  "themes-map": "Global investment themes",
  "duel-compare": "Compare investment options",
  "quiz-check": "Knowledge check",
  "default-foundations": "Money foundations",
  "default-credit": "Credit and borrowing",
  "default-retirement": "Retirement accounts",
  "default-investing": "Investing building blocks",
  "bonds-stack": "Bond coupons and principal",
  "fed-building": "Federal Reserve and rates",
  "bitcoin-coin": "Bitcoin logo",
  "global-markets": "International stock exposure",
  "diversify-pie": "Portfolio diversification slices",
  "tax-receipt": "Tax drag on returns",
  "behavior-brain": "Investing psychology",
  "dividend-coins": "Dividend income stream",
  "recession-umbrella": "Recession resilience",
};

export const CONCEPT_TO_LESSON_IMAGE: Partial<Record<ConceptId, LessonImageKey>> = {
  "interest-rate": "money-coins",
  "compound-interest": "compound-chart",
  "time-value-money": "time-horizon",
  inflation: "inflation-prices",
  "credit-score": "credit-score",
  "fed-rate": "fed-building",
  bonds: "bonds-stack",
  bitcoin: "bitcoin-coin",
  "brokerage-account": "brokerage",
  "roth-vs-traditional": "roth-ira",
  "dollar-cost-averaging": "dca-calendar",
  "what-is-stock": "stocks-chart",
  "what-is-etf": "etf-diversify",
  etf: "etf-diversify",
  diversification: "diversify-pie",
  "risk-vs-return": "risk-volatility",
  volatility: "risk-volatility",
  drawdown: "risk-volatility",
  "expense-ratio": "etf-diversify",
  "active-vs-passive": "etf-diversify",
  "pe-ratio": "stocks-chart",
  dcf: "stocks-chart",
  "dry-powder": "savings-jar",
};

export const COURSE_DEFAULT_IMAGE: Record<CourseId, LessonImageKey> = {
  "money-foundations": "default-foundations",
  "credit-borrowing": "default-credit",
  "retirement-accounts": "default-retirement",
  "investing-building-blocks": "default-investing",
  "bonds-basics": "bonds-stack",
  "fed-and-markets": "fed-building",
  "bitcoin-101": "bitcoin-coin",
  "international-markets": "global-markets",
  "diversification-essentials": "diversify-pie",
  "taxes-investing": "tax-receipt",
  "risk-volatility": "risk-volatility",
  "behavioral-investing": "behavior-brain",
  "dividends-income": "dividend-coins",
  "recession-resilience": "recession-umbrella",
};

export function lessonImage(key: LessonImageKey): LessonImage {
  return { key, alt: ALT[key] };
}
