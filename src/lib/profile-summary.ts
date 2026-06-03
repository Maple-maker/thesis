import type { UserProfile } from "@/store/types";

type ProfileSummary = {
  headline: string;
  bullets: string[];
};

const RISK_LABELS: Record<string, string> = {
  "very-low": "very conservative",
  low: "conservative",
  medium: "balanced",
  high: "growth-oriented",
  "very-high": "aggressive",
};

const HORIZON_LABELS: Record<string, string> = {
  short: "a short horizon (under 3 years)",
  medium: "a medium horizon (3–7 years)",
  long: "a long horizon (7–15 years)",
  "very-long": "a very long horizon (15+ years)",
};

const GOAL_LABELS: Record<string, string> = {
  retirement: "retirement savings",
  wealth: "long-term wealth building",
  house: "saving for a home",
  income: "generating income",
  exploration: "exploring different investments",
};

const INTEREST_MAP: Record<string, string> = {
  ai: "AI & technology",
  climate: "clean energy & climate",
  biotech: "biotech & healthcare",
  cybersecurity: "cybersecurity",
  fintech: "fintech & payments",
  dividends: "dividend income",
  "quality-blue-chip": "blue-chip quality companies",
  "broad-index": "broad index funds",
  "emerging-markets": "emerging markets",
  "consumer-brands": "consumer brands",
  "real-assets": "real assets & commodities",
  "housing-reits": "real estate & REITs",
  "quality-dividend": "quality dividend stocks",
  international: "international diversification",
  "small-companies": "small & mid-cap companies",
  "energy-commodities": "energy & commodities",
  "aging-demographics": "aging demographics",
  "clean-energy": "clean energy",
  defense: "defense & aerospace",
};

export function buildProfileSummary(profile: UserProfile): ProfileSummary {
  const risk = RISK_LABELS[profile.risk] ?? "balanced";
  const horizon = HORIZON_LABELS[profile.horizon] ?? "a medium horizon";
  const goal = GOAL_LABELS[profile.primaryGoal] ?? "building wealth";

  const topInterests = (profile.interests ?? [])
    .slice(0, 2)
    .map((i) => INTEREST_MAP[i] ?? i)
    .filter(Boolean);

  const bullets: string[] = [
    `You have ${horizon} and describe yourself as ${risk}.`,
    `Your primary goal is ${goal}.`,
  ];

  if (topInterests.length > 0) {
    bullets.push(`Your top interests: ${topInterests.join(" and ")}.`);
  }

  if (profile.concerns?.length) {
    const concernLabels: Record<string, string> = {
      inflation: "inflation",
      recession: "a recession",
      "market-crash": "a market crash",
      geopolitical: "geopolitical instability",
      regulation: "regulatory changes",
      "missing-out": "missing out on gains",
    };
    const top = concernLabels[profile.concerns[0]] ?? profile.concerns[0];
    bullets.push(`Your biggest concern: ${top}.`);
  }

  if (profile.incomeNeed === "some") {
    bullets.push("You'd like some income from your investments.");
  } else if (profile.incomeNeed === "primary") {
    bullets.push("You rely on investments for primary income.");
  }

  if (profile.experience === "none") {
    bullets.push("You're new to investing — every investor starts somewhere.");
  }

  return {
    headline: `${profile.risk === "very-high" || profile.risk === "high" ? "Growth-oriented" : profile.risk === "very-low" || profile.risk === "low" ? "Steady & cautious" : "Balanced"} investor with ${horizon}`,
    bullets,
  };
}
