export type LifeScenarioId =
  | "job-loss"
  | "emergency-expense"
  | "married"
  | "new-child"
  | "home-purchase"
  | "promotion";

export type LifeScenarioPreset = {
  id: LifeScenarioId;
  label: string;
  emoji: string;
  oneLiner: string;
  /** Appended to model thesis conviction when applied */
  convictionNote: string;
  /** Stress-test narrative for the reform card */
  stressSummary: string;
  /** Temporary profile overlay for portfolio rebuild */
  profileOverlay: {
    hasEmergencyFund?: boolean;
    hasHighInterestDebt?: boolean;
    monthlyContributionFactor?: number;
    riskDownshift?: boolean;
  };
  /** Scale stock vs ETF weights in model book */
  holdingsOverlay: {
    stockWeightFactor: number;
    etfWeightFactor: number;
    maxStocksDelta: number;
  };
};

export const LIFE_SCENARIO_PRESETS: LifeScenarioPreset[] = [
  {
    id: "job-loss",
    label: "I lost my job",
    emoji: "📉",
    oneLiner: "Pause contributions · protect liquidity",
    convictionNote:
      "Life scenario, job loss: prioritize runway, pause new risk, and avoid selling core thesis holdings at panic prices unless cash is critical.",
    stressSummary:
      "Stress-test assumes 6+ months without salary: zero new contributions, higher need for cash and bonds, lower appetite for single-stock concentration.",
    profileOverlay: { monthlyContributionFactor: 0, riskDownshift: true },
    holdingsOverlay: { stockWeightFactor: 0.72, etfWeightFactor: 1.15, maxStocksDelta: -1 },
  },
  {
    id: "emergency-expense",
    label: "Emergency expense",
    emoji: "🚨",
    oneLiner: "One-time draw · refill fund first",
    convictionNote:
      "Life scenario, emergency expense: rebuild the emergency fund before adding thesis risk; keep conviction but shrink position sizes until cash buffer recovers.",
    stressSummary:
      "Models a sudden $15–30k draw: short-term funding need may force delaying DCA or trimming satellite positions, not abandoning the thesis.",
    profileOverlay: { hasEmergencyFund: false, monthlyContributionFactor: 0.5 },
    holdingsOverlay: { stockWeightFactor: 0.85, etfWeightFactor: 1.08, maxStocksDelta: 0 },
  },
  {
    id: "married",
    label: "I just got married",
    emoji: "💍",
    oneLiner: "Household goals · tax & beneficiary review",
    convictionNote:
      "Life scenario, marriage: align accounts, beneficiaries, and joint goals; thesis may shift toward diversification and shared timeline rather than max growth.",
    stressSummary:
      "Combining finances often means one conservative partner, test a slightly steadier book (more ETFs, fewer single-name bets) while keeping thematic conviction.",
    profileOverlay: { monthlyContributionFactor: 1.15 },
    holdingsOverlay: { stockWeightFactor: 0.92, etfWeightFactor: 1.1, maxStocksDelta: 0 },
  },
  {
    id: "new-child",
    label: "We're having a kid",
    emoji: "👶",
    oneLiner: "Higher burn · longer safety buffer",
    convictionNote:
      "Life scenario, new child: higher monthly burn and childcare costs; keep thesis exposure but widen margin of safety (cash + broad ETFs).",
    stressSummary:
      "Child-related costs reduce investable surplus for 2–3 years, stress-test with lower monthly savings and less room for drawdowns.",
    profileOverlay: { monthlyContributionFactor: 0.75, riskDownshift: true },
    holdingsOverlay: { stockWeightFactor: 0.8, etfWeightFactor: 1.12, maxStocksDelta: -1 },
  },
  {
    id: "home-purchase",
    label: "Buying a home soon",
    emoji: "🏠",
    oneLiner: "Down payment · don't raid thesis blindly",
    convictionNote:
      "Life scenario, home purchase: capital earmarked for down payment should not be in high-volatility thesis sleeves; separate 'house fund' from long-term book.",
    stressSummary:
      "Large near-term cash need: model book should not assume full net worth stays in growth assets until closing.",
    profileOverlay: { monthlyContributionFactor: 0.6 },
    holdingsOverlay: { stockWeightFactor: 0.78, etfWeightFactor: 1.1, maxStocksDelta: -1 },
  },
  {
    id: "promotion",
    label: "Raise or promotion",
    emoji: "📈",
    oneLiner: "More savings · stay disciplined",
    convictionNote:
      "Life scenario, promotion: higher savings rate can fund thesis DCA faster; avoid lifestyle creep that cancels the raise.",
    stressSummary:
      "Extra monthly surplus, test adding to core ETF weights before chasing more single-stock risk.",
    profileOverlay: { monthlyContributionFactor: 1.3 },
    holdingsOverlay: { stockWeightFactor: 1.05, etfWeightFactor: 1.02, maxStocksDelta: 1 },
  },
];

export function lifeScenarioById(id: LifeScenarioId): LifeScenarioPreset | undefined {
  return LIFE_SCENARIO_PRESETS.find((s) => s.id === id);
}
