import type { Concept, ConceptTier } from "@/data/concepts";
import { allConcepts } from "@/data/concepts";

export type ExperienceLevel = "none" | "some" | "experienced";

const TIER_MAP: Record<ExperienceLevel, ConceptTier[]> = {
  none: ["foundational", "intermediate"],
  some: ["foundational", "intermediate"],
  experienced: ["foundational", "intermediate", "advanced"],
};

/**
 * Return concepts appropriate for a given experience level.
 * "none" and "some" both get foundational + intermediate.
 * "experienced" gets all tiers.
 */
export function conceptsForExperience(exp: ExperienceLevel): Concept[] {
  const allowed = new Set(TIER_MAP[exp]);
  return allConcepts().filter((c) => allowed.has(c.tier));
}

/**
 * The primary tier for a given experience level — used for
 * section order and default display.
 */
export function primaryTier(exp: ExperienceLevel): ConceptTier {
  switch (exp) {
    case "none":
      return "foundational";
    case "some":
      return "intermediate";
    case "experienced":
      return "advanced";
  }
}

/**
 * Whether a single concept is appropriate for this experience level.
 */
export function isAppropriateFor(
  concept: Concept,
  exp: ExperienceLevel
): boolean {
  return TIER_MAP[exp].includes(concept.tier);
}
