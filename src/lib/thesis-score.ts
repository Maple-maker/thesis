import type { Stock, ThemeId, UserProfile } from "@/store/types";
import { financialsForSymbol, type StockFinancials } from "@/data/stock-financials";

export type ThesisScoreCategory =
  | "alignment"
  | "risk-fit"
  | "horizon-fit"
  | "income-fit"
  | "value-fit"
  | "moat-quality"
  | "growth-tilt";

export type CategoryBreakdown = {
  category: ThesisScoreCategory;
  label: string;
  score: number;
  reason: string;
  tone: "pos" | "amber" | "neg";
};

export type ThesisScoreResult = {
  overall: number;
  breakdown: CategoryBreakdown[];
  topReason: string;
  topRisk: string;
  dataPoints: string[];
};

// ─────────────────────────────────────────────────────────────────────────────

export function scoreThesis(
  stock: Stock,
  profile: UserProfile,
  userThemeIds: ThemeId[]
): ThesisScoreResult {
  const fin = financialsForSymbol(stock.symbol);

  const breakdown: CategoryBreakdown[] = [
    scoreAlignment(stock, profile, userThemeIds),
    scoreRiskFit(stock, profile, fin),
    scoreHorizonFit(stock, profile, fin),
    scoreIncomeFit(stock, profile, fin),
    scoreValueFit(stock, profile),
    scoreMoatQuality(stock, fin),
    scoreGrowthTilt(stock, profile, fin),
  ];

  const WEIGHTS: Record<ThesisScoreCategory, number> = {
    alignment: 0.30,
    "risk-fit": 0.20,
    "horizon-fit": 0.15,
    "income-fit": 0.10,
    "value-fit": 0.10,
    "moat-quality": 0.10,
    "growth-tilt": 0.05,
  };

  let overall = 0;
  for (const b of breakdown) {
    overall += b.score * WEIGHTS[b.category];
  }
  overall = Math.round(overall);

  // Top reason = highest-scoring pos or amber category
  const reasons = breakdown.filter((b) => b.tone !== "neg" && b.score >= 50);
  const topReason = reasons.length > 0
    ? reasons.sort((a, b) => b.score - a.score)[0].reason
    : "Limited alignment with your current thesis frame";

  // Top risk = lowest-scoring category
  const risks = breakdown.filter((b) => b.tone !== "pos");
  const topRisk = risks.length > 0
    ? risks.sort((a, b) => a.score - b.score)[0].reason
    : "";

  // Data points
  const dataPoints: string[] = [];
  if (fin) {
    if (fin.revenueGrowthYoY > 0.05)
      dataPoints.push(`Revenue growth: ${(fin.revenueGrowthYoY * 100).toFixed(0)}% YoY`);
    else if (fin.revenueGrowthYoY < 0)
      dataPoints.push(`Revenue: ${(fin.revenueGrowthYoY * 100).toFixed(0)}% YoY`);
    if (fin.netMargin > 0)
      dataPoints.push(`Net margin: ${(fin.netMargin * 100).toFixed(0)}%`);
    if (fin.beta)
      dataPoints.push(`Beta: ${fin.beta.toFixed(2)}`);
    if (stock.divYield > 1)
      dataPoints.push(`Div yield: ${stock.divYield.toFixed(1)}%`);
  } else {
    if (stock.peRatio) dataPoints.push(`P/E: ${stock.peRatio}`);
    dataPoints.push(`Volatility: ${stock.volatility}`);
  }

  return { overall, breakdown, topReason, topRisk, dataPoints };
}

// ─────────────────────────────────────────────────────────────────────────────
// Category scorers
// ─────────────────────────────────────────────────────────────────────────────

function toneForScore(s: number): "pos" | "amber" | "neg" {
  if (s >= 70) return "pos";
  if (s >= 45) return "amber";
  return "neg";
}

