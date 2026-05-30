import { STOCKS } from "@/data/stocks";
import { THEMES } from "@/data/themes";
import type { Stock, Theme, ThemeId, UserProfile } from "@/store/types";

type ThemeScore = { theme: Theme; score: number; reasons: string[] };

/**
 * Deterministic, rules-based theme generator.
 * Returns the user's top themes with a short personalized reason for each,
 * plus suggested starting picks within those themes.
 */
export function generateThemes(profile: UserProfile, count = 5): {
  themes: Theme[];
  scores: Record<ThemeId, ThemeScore>;
  reasons: Record<ThemeId, string[]>;
} {
  const scores: Record<string, ThemeScore> = {};
  for (const theme of THEMES) {
    scores[theme.id] = { theme, score: 0, reasons: [] };
  }

  const bump = (id: ThemeId, n: number, reason?: string) => {
    scores[id].score += n;
    if (reason) scores[id].reasons.push(reason);
  };

  // ---- Horizon shapes the entire portfolio ----
  switch (profile.horizon) {
    case "short":
      bump("cash-flow-defensives", 3, "Short horizon → defensives over growth");
      bump("income", 2);
      break;
    case "medium":
      bump("cash-flow-defensives", 2);
      bump("compounders", 2);
      bump("income", 1);
      break;
    case "long":
      bump("compounders", 3, "Long horizon → quality compounders");
      bump("ai-infrastructure", 2);
      bump("aging-demographics", 1);
      break;
    case "very-long":
      bump("compounders", 3, "15+ year horizon → maximize compounding");
      bump("ai-infrastructure", 3);
      bump("emerging-tech", 2);
      bump("biotech", 1);
      break;
  }

  // ---- Risk tolerance gates speculative themes ----
  switch (profile.risk) {
    case "very-low":
    case "low":
      bump("cash-flow-defensives", 3, "Lower risk → defensive bias");
      bump("income", 2);
      bump("consumer-staples", 1);
      bump("emerging-tech", -3);
      bump("biotech", -3);
      break;
    case "medium":
      bump("compounders", 1);
      break;
    case "high":
      bump("emerging-tech", 2);
      bump("ai-infrastructure", 1);
      bump("biotech", 1);
      break;
    case "very-high":
      bump("emerging-tech", 3, "High risk tolerance → speculative themes");
      bump("biotech", 2);
      bump("ai-infrastructure", 1);
      break;
  }

  // ---- Income need ----
  if (profile.incomeNeed === "primary") {
    bump("income", 4, "Primary need is income");
    bump("cash-flow-defensives", 2);
  } else if (profile.incomeNeed === "some") {
    bump("income", 2);
  }

  // ---- Primary goal ----
  switch (profile.primaryGoal) {
    case "retirement":
      bump("compounders", 2);
      bump("cash-flow-defensives", 1);
      break;
    case "income":
      bump("income", 3);
      break;
    case "house":
      bump("cash-flow-defensives", 2);
      bump("income", 1);
      break;
    case "wealth":
      bump("compounders", 2);
      bump("ai-infrastructure", 1);
      break;
    case "exploration":
      bump("emerging-tech", 1);
      bump("biotech", 1);
      break;
  }

  // ---- Interests are direct theme bumps ----
  for (const interest of profile.interests) {
    switch (interest) {
      case "climate":
        bump("clean-energy", 4, "You picked clean energy as an interest");
        break;
      case "ai":
        bump("ai-infrastructure", 4, "You picked AI as an interest");
        bump("emerging-tech", 1);
        break;
      case "aging":
        bump("aging-demographics", 4, "You picked aging demographics");
        break;
      case "biotech":
        bump("biotech", 4, "You picked biotech");
        break;
      case "consumer-brands":
        bump("consumer-staples", 3);
        break;
      case "international":
        bump("global-diversification", 4, "You want international exposure");
        break;
      case "cybersecurity":
        bump("cybersecurity", 4, "You picked cybersecurity");
        break;
      case "small-companies":
        bump("emerging-tech", 2);
        bump("biotech", 1);
        break;
      case "real-assets":
        bump("income", 2);
        break;
      case "crypto":
        bump("fintech", 2);
        bump("emerging-tech", 2);
        break;
    }
  }

  // ---- Concerns shape hedges ----
  if (profile.concerns.includes("inflation")) {
    bump("income", 1, "Inflation worry → real-cash-flow businesses");
    bump("consumer-staples", 1);
  }
  if (profile.concerns.includes("recession") || profile.concerns.includes("market-crash")) {
    bump("cash-flow-defensives", 2);
    bump("income", 1);
  }
  if (profile.concerns.includes("geopolitical")) {
    bump("global-diversification", 1);
  }
  if (profile.concerns.includes("missing-out")) {
    bump("ai-infrastructure", 1);
    bump("emerging-tech", 1);
  }

  // ---- Reaction to drawdown is the truth-teller ----
  if (profile.reactionToDrawdown === "panic-sell") {
    bump("emerging-tech", -3);
    bump("biotech", -3);
    bump("cash-flow-defensives", 2, "You'd panic-sell in a drawdown → defensives");
  } else if (profile.reactionToDrawdown === "buy-more") {
    bump("emerging-tech", 1);
    bump("compounders", 1);
  }

  const sorted = Object.values(scores).sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, count);

  const reasons: Record<string, string[]> = {};
  for (const s of sorted) reasons[s.theme.id] = s.reasons;

  return {
    themes: top.map((t) => t.theme),
    scores: scores as Record<ThemeId, ThemeScore>,
    reasons: reasons as Record<ThemeId, string[]>,
  };
}

/**
 * Rank stocks within a given theme for a given profile.
 * Lighter scoring than theme selection — just tilts the order.
 */
export function rankStocksForTheme(
  themeId: ThemeId,
  profile: UserProfile,
  limit = 12
): Stock[] {
  const inTheme = STOCKS.filter((s) => s.themes.includes(themeId));

  const scoreStock = (s: Stock): number => {
    let score = 0;

    // Risk: down-rate high vol for low-risk users
    if (profile.risk === "very-low" || profile.risk === "low") {
      if (s.volatility === "high") score -= 3;
      if (s.tags.includes("speculative")) score -= 3;
      if (s.tags.includes("blue-chip")) score += 2;
      if (s.tags.includes("dividend")) score += 1;
    }
    if (profile.risk === "very-high" || profile.risk === "high") {
      if (s.volatility === "high") score += 1;
      if (s.tags.includes("growth")) score += 1;
    }

    // Income need
    if (profile.incomeNeed === "primary" && s.divYield >= 2.5) score += 3;
    if (profile.incomeNeed === "some" && s.divYield >= 1.5) score += 1;

    // Values screens
    if (profile.values.includes("avoid-fossil") && s.sector === "Energy") score -= 5;
    if (profile.values.includes("esg") && s.tags.includes("esg")) score += 2;
    if (profile.values.includes("made-in-america") && s.tags.includes("international"))
      score -= 2;

    // Horizon
    if (profile.horizon === "very-long" && s.tags.includes("growth")) score += 1;
    if (profile.horizon === "short" && s.tags.includes("blue-chip")) score += 1;

    return score;
  };

  return [...inTheme]
    .sort((a, b) => scoreStock(b) - scoreStock(a))
    .slice(0, limit);
}
