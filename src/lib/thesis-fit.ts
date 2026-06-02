import { stockBySymbol } from "@/data/stocks";
import { themeById } from "@/data/themes";
import type { ETF, Stock, ThemeId, UserProfile } from "@/store/types";
import type { CategoryBreakdown } from "@/lib/thesis-score";
import { scoreThesis } from "@/lib/thesis-score";

export type ThesisFitAssetInput = {
  kind: "stock" | "etf" | "portfolio";
  themes: ThemeId[];
  stock?: Stock;
  etf?: ETF;
};

export type ThesisFitResult = {
  score: number; // 0–100
  label: "Strong" | "Moderate" | "Weak" | "Mismatch";
  reasons: string[];
  matchedThemes: ThemeId[];
  /** Present when scored via full thesis engine (stocks / ETF holdings). */
  breakdown?: CategoryBreakdown[];
  source: "full" | "themes";
};

function labelForScore(score: number): ThesisFitResult["label"] {
  if (score >= 70) return "Strong";
  if (score >= 45) return "Moderate";
  if (score >= 25) return "Weak";
  return "Mismatch";
}

export function thesisFitForThemes(
  assetThemes: ThemeId[],
  userThemeIds: ThemeId[],
  profile?: UserProfile
): ThesisFitResult {
  const matched = assetThemes.filter((t) => userThemeIds.includes(t));
  let score = matched.length * 22;
  const reasons: string[] = [];

  for (const id of matched) {
    const t = themeById(id);
    if (t) reasons.push(`Aligns with ${t.title}`);
  }

  if (profile) {
    if (profile.incomeNeed === "primary" && assetThemes.includes("income")) {
      score += 12;
      reasons.push("Matches income need from your profile");
    }
    if (
      (profile.risk === "low" || profile.risk === "very-low") &&
      assetThemes.includes("cash-flow-defensives")
    ) {
      score += 8;
    }
    if (
      (profile.risk === "high" || profile.risk === "very-high") &&
      (assetThemes.includes("ai-infrastructure") || assetThemes.includes("emerging-tech"))
    ) {
      score += 8;
    }
  }

  score = Math.min(100, score);

  if (!reasons.length) {
    reasons.push(
      "Little overlap with your matched Thesis themes, still may be useful as a satellite"
    );
  }

  return {
    score,
    label: labelForScore(score),
    reasons: reasons.slice(0, 4),
    matchedThemes: matched,
    source: "themes",
  };
}

export function thesisFitForStock(
  stock: Stock,
  profile: UserProfile,
  userThemeIds: ThemeId[]
): ThesisFitResult {
  const result = scoreThesis(stock, profile, userThemeIds);
  const matched = stock.themes.filter((t) => userThemeIds.includes(t));
  const reasons = [
    result.topReason,
    ...result.breakdown
      .filter((b) => b.tone === "pos" && b.score >= 60)
      .slice(0, 2)
      .map((b) => b.reason),
  ].filter(Boolean);

  return {
    score: result.overall,
    label: labelForScore(result.overall),
    reasons: reasons.slice(0, 4),
    matchedThemes: matched,
    breakdown: result.breakdown,
    source: "full",
  };
}

export function thesisFitForEtf(
  etf: ETF,
  profile: UserProfile,
  userThemeIds: ThemeId[]
): ThesisFitResult {
  const base = thesisFitForThemes(etf.themes, userThemeIds, profile);
  const holdingScores: number[] = [];
  const breakdowns: CategoryBreakdown[] = [];

  for (const sym of etf.holdings.slice(0, 5)) {
    const stock = stockBySymbol(sym);
    if (!stock) continue;
    const scr = scoreThesis(stock, profile, userThemeIds);
    holdingScores.push(scr.overall);
    if (breakdowns.length === 0) breakdowns.push(...scr.breakdown);
  }

  if (holdingScores.length === 0) {
    if (etf.expense <= 0.15) {
      return {
        ...base,
        score: Math.min(100, base.score + 5),
        reasons: [...base.reasons, "Low expense vs category"],
        source: "themes",
      };
    }
    return base;
  }

  const avgHoldings = Math.round(
    holdingScores.reduce((a, b) => a + b, 0) / holdingScores.length
  );
  const score = Math.min(100, Math.round(base.score * 0.35 + avgHoldings * 0.65));
  const reasons = [
    ...base.reasons.slice(0, 2),
    `Top holdings avg ${avgHoldings}/100 thesis match`,
  ];

  return {
    score,
    label: labelForScore(score),
    reasons: reasons.slice(0, 4),
    matchedThemes: base.matchedThemes,
    breakdown: breakdowns,
    source: "full",
  };
}

/** Single entry point, same scoring logic as Builder "Does this fit?" */
export function thesisFitForAsset(
  asset: ThesisFitAssetInput,
  profile: UserProfile,
  userThemeIds: ThemeId[]
): ThesisFitResult {
  if (asset.kind === "stock" && asset.stock) {
    return thesisFitForStock(asset.stock, profile, userThemeIds);
  }
  if (asset.kind === "etf" && asset.etf) {
    return thesisFitForEtf(asset.etf, profile, userThemeIds);
  }
  return thesisFitForThemes(asset.themes, userThemeIds, profile);
}

export function thesisLackingForAsset(
  assetThemes: ThemeId[],
  userThemeIds: ThemeId[]
): string[] {
  const missing = userThemeIds.filter((t) => !assetThemes.includes(t));
  return missing
    .map((id) => {
      const t = themeById(id);
      return t ? `Missing your theme: ${t.title}` : `Missing theme: ${id}`;
    })
    .slice(0, 4);
}
