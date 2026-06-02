import { DEFAULT_PROFILE } from "@/data/questionnaire";
import { computeDerivedMetrics } from "@/lib/cfo-derived-metrics";
import type { CfoProfile } from "@/types/cfo-profile";

export function createDefaultCfoProfile(): CfoProfile {
  const profile: CfoProfile = {
    ...DEFAULT_PROFILE,
    extended: {},
    meta: {
      version: 2,
      completedChapters: [],
      completedSections: [],
      updatedAt: Date.now(),
    },
    derived: computeDerivedMetrics({
      ...DEFAULT_PROFILE,
      extended: {},
      meta: {
        version: 2,
        completedChapters: [],
        completedSections: [],
        updatedAt: Date.now(),
      },
      derived: {} as CfoProfile["derived"],
    }),
  };
  return profile;
}
