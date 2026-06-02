import type { CfoExtended, CfoProfile } from "@/types/cfo-profile";
import type { UserProfile } from "@/store/types";

const CORE_KEYS = new Set<keyof UserProfile>([
  "age",
  "netInvestable",
  "monthlyContribution",
  "hasEmergencyFund",
  "hasHighInterestDebt",
  "primaryGoal",
  "horizon",
  "targetReturn",
  "risk",
  "reactionToDrawdown",
  "experience",
  "interests",
  "concerns",
  "values",
  "incomeNeed",
]);

export function getProfileValue(profile: CfoProfile, path: string): unknown {
  if (CORE_KEYS.has(path as keyof UserProfile)) {
    return profile[path as keyof UserProfile];
  }
  const parts = path.split(".");
  if (parts[0] !== "extended" || parts.length < 3) return undefined;
  let cur: unknown = profile.extended;
  for (let i = 1; i < parts.length; i++) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[parts[i]!];
  }
  return cur;
}

export function setProfileValue(profile: CfoProfile, path: string, value: unknown): CfoProfile {
  if (CORE_KEYS.has(path as keyof UserProfile)) {
    return { ...profile, [path]: value } as CfoProfile;
  }
  const parts = path.split(".");
  if (parts[0] !== "extended" || parts.length < 3) return profile;

  const extended = { ...profile.extended } as CfoExtended;
  let cur: Record<string, unknown> = extended as Record<string, unknown>;
  for (let i = 1; i < parts.length - 1; i++) {
    const key = parts[i]!;
    cur[key] = { ...(cur[key] as Record<string, unknown> | undefined) };
    cur = cur[key] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]!] = value;

  return {
    ...profile,
    extended,
    meta: { ...profile.meta, updatedAt: Date.now() },
  };
}
