import { courseById, type CourseId } from "@/data/courses";
import type { UserProfile } from "@/store/types";

function scoreCourses(profile: UserProfile): Record<CourseId, number> {
  const s: Record<CourseId, number> = {
    "money-foundations": 1,
    "credit-borrowing": 1,
    "retirement-accounts": 1,
    "investing-building-blocks": 1,
    "bonds-basics": 1,
    "fed-and-markets": 1,
    "bitcoin-101": 1,
    "international-markets": 1,
    "diversification-essentials": 1,
    "taxes-investing": 1,
    "risk-volatility": 1,
    "behavioral-investing": 1,
    "dividends-income": 1,
    "recession-resilience": 1,
  };

  if (profile.experience === "none") {
    s["money-foundations"] += 5;
    s["diversification-essentials"] += 3;
    s["investing-building-blocks"] += 1;
  } else if (profile.experience === "some") {
    s["money-foundations"] += 2;
    s["investing-building-blocks"] += 3;
    s["diversification-essentials"] += 2;
  } else {
    s["investing-building-blocks"] += 4;
    s["retirement-accounts"] += 2;
    s["fed-and-markets"] += 2;
  }

  if (!profile.hasEmergencyFund) s["credit-borrowing"] += 2;
  if (profile.hasHighInterestDebt) s["credit-borrowing"] += 4;

  if (profile.horizon === "short" || profile.horizon === "medium") {
    s["money-foundations"] += 2;
    s["bonds-basics"] += 2;
  }
  if (profile.horizon === "long" || profile.horizon === "very-long") {
    s["retirement-accounts"] += 4;
    s["international-markets"] += 2;
  }

  if (profile.primaryGoal === "retirement") s["retirement-accounts"] += 3;
  if (profile.primaryGoal === "income") {
    s["dividends-income"] += 4;
    s["bonds-basics"] += 2;
  }
  if (profile.primaryGoal === "house") s["money-foundations"] += 2;

  if (profile.concerns?.includes("inflation")) {
    s["money-foundations"] += 2;
    s["fed-and-markets"] += 3;
    s["bonds-basics"] += 2;
  }
  if (profile.concerns?.includes("recession") || profile.concerns?.includes("market-crash")) {
    s["recession-resilience"] += 4;
    s["behavioral-investing"] += 2;
  }
  if (profile.interests?.includes("crypto")) s["bitcoin-101"] += 5;
  if (profile.interests?.includes("international")) s["international-markets"] += 5;
  if (profile.interests?.includes("dividends")) s["dividends-income"] += 4;

  if (profile.risk === "high" || profile.risk === "very-high") {
    s["risk-volatility"] += 2;
    s["bitcoin-101"] += 1;
  }
  if (profile.risk === "low" || profile.risk === "very-low") {
    s["bonds-basics"] += 3;
    s["diversification-essentials"] += 2;
  }

  s["taxes-investing"] += 2;
  s["fed-and-markets"] += 1;

  return s;
}

/** Ranked course ids, highest fit first. */
export function recommendedCourseIds(profile: UserProfile): CourseId[] {
  const scores = scoreCourses(profile);
  return (Object.keys(scores) as CourseId[]).sort((a, b) => scores[b] - scores[a]);
}

export function topRecommendedCourse(profile: UserProfile) {
  const id = recommendedCourseIds(profile)[0];
  return id ? courseById(id) : undefined;
}
