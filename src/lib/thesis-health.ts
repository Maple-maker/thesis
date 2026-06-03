import { financialsForSymbol } from "@/data/stock-financials";
import { insightForSymbol } from "@/data/context-insights";
import { scoreThesis } from "@/lib/thesis-score";
import { stockBySymbol } from "@/data/stocks";
import { etfBySymbol } from "@/data/etfs";
import { computeEtfConviction } from "@/lib/conviction-rank";
import type { ThemeId, UserProfile } from "@/store/types";
import type { Holding } from "@/types/linked-accounts";
import type { ModelThesis } from "@/store";

// ── Types ─────────────────────────────────────────────────────────────────

export type HealthStatus = "green" | "yellow" | "red";

export interface HoldingHealth {
  symbol: string;
  name: string;
  status: HealthStatus;
  convictionScore: number;
  triggers: string[];
  lastChecked: number;
  hasBrief: boolean;
}

export interface PortfolioHealthSummary {
  greenCount: number;
  yellowCount: number;
  redCount: number;
  total: number;
}

// ── Mock market / earnings events for demo tickers ───────────────────────
// Simple hardcoded events that demonstrate health triggers

type MockEvent = {
  type: "positive" | "negative" | "mixed";
  label: string;
};

const MOCK_EVENTS: Record<string, MockEvent> = {
  AAPL: {
    type: "mixed",
    label: "Earnings mixed — services strong but China sales declining 8% YoY",
  },
  NVDA: {
    type: "positive",
    label: "Revenue surged 114% YoY on AI GPU demand, Blackwell ramp ahead",
  },
  MSFT: {
    type: "mixed",
    label: "Azure growth decelerating slightly, AI Copilot adoption ramping",
  },
  ENPH: {
    type: "negative",
    label: "Earnings miss by 12%, residential solar demand pulling back",
  },
  CRWD: {
    type: "positive",
    label: "Net-new enterprise logos up 28%, platform expansion strong",
  },
  PLTR: {
    type: "positive",
    label: "Government AI contracts accelerating, AIP boot camps converting",
  },
  SOFI: {
    type: "positive",
    label: "Member growth 45% YoY, approaching GAAP profitability",
  },
  RKLB: {
    type: "negative",
    label: "Operating losses widening, space launch segment competitive",
  },
  LLY: {
    type: "positive",
    label: "GLP-1 demand surging, Zepbound label expanding to new indications",
  },
  TSM: {
    type: "mixed",
    label: "AI chip demand robust but geopolitical / Taiwan risk persists",
  },
  META: {
    type: "positive",
    label: "Revenue accelerating, AI-driven ad targeting lifting engagement",
  },
  AMZN: {
    type: "mixed",
    label: "AWS growth stabilizing, retail margin improvement on cost cuts",
  },
  GOOGL: {
    type: "mixed",
    label: "Cloud division growing 28%, search revenue facing AI competition",
  },
};

// ── Score helpers ─────────────────────────────────────────────────────────

function scoreForHolding(
  symbol: string,
  profile: UserProfile,
  themeIds: ThemeId[],
): number {
  const stock = stockBySymbol(symbol);
  if (stock) {
    return scoreThesis(stock, profile, themeIds).overall;
  }
  const etf = etfBySymbol(symbol);
  if (etf) {
    return computeEtfConviction(etf, profile, themeIds);
  }
  return 50; // unknown asset → neutral
}

function checkPriceDeviation(
  symbol: string,
  currentPrice: number,
): { deviation: number; pct: number } | null {
  const fin = financialsForSymbol(symbol);
  if (!fin || !fin.analystTarget) return null;
  // analystTarget = targetPrice / currentPrice (ratio, e.g. 1.12 = 12% above)
  const targetPrice = currentPrice * fin.analystTarget;
  const deviation = (currentPrice - targetPrice) / targetPrice;
  return { deviation, pct: Math.round(Math.abs(deviation) * 100) };
}

