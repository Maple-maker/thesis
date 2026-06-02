/**
 * RevenueCat + local entitlement cache.
 * Install: npx expo install react-native-purchases
 */
import { Platform } from "react-native";

import type { SubscriptionTier } from "@/data/subscription-tiers";

const RC_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const RC_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
const ENTITLEMENT_ID = "pro";
const OFFERING_ID = "default";

type PurchasesModule = {
  default: {
    configure: (opts: { apiKey: string; appUserID: string }) => void;
    logIn: (id: string) => Promise<unknown>;
    getCustomerInfo: () => Promise<{
      entitlements: { active: Record<string, unknown> };
    }>;
    getOfferings: () => Promise<{
      current?: { availablePackages: { identifier: string }[] };
    }>;
    purchasePackage: (pkg: { identifier: string }) => Promise<{
      customerInfo: { entitlements: { active: Record<string, unknown> } };
    }>;
    restorePurchases: () => Promise<{
      entitlements: { active: Record<string, unknown> };
    }>;
  };
};

async function getPurchases(): Promise<PurchasesModule | null> {
  try {
    return (await import("react-native-purchases")) as PurchasesModule;
  } catch {
    return null;
  }
}

export function isRevenueCatConfigured(): boolean {
  return Platform.OS === "ios" ? Boolean(RC_IOS) : Boolean(RC_ANDROID);
}

export async function configureBilling(appUserId: string): Promise<void> {
  const Purchases = await getPurchases();
  if (!Purchases || !isRevenueCatConfigured()) return;

  const apiKey = Platform.OS === "ios" ? RC_IOS! : RC_ANDROID!;
  Purchases.default.configure({ apiKey, appUserID: appUserId });
}

export async function syncSubscriptionTier(appUserId: string): Promise<SubscriptionTier> {
  const Purchases = await getPurchases();
  if (!Purchases || !isRevenueCatConfigured()) {
    return "free";
  }

  try {
    await Purchases.default.logIn(appUserId);
    const info = await Purchases.default.getCustomerInfo();
    const pro = Boolean(info.entitlements.active[ENTITLEMENT_ID]);
    return pro ? "pro" : "free";
  } catch {
    return "free";
  }
}

export async function purchaseProPackage(): Promise<SubscriptionTier> {
  const Purchases = await getPurchases();
  if (!Purchases || !isRevenueCatConfigured()) {
    throw new Error("Purchases not configured, use dev Pro toggle in paywall.");
  }

  const offerings = await Purchases.default.getOfferings();
  const pkg =
    offerings.current?.availablePackages.find((p) => p.identifier.includes("monthly")) ??
    offerings.current?.availablePackages[0];

  if (!pkg) throw new Error("No subscription package found in RevenueCat.");

  const { customerInfo } = await Purchases.default.purchasePackage(pkg);
  return customerInfo.entitlements.active[ENTITLEMENT_ID] ? "pro" : "free";
}

export async function restorePurchases(): Promise<SubscriptionTier> {
  const Purchases = await getPurchases();
  if (!Purchases || !isRevenueCatConfigured()) return "free";
  const info = await Purchases.default.restorePurchases();
  return info.entitlements.active[ENTITLEMENT_ID] ? "pro" : "free";
}

export { ENTITLEMENT_ID, OFFERING_ID };
