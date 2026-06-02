import { hasFeature, type FeatureId, type SubscriptionTier } from "@/data/subscription-tiers";

export function canUseFeature(tier: SubscriptionTier, feature: FeatureId): boolean {
  return hasFeature(tier, feature);
}

export function requireProMessage(feature: FeatureId): string {
  const labels: Partial<Record<FeatureId, string>> = {
    "ai-cfo-chat": "AI Chief Financial Officer",
    "cfo-deep-profile": "Deep CFO profile",
    "research-deep": "Advanced research modules",
  };
  const name = labels[feature] ?? "This feature";
  return `${name} is part of Thesis Pro, upgrade for personalized ongoing guidance.`;
}