function generateTriggers(
  symbol: string,
  mockEvent: MockEvent | undefined,
  priceDeviation: { deviation: number; pct: number } | null,
): string[] {
  const triggers: string[] = [];

  // Market / earnings event trigger
  if (mockEvent) {
    triggers.push(mockEvent.label);
  }

  // Price deviation trigger
  if (priceDeviation) {
    const above = priceDeviation.deviation > 0;
    if (priceDeviation.pct >= 10) {
      const dir = above ? "above" : "below";
      triggers.push(`Price ${priceDeviation.pct}% ${dir} thesis target`);
    }
  }

  // Financials-based triggers
  const fin = financialsForSymbol(symbol);
  if (fin) {
    if (fin.earningsGrowthYoY < -0.1) {
      triggers.push(
        `Earnings declining ${(Math.abs(fin.earningsGrowthYoY) * 100).toFixed(0)}% YoY`,
      );
    }
    if (fin.revenueGrowthYoY < -0.05) {
      triggers.push(
        `Revenue contracting ${(Math.abs(fin.revenueGrowthYoY) * 100).toFixed(0)}% YoY`,
      );
    }
    if (fin.operatingMargin < 0) {
      triggers.push(
        `Not yet profitable (op. margin: ${(fin.operatingMargin * 100).toFixed(0)}%)`,
      );
    }
  }

  if (triggers.length === 0) {
    triggers.push("No recent catalysts identified");
  }

  return triggers;
}

// ── Main public API ──────────────────────────────────────────────────────

/**
 * Compute health status for a single portfolio holding.
 *
 * Rules:
 *   Green  – conviction >= 70, no negative catalysts, price within 10% of target
 *   Yellow – conviction 40–69, or mixed earnings, or price 10–20% off
 *   Red    – conviction < 40, or negative earnings surprise, or price > 20% off
 */
export function computeHoldingHealth(
  holding: Holding,
  profile: UserProfile,
  themeIds: ThemeId[],
  _modelThesis: ModelThesis | null,
): HoldingHealth {
  const convictionScore = scoreForHolding(holding.symbol, profile, themeIds);
  const mockEvent = MOCK_EVENTS[holding.symbol];
  const priceDeviation = checkPriceDeviation(holding.symbol, holding.price);
  const hasBrief = !!insightForSymbol(holding.symbol);

  const triggers = generateTriggers(holding.symbol, mockEvent, priceDeviation);

  // Colour-rules
  const isNegativeEvent = mockEvent?.type === "negative";
  const isMixedEvent = mockEvent?.type === "mixed";
  const absDev = Math.abs(priceDeviation?.deviation ?? 0);
  const isSignificantDeviation = absDev > 0.2;
  const isModerateDeviation = absDev > 0.1;

  let status: HealthStatus;
  if (
    convictionScore >= 70 &&
    !isNegativeEvent &&
    !isMixedEvent &&
    !isSignificantDeviation &&
    !isModerateDeviation
  ) {
    status = "green";
  } else if (convictionScore < 40 || isNegativeEvent || isSignificantDeviation) {
    status = "red";
  } else {
    status = "yellow";
  }

  return {
    symbol: holding.symbol,
    name: holding.name,
    status,
    convictionScore,
    triggers,
    lastChecked: Date.now(),
    hasBrief,
  };
}

/** Return human-readable trigger reasons for a holding. */
export function getHealthTriggers(health: HoldingHealth): string[] {
  return health.triggers;
}

/** Aggregate health counts across portfolio holdings. */
export function getPortfolioHealthSummary(
  healthData: HoldingHealth[],
): PortfolioHealthSummary {
  return {
    greenCount: healthData.filter((h) => h.status === "green").length,
    yellowCount: healthData.filter((h) => h.status === "yellow").length,
    redCount: healthData.filter((h) => h.status === "red").length,
    total: healthData.length,
  };
}

/** Determine which holdings have context insights (event briefs). */
export function holdingsWithBriefs(healthData: HoldingHealth[]): HoldingHealth[] {
  return healthData.filter((h) => h.hasBrief);
}
