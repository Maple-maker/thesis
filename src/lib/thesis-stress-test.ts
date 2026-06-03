import type { ThemeId, UserProfile } from "@/store/types";
import type { LensHolding } from "@/data/investor-lenses";
import type { ModelThesis } from "@/store";

// ── Types ──────────────────────────────────────────────────────────────────

export type StressScenario = {
  id: string;
  label: string;
  description: string;
  severity: "low" | "medium" | "high";
};

export type ScenarioImpact = {
  scenario: StressScenario;
  convictionImpact: number;    // points conviction drops (positive = drop)
  specificRisks: string[];
  mitigationIdeas: string[];
};

export type StressTestResult = {
  id: string;
  modelName: string;
  symbol: string;
  scenarios: ScenarioImpact[];
  overallResilience: number;   // 0–100, higher = more resilient
  resilienceLabel: "Resilient" | "Stable" | "Vulnerable" | "Fragile";
  runAt: number;
};

// ── Scenarios ──────────────────────────────────────────────────────────────

export const STRESS_SCENARIOS: StressScenario[] = [
  {
    id: "margin-compression",
    label: "Margin compression",
    description: "Input costs rise or pricing power erodes, squeezing profitability.",
    severity: "medium",
  },
  {
    id: "competitive-threat",
    label: "Competitive disruption",
    description: "A new entrant or existing competitor takes meaningful market share.",
    severity: "high",
  },
  {
    id: "rate-hike",
    label: "Interest rate shock",
    description: "Rates rise 200bps, compressing valuations and raising cost of capital.",
    severity: "high",
  },
  {
    id: "growth-slowdown",
    label: "Growth slowdown",
    description: "Revenue growth decelerates sharply, resetting valuation multiples.",
    severity: "medium",
  },
  {
    id: "regulatory-risk",
    label: "Regulatory crackdown",
    description: "New regulation or antitrust action targets the sector or business model.",
    severity: "high",
  },
];

// ── Impact estimation (client-side, illustrative) ──────────────────────────

function estimateConvictionImpact(
  scenario: StressScenario,
  holding: LensHolding,
  _profile: UserProfile,
  _themeIds: ThemeId[],
): { convictionImpact: number; specificRisks: string[]; mitigationIdeas: string[] } {
  // Illustrative scoring based on holding characteristics
  // In production, this would use the debate engine for real analysis
  const symbol = holding.symbol;

  const impacts: Record<string, { impact: number; risks: string[]; mitigations: string[] }> = {
    "margin-compression": {
      impact: 8 + Math.floor(Math.random() * 10),
      risks: [
        `${symbol} gross margin could contract 200-400bps`,
        "Input cost inflation outpacing pricing power",
        "Competitive pressure on pricing",
      ],
      mitigations: [
        "Check latest earnings call for margin guidance",
        "Compare margins vs industry peers",
        "Assess pricing power from brand strength",
      ],
    },
    "competitive-threat": {
      impact: 10 + Math.floor(Math.random() * 12),
      risks: [
        `New entrant targeting ${symbol}'s core market`,
        "Incumbent accelerating innovation cycle",
        "Market share erosion in key segment",
      ],
      mitigations: [
        "Review competitive moat and switching costs",
        "Track patent filings and R&D spend trends",
        "Monitor customer retention metrics",
      ],
    },
    "rate-hike": {
      impact: 6 + Math.floor(Math.random() * 10),
      risks: [
        `${symbol} DCF valuation compresses under higher discount rate`,
        "Growth stocks disproportionately affected",
        "Debt servicing costs increase",
      ],
      mitigations: [
        "Check debt-to-equity ratio and maturity schedule",
        "Prefer companies with pricing power in rate cycles",
        "Consider duration of equity cash flows",
      ],
    },
    "growth-slowdown": {
      impact: 8 + Math.floor(Math.random() * 8),
      risks: [
        `${symbol} revenue growth decelerates below consensus`,
        "Multiple compression as growth premium evaporates",
        "Management lowers forward guidance",
      ],
      mitigations: [
        "Check revenue growth trajectory (3yr CAGR)",
        "Assess TAM penetration and runway",
        "Watch for insider selling ahead of slowdown",
      ],
    },
    "regulatory-risk": {
      impact: 12 + Math.floor(Math.random() * 14),
      risks: [
        `New regulation directly impacts ${symbol}'s business model`,
        "Compliance costs escalate",
        "Potential forced restructuring or divestiture",
      ],
      mitigations: [
        "Review regulatory filings and lobbying spend",
        "Assess geographic revenue diversification",
        "Scenario analysis: best/worst regulatory outcomes",
      ],
    },
  };

  const imp = impacts[scenario.id] ?? impacts["growth-slowdown"];
  return {
    convictionImpact: imp.impact,
    specificRisks: imp.risks,
    mitigationIdeas: imp.mitigations,
  };
}

// ── Main stress test function ──────────────────────────────────────────────

export function runThesisStressTest(
  modelThesis: ModelThesis,
  symbol: string,
  profile: UserProfile,
  themeIds: ThemeId[],
  selectedScenarios?: string[],
): StressTestResult {
  const scenarios = STRESS_SCENARIOS.filter(
    (s) => !selectedScenarios || selectedScenarios.includes(s.id)
  );

  const holding = modelThesis.holdings.find((h) => h.symbol === symbol);
  if (!holding) {
    // Fallback: create minimal holding for the symbol
    const fallback: LensHolding = { symbol, weightPct: 0, kind: "stock" };
    return buildResult(modelThesis.name, symbol, scenarios, fallback, profile, themeIds);
  }

  return buildResult(modelThesis.name, symbol, scenarios, holding, profile, themeIds);
}

function buildResult(
  modelName: string,
  symbol: string,
  scenarios: StressScenario[],
  holding: LensHolding,
  profile: UserProfile,
  themeIds: ThemeId[],
): StressTestResult {
  const impacts: ScenarioImpact[] = scenarios.map((scenario) => {
    const estimated = estimateConvictionImpact(scenario, holding, profile, themeIds);
    return {
      scenario,
      convictionImpact: Math.min(100, estimated.convictionImpact),
      specificRisks: estimated.specificRisks,
      mitigationIdeas: estimated.mitigationIdeas,
    };
  });

  // Overall resilience: 100 minus average impact, bounded
  const avgImpact = impacts.reduce((sum, i) => sum + i.convictionImpact, 0) / (impacts.length || 1);
  const overallResilience = Math.max(0, Math.min(100, Math.round(100 - avgImpact)));

  let resilienceLabel: StressTestResult["resilienceLabel"] = "Fragile";
  if (overallResilience >= 75) resilienceLabel = "Resilient";
  else if (overallResilience >= 50) resilienceLabel = "Stable";
  else if (overallResilience >= 25) resilienceLabel = "Vulnerable";

  return {
    id: `stress-${symbol}-${Date.now()}`,
    modelName,
    symbol,
    scenarios: impacts,
    overallResilience,
    resilienceLabel,
    runAt: Date.now(),
  };
}

export function stressTestMultipleSymbols(
  modelThesis: ModelThesis,
  symbols: string[],
  profile: UserProfile,
  themeIds: ThemeId[],
): StressTestResult[] {
  return symbols.map((sym) => runThesisStressTest(modelThesis, sym, profile, themeIds));
}
