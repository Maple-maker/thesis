import type { Step } from "@/data/questionnaire";
import type { Interest } from "@/store/types";

/**
 * Quick Take — 5 pre-signup questions, a distilled subset of the full
 * Thesis Builder. Each maps to an existing UserProfile field so the result
 * screen can call generateThemes() with no new scoring logic.
 */
export const QUICK_TAKE_STEPS: Step[] = [
  {
    id: "qt-horizon",
    title: "When do you need this money?",
    subtitle: "This shapes everything.",
    questions: [
      {
        kind: "choice",
        id: "horizon",
        prompt: "",
        options: [
          { value: "short", label: "Within 3 years" },
          { value: "medium", label: "3–7 years" },
          { value: "long", label: "7–15 years" },
          { value: "very-long", label: "15+ years" },
        ],
      },
    ],
  },
  {
    id: "qt-drawdown",
    title: "How do you handle a bad month?",
    subtitle: "Your honest answer, not your optimistic one.",
    questions: [
      {
        kind: "choice",
        id: "reactionToDrawdown",
        prompt: "",
        options: [
          { value: "panic-sell", label: "I'd want out" },
          { value: "hold", label: "Hold and don't look" },
          { value: "buy-more", label: "Buy more — sale prices" },
        ],
      },
    ],
  },
  {
    id: "qt-goal",
    title: "What's the main job for this money?",
    subtitle: "",
    questions: [
      {
        kind: "choice",
        id: "primaryGoal",
        prompt: "",
        options: [
          { value: "retirement", label: "Long-term retirement" },
          { value: "wealth", label: "General wealth building" },
          { value: "income", label: "Generate income now" },
          { value: "exploration", label: "Learn the market" },
        ],
      },
    ],
  },
  {
    id: "qt-interest",
    title: "What theme pulls at you most?",
    subtitle: "Pick one — you can add more later.",
    questions: [
      {
        kind: "choice",
        id: "qtInterest",
        prompt: "",
        options: [
          { value: "ai", label: "AI & technology" },
          { value: "climate", label: "Clean energy & climate" },
          { value: "health", label: "Healthcare & biotech" },
          { value: "brands", label: "Consumer brands" },
          { value: "none", label: "No strong preference" },
        ],
      },
    ],
  },
  {
    id: "qt-risk",
    title: "How much volatility can you stomach?",
    subtitle: "",
    questions: [
      {
        kind: "choice",
        id: "risk",
        prompt: "",
        options: [
          { value: "low", label: "Keep it steady" },
          { value: "medium", label: "Some swings are fine" },
          { value: "high", label: "I can handle big swings" },
          { value: "very-high", label: "Volatility doesn't bother me" },
        ],
      },
    ],
  },
];

/** qtInterest → interests[] for generateThemes(). */
export const QUICK_TAKE_INTEREST_MAP: Record<string, Interest[]> = {
  ai: ["ai"],
  climate: ["climate"],
  health: ["biotech"],
  brands: ["consumer-brands"],
  none: [],
};