function scoreAlignment(
  stock: Stock,
  profile: UserProfile,
  userThemeIds: ThemeId[]
): CategoryBreakdown {
  const stockThemeIds = stock.themes;

  // Overlap with user's assigned themes
  const matchCount = stockThemeIds.filter((tid) => userThemeIds.includes(tid)).length;
  const themeRatio = stockThemeIds.length > 0 ? matchCount / stockThemeIds.length : 0;

  // Overlap with user's interests
  const interestThemeMap: Record<string, ThemeId[]> = {
    climate: ["clean-energy"],
    ai: ["ai-infrastructure", "emerging-tech"],
    aging: ["aging-demographics"],
    biotech: ["biotech"],
    "consumer-brands": ["consumer-staples"],
    international: ["global-diversification"],
    cybersecurity: ["cybersecurity"],
    "small-companies": ["emerging-tech"],
    crypto: ["fintech"],
  };
  const relevantInterests = profile.interests.flatMap((i) => interestThemeMap[i] ?? []);
  const interestOverlap = stockThemeIds.filter((tid) => relevantInterests.includes(tid)).length;
  const interestRatio = stockThemeIds.length > 0 ? interestOverlap / stockThemeIds.length : 0;

  const raw = themeRatio * 70 + interestRatio * 30;
  const score = Math.min(100, Math.round(raw));

  let reason: string;
  if (matchCount >= 2) {
    reason = "Aligns with multiple themes in your thesis";
  } else if (matchCount === 1) {
    const matchName = stockThemeIds.find((tid) => userThemeIds.includes(tid));
    reason = `Fits your "${matchName?.replace("-", " ")}" theme`;
  } else if (interestOverlap > 0) {
    reason = "Matches interests you selected";
  } else {
    reason = "Limited overlap with your thesis themes";
  }

  return { category: "alignment", label: "Theme alignment", score, reason, tone: toneForScore(score) };
}

function scoreRiskFit(
  stock: Stock,
  profile: UserProfile,
  fin: StockFinancials | undefined
): CategoryBreakdown {
  const volMap: Record<string, number> = { low: 20, med: 55, high: 85 };
  const stockVol = volMap[stock.volatility] ?? 50;
  const betaVal = fin?.beta ?? (stockVol / 100) * 2 + 0.5;

  const riskMap: Record<string, number> = {
    "very-low": 10, low: 25, medium: 55, high: 75, "very-high": 90,
  };
  const userRisk = riskMap[profile.risk] ?? 50;

  const gap = Math.abs(stockVol - userRisk);
  let score = Math.round(Math.max(0, 100 - gap * 1.3));

  // Drawdown behavior adjustment
  if (profile.reactionToDrawdown === "panic-sell" && stockVol > 60) {
    score = Math.round(score * 0.6);
  }
  if (profile.reactionToDrawdown === "buy-more" && stockVol > 60) {
    score = Math.round(Math.min(100, score * 1.1));
  }

  let reason: string;
  if (score >= 70) {
    reason = "Volatility matches your risk tolerance";
  } else if (profile.risk === "very-low" || profile.risk === "low") {
    reason = `This stock is ${stock.volatility}-volatility, above your stated comfort zone`;
  } else {
    reason = `${stock.volatility} volatility may be ${stockVol > userRisk ? "above" : "below"} your comfort level`;
  }

  return { category: "risk-fit", label: "Risk fit", score, reason, tone: toneForScore(score) };
}

function scoreHorizonFit(
  stock: Stock,
  profile: UserProfile,
  fin: StockFinancials | undefined
): CategoryBreakdown {
  const hasGrowth = stock.tags.includes("growth");
  const hasValue = stock.tags.includes("value");
  const isBlueChip = stock.tags.includes("blue-chip");

  const horizonScores: Record<string, { growth: number; value: number; blueChip: number }> = {
    short: { growth: 30, value: 60, blueChip: 85 },
    medium: { growth: 60, value: 70, blueChip: 80 },
    long: { growth: 80, value: 60, blueChip: 70 },
    "very-long": { growth: 95, value: 40, blueChip: 60 },
  };

  const prefs = horizonScores[profile.horizon] ?? { growth: 50, value: 50, blueChip: 50 };
  let score = 50;

  if (hasGrowth) score = prefs.growth;
  else if (hasValue) score = prefs.value;
  else if (isBlueChip) score = prefs.blueChip;

  // Earnings growth bonus for long-horizon users
  if (fin && (profile.horizon === "long" || profile.horizon === "very-long")) {
    if (fin.earningsGrowth3yCAGR > 0.15) score = Math.min(100, score + 10);
  }

  let reason: string;
  if (score >= 70) {
    reason = "Growth profile matches your time horizon";
  } else if (profile.horizon === "short") {
    reason = "Better suited for longer holding periods";
  } else {
    reason = `Moderate fit for a ${profile.horizon.replace("-", " ")} horizon`;
  }

  return { category: "horizon-fit", label: "Horizon fit", score, reason, tone: toneForScore(score) };
}

