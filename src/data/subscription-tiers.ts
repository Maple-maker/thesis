/**
 * Free vs Thesis Pro, product entitlements.
 * @see docs/subscription-and-backend.md
 */

export type SubscriptionTier = "free" | "pro";

export type FeatureId =
  | "thesis-builder"
  | "etf-screener"
  | "radar"
  | "suggestions"
  | "affiliate-offers"
  | "credit-hub"
  | "learn-courses"
  | "ai-cfo-chat"
  | "cfo-deep-profile"
  | "research-deep";

const FREE_FEATURES: FeatureId[] = [
  "thesis-builder",
  "etf-screener",
  "radar",
  "suggestions",
  "affiliate-offers",
  "credit-hub",
  "learn-courses",
];

const PRO_FEATURES: FeatureId[] = [
  ...FREE_FEATURES,
  "ai-cfo-chat",
  "cfo-deep-profile",
  "research-deep",
];

export const TIER_COPY = {
  free: {
    name: "Thesis",
    tagline: "Learn, build your thesis, screen ETFs, and stay informed.",
  },
  pro: {
    name: "Thesis Pro",
    tagline: "Your personalized CFO, answers grounded in your profile, accounts, and themes.",
    priceLabel: "$9.99 / month",
    trialLabel: "7-day free trial",
  },
} as const;

export const PRO_HIGHLIGHTS = [
  "Unlimited AI CFO chat with full profile + memory",
  "Sonnet-class reasoning (via secure backend)",
  "Deep CFO profile sections & export-ready summary",
  "Priority research modules & scenario framing",
] as const;

export const FREE_HIGHLIGHTS = [
  "Personalized Thesis Builder & matched themes",
  "ETF screener & analysis",
  "Thesis Radar & news-style briefings",
  "Smart suggestions & affiliate tools (disclosed)",
  "Full Credit hub, cards, scores, points basics",
] as const;

export function featuresForTier(tier: SubscriptionTier): FeatureId[] {
  return tier === "pro" ? PRO_FEATURES : FREE_FEATURES;
}

export function hasFeature(tier: SubscriptionTier, feature: FeatureId): boolean {
  return featuresForTier(tier).includes(feature);
}
