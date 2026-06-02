import type { IconName } from "@/components/Icon";
import type { CourseId } from "@/data/courses";

export const COURSE_ICONS: Record<CourseId, IconName> = {
  "money-foundations": "seed",
  "credit-borrowing": "shield",
  "retirement-accounts": "piggy",
  "investing-building-blocks": "compass",
  "bonds-basics": "piggy",
  "fed-and-markets": "trend",
  "bitcoin-101": "bolt",
  "international-markets": "discover",
  "diversification-essentials": "grid",
  "taxes-investing": "book",
  "risk-volatility": "shield",
  "behavioral-investing": "cap",
  "dividends-income": "seed",
  "recession-resilience": "shield",
};

export const COURSE_ICON_BG: Record<CourseId, string> = {
  "money-foundations": "bg-brand-bg",
  "credit-borrowing": "bg-amber-bg",
  "retirement-accounts": "bg-violet-bg",
  "investing-building-blocks": "bg-pos-bg",
  "bonds-basics": "bg-violet-bg",
  "fed-and-markets": "bg-amber-bg",
  "bitcoin-101": "bg-amber-bg",
  "international-markets": "bg-brand-bg",
  "diversification-essentials": "bg-pos-bg",
  "taxes-investing": "bg-bg-surface2",
  "risk-volatility": "bg-amber-bg",
  "behavioral-investing": "bg-violet-bg",
  "dividends-income": "bg-brand-bg",
  "recession-resilience": "bg-pos-bg",
};

export const COURSE_ICON_COLOR: Record<CourseId, string> = {
  "money-foundations": "#0E7A66",
  "credit-borrowing": "#D98512",
  "retirement-accounts": "#7C3AED",
  "investing-building-blocks": "#149059",
  "bonds-basics": "#7C3AED",
  "fed-and-markets": "#D98512",
  "bitcoin-101": "#D98512",
  "international-markets": "#0E7A66",
  "diversification-essentials": "#149059",
  "taxes-investing": "#4D5A54",
  "risk-volatility": "#D98512",
  "behavioral-investing": "#7C3AED",
  "dividends-income": "#0E7A66",
  "recession-resilience": "#149059",
};