function scoreIncomeFit(
  stock: Stock,
  profile: UserProfile,
  fin: StockFinancials | undefined
): CategoryBreakdown {
  const fcf = fin?.fcfYield ?? 0;
  const hasDividend = stock.divYield > 0;
  const totalYield = stock.divYield + fcf * 100;

  let score: number;
  switch (profile.incomeNeed) {
    case "primary":
      score = totalYield >= 3 ? 90 : totalYield >= 1.5 ? 65 : 25;
      break;
    case "some":
      score = totalYield >= 2 ? 75 : totalYield >= 0.5 ? 55 : 40;
      break;
    case "none":
      score = totalYield < 1 ? 80 : totalYield < 3 ? 50 : 25;
      break;
    default:
      score = 50;
  }

  let reason: string;
  if (score >= 70) {
    reason = hasDividend
      ? "Dividend yield aligns with your income needs"
      : "Reinvestment profile fits a growth-focused portfolio";
  } else if (profile.incomeNeed === "primary") {
    reason = `Low yield (${stock.divYield.toFixed(1)}%) for a primary income need`;
  } else {
    reason = "Moderate income alignment with your stated needs";
  }

  return { category: "income-fit", label: "Income fit", score, reason, tone: toneForScore(score) };
}

function scoreValueFit(stock: Stock, profile: UserProfile): CategoryBreakdown {
  if (profile.values.length === 0 || profile.values.includes("no-preference")) {
    return {
      category: "value-fit",
      label: "Value alignment",
      score: 50,
      reason: "No values preferences set",
      tone: "amber",
    };
  }

  let score = 85; // start high, deduct for conflicts

  if (profile.values.includes("avoid-fossil") && stock.sector === "Energy") {
    score -= 50;
  }
  if (profile.values.includes("avoid-tobacco-weapons")) {
    // Check sector and tags for tobacco/weapons exposure
    // No current sector/tag tracking this, so skip for now
  }
  if (profile.values.includes("esg") && !stock.tags.includes("esg")) {
    score -= 15;
  }
  if (profile.values.includes("esg") && stock.tags.includes("esg")) {
    score += 5;
  }
  if (profile.values.includes("made-in-america") && stock.tags.includes("international")) {
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));

  let reason: string;
  if (score >= 80) reason = "Aligns with your stated values";
  else if (score >= 40) reason = "No major values conflicts";
  else reason = "Conflicts with your stated values preferences";

  return { category: "value-fit", label: "Value alignment", score, reason, tone: toneForScore(score) };
}

function scoreMoatQuality(
  stock: Stock,
  fin: StockFinancials | undefined
): CategoryBreakdown {
  let score = 40; // base

  if (stock.tags.includes("moat")) score += 25;
  if (stock.tags.includes("blue-chip")) score += 10;

  if (fin) {
    if (fin.grossMargin > 0.60) score += 10;
    else if (fin.grossMargin > 0.40) score += 5;

    if (fin.operatingMargin > 0.25) score += 10;
    else if (fin.operatingMargin > 0.15) score += 5;
    else if (fin.operatingMargin < 0) score -= 10;

    if (fin.netMargin > 0.20) score += 5;
    if (fin.debtToEquity !== null && fin.debtToEquity < 0.5) score += 5;
    if (fin.debtToEquity !== null && fin.debtToEquity > 3) score -= 10;
  }

  score = Math.max(0, Math.min(100, score));

  let reason: string;
  if (score >= 70) reason = "Strong business quality and margins";
  else if (score >= 45) reason = "Moderate business quality indicators";
  else reason = "Lower quality signals, check fundamentals closely";

  return { category: "moat-quality", label: "Business quality", score, reason, tone: toneForScore(score) };
}

function scoreGrowthTilt(
  stock: Stock,
  profile: UserProfile,
  fin: StockFinancials | undefined
): CategoryBreakdown {
  let score = 50;

  const hasGrowth = stock.tags.includes("growth");
  const longHorizon = profile.horizon === "long" || profile.horizon === "very-long";
  const wantsGrowth = longHorizon || profile.concerns.includes("missing-out");
  const lowRisk = profile.risk === "very-low" || profile.risk === "low";

  if (hasGrowth && wantsGrowth) score += 25;
  if (hasGrowth && lowRisk) score -= 15;

  // Real growth data
  if (fin) {
    if (fin.revenueGrowthYoY > 0.20 && wantsGrowth) score += 15;
    if (fin.revenueGrowthYoY > 0.20 && !wantsGrowth) score -= 5;
    if (fin.revenueGrowthYoY < 0) score -= 20;
    if (fin.earningsGrowthYoY > 0.25 && wantsGrowth) score += 10;
  }

  score = Math.max(0, Math.min(100, score));

  let reason: string;
  if (score >= 70) reason = "Strong growth profile matches your tilt";
  else if (score >= 45) reason = "Moderate growth alignment";
  else reason = "Growth profile does not match your preferences";

  return { category: "growth-tilt", label: "Growth tilt", score, reason, tone: toneForScore(score) };
}
