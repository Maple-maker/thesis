import type { JournalEntry } from "@/store/types";
import type { Holding } from "@/types/linked-accounts";
import type { ConvictionNote } from "@/types/conviction-loop";
import type { ModelThesis } from "@/store";
import type { StressTestResult } from "@/lib/thesis-stress-test";
import type { HoldingHealth } from "@/lib/thesis-health";
import {
  computeLoginStreak,
  computeLessonStreak,
  computeDuelStreak,
  computeAllStreaks,
} from "@/lib/streaks";

// ── Types ──────────────────────────────────────────────────────────────────

export type CompounderDimension =
  | "forecast-accuracy"
  | "thesis-quality"
  | "risk-assessment"
  | "position-sizing"
  | "decision-discipline"
  | "learning-velocity";

export type DimensionScore = {
  dimension: CompounderDimension;
  label: string;
  score: number;          // 0–100
  weight: number;         // 0–1
  trend: "up" | "steady" | "down";
  insight: string;        // human-readable insight
  /** @deprecated Use insight instead */
  detail?: string;
};

export type InvestorScore = {
  overall: number;        // 0–100
  dimensions: DimensionScore[];
  streakDays: number;     // consecutive days with journal entries
  loginStreakDays: number;
  lessonStreakDays: number;
  duelStreakDays: number;
  combinedStreakDays: number;
  totalDecisions: number;
  strongestDimension: DimensionScore;
  weakestDimension: DimensionScore;
  /** @deprecated Use strongestDimension instead */
  strongest?: DimensionScore;
  /** @deprecated Use weakestDimension instead */
  weakest?: DimensionScore;
  /** Overall trend — changing direction across all dimensions */
  trend: "improving" | "steady" | "declining";
  computedAt: number;
};

export type ScoreHistoryPoint = {
  date: string;           // ISO date
  overall: number;
};

export type WeeklyReviewResult = {
  summaryText: string;
  actionItems: string[];
  highlights: string[];
};

// ── Weights ────────────────────────────────────────────────────────────────

const DIMENSION_WEIGHTS: Record<CompounderDimension, number> = {
  "forecast-accuracy": 0.30,
  "thesis-quality": 0.25,
  "risk-assessment": 0.15,
  "position-sizing": 0.15,
  "decision-discipline": 0.10,
  "learning-velocity": 0.05,
};

const DIMENSION_LABELS: Record<CompounderDimension, string> = {
  "forecast-accuracy": "Forecast Accuracy",
  "thesis-quality": "Thesis Quality",
  "risk-assessment": "Risk Assessment",
  "position-sizing": "Position Sizing",
  "decision-discipline": "Decision Discipline",
  "learning-velocity": "Learning Velocity",
};

// ── Mock price movements ───────────────────────────────────────────────────
// Used to simulate forecast accuracy. In production, these would come from a market data API.

const MOCK_PRICE_MOVEMENTS: Record<string, number> = {
  AAPL: 0.08, NVDA: 0.35, MSFT: 0.12, GOOGL: 0.09, AMZN: 0.14,
  META: 0.22, TSLA: -0.05, JPM: 0.07, V: 0.11, WMT: 0.06,
  JNJ: 0.03, PG: 0.04, XOM: 0.10, UNH: 0.08, HD: 0.05,
  BAC: 0.06, DIS: 0.09, ADBE: 0.15, CRM: 0.13, NFLX: 0.18,
  AMD: 0.28, INTC: -0.12, QCOM: 0.11, TSM: 0.22, ASML: 0.16,
  ENPH: -0.08, CRWD: 0.25, PLTR: 0.30, SOFI: 0.20, RKLB: -0.15,
  LLY: 0.19, SNOW: 0.10, DDOG: 0.12, COIN: 0.08, HOOD: 0.24,
};

function mockPriceChange(symbol: string): number {
  return MOCK_PRICE_MOVEMENTS[symbol.toUpperCase()] ?? (Math.random() * 0.2 - 0.1);
}

// ── Streak calculator ──────────────────────────────────────────────────────

function computeStreakDays(journal: JournalEntry[]): number {
  if (journal.length === 0) return 0;
  const sorted = [...journal].sort((a, b) => b.createdAt - a.createdAt);
  let streak = 1;
  const today = new Date();
  const mostRecent = new Date(sorted[0].createdAt);
  const diffDays = Math.floor((today.getTime() - mostRecent.getTime()) / (24 * 60 * 60 * 1000));
  // If the most recent entry is more than 2 days old, streak is 0
  if (diffDays > 2) return 0;

  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i].createdAt);
    const prev = new Date(sorted[i - 1].createdAt);
    const daysBetween = Math.floor((prev.getTime() - curr.getTime()) / (24 * 60 * 60 * 1000));
    if (daysBetween <= 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function computeTotalDecisions(journal: JournalEntry[]): number {
  return journal.filter((j) => j.type === "duel" || j.type === "buy" || j.type === "sell").length;
}

// ── Dimension trend helper ─────────────────────────────────────────────────

function dimensionTrend(
  current: number,
  previous: number | null,
): "up" | "steady" | "down" {
  if (previous === null) return "steady";
  if (current > previous + 5) return "up";
  if (current < previous - 5) return "down";
  return "steady";
}

type ScoredDimension = { score: number; previousScore: number | null };

function buildDimensionPreviousScores(
  journal: JournalEntry[],
  model: ModelThesis | null,
  convictionNotes: ConvictionNote[],
): Partial<Record<CompounderDimension, number>> {
  const now = Date.now();
  const prevJournal = journal.filter(
    (j) =>
      now - j.createdAt >= 30 * 24 * 60 * 60 * 1000 &&
      now - j.createdAt < 60 * 24 * 60 * 60 * 1000
  );
  if (prevJournal.length === 0) return {};

  return {
    "decision-discipline": scoreDecisionDiscipline(prevJournal).score,
    "learning-velocity": scoreLearningVelocity(prevJournal, convictionNotes).score,
    "risk-assessment": scoreRiskAssessmentOverride(model, prevJournal),
    "forecast-accuracy": 50 + Math.floor(Math.random() * 20),
  };
}

function scoreRiskAssessmentOverride(
  model: ModelThesis | null,
  journal: JournalEntry[],
): number {
  let score = 30;
  if (!model) return score;
  if (model.stressSummaries?.length > 0) score += 25;
  const symbols = new Set(model.holdings.map((h) => h.symbol));
  if (symbols.size >= 8) score += 20;
  else if (symbols.size >= 5) score += 10;
  const bearEntries = journal.filter(
    (j) =>
      j.note?.toLowerCase().includes("risk") ||
      j.note?.toLowerCase().includes("downside") ||
      j.note?.toLowerCase().includes("bear") ||
      j.reason === "safer"
  ).length;
  score += Math.min(bearEntries * 5, 25);
  return Math.min(100, score);
}

// ── Dimension scorers ──────────────────────────────────────────────────────

function scoreThesisQuality(model: ModelThesis | null, _convictionNotes: ConvictionNote[]): { score: number; insight: string } {
  if (!model) return { score: 30, insight: "Build a thesis model to track investment convictions" };
  const holdings = model.holdings.length;
  const themes = model.themeIds.length;
  let score = Math.min(holdings * 5, 40) + Math.min(themes * 10, 30);
  if (model.conviction?.length > 20) score += 15;
  if (model.stressSummaries?.length > 0) score += 15;
  const s = Math.min(100, score);

  let insight: string;
  if (s >= 70) insight = `Strong thesis with ${holdings} holdings across ${themes} themes`;
  else if (s >= 40) insight = `Developing thesis — consider adding more holdings or stress testing`;
  else insight = `Early stage — start building your thesis in the Builder tab`;

  return { score: s, insight };
}

function scoreDecisionDiscipline(journal: JournalEntry[]): { score: number; insight: string } {
  const recentJournal = journal.filter(
    (j) => Date.now() - j.createdAt < 90 * 24 * 60 * 60 * 1000
  );
  if (recentJournal.length === 0) return { score: 20, insight: "Start journaling to build decision discipline" };

  const entriesPerWeek = recentJournal.length / 13;
  let score = Math.min(entriesPerWeek * 25, 60);

  const withEmotion = recentJournal.filter((j) => j.emotionalState).length;
  score += Math.min((withEmotion / Math.max(recentJournal.length, 1)) * 25, 25);

  const withNotes = recentJournal.filter((j) => j.freeformNote && j.freeformNote.length > 20).length;
  score += Math.min((withNotes / Math.max(recentJournal.length, 1)) * 15, 15);

  const s = Math.min(100, Math.round(score));

  let insight: string;
  if (s >= 70) insight = `Consistent journaling — ${recentJournal.length} entries in 90 days`;
  else if (s >= 40) insight = `Good momentum — try adding emotional state to your entries`;
  else insight = `Irregular entries — aim for 2-3 journal entries per week`;

  return { score: s, insight };
}

function scoreRiskAssessment(
  model: ModelThesis | null,
  journal: JournalEntry[],
): { score: number; insight: string } {
  let score = 30;
  const insights: string[] = [];

  if (model) {
    if (model.stressSummaries?.length > 0) {
      score += 25;
      insights.push("stress tests completed");
    }

    const symbols = new Set(model.holdings.map((h) => h.symbol));
    if (symbols.size >= 8) {
      score += 20;
      insights.push("well diversified");
    } else if (symbols.size >= 5) {
      score += 10;
      insights.push("moderately diversified");
    }
  }

  const bearEntries = journal.filter(
    (j) =>
      j.note?.toLowerCase().includes("risk") ||
      j.note?.toLowerCase().includes("downside") ||
      j.note?.toLowerCase().includes("bear") ||
      j.reason === "safer"
  ).length;
  score += Math.min(bearEntries * 5, 25);
  if (bearEntries > 0) insights.push(`${bearEntries} risk-aware entries`);

  const s = Math.min(100, score);

  let insight: string;
  if (s >= 70) insight = `Strong risk awareness — ${insights.join(", ")}`;
  else if (s >= 40) insight = `Building awareness — run stress tests and diversify holdings`;
  else insight = `Early stage — start by noting risks in your journal entries`;

  return { score: s, insight };
}

function scorePositionSizing(model: ModelThesis | null): { score: number; insight: string } {
  if (!model || model.holdings.length === 0) return { score: 30, insight: "Add holdings to evaluate position sizing" };

  const weights = model.holdings.map((h) => h.weightPct);
  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);

  let score = 50;
  if (maxWeight <= 25) score += 30;
  else if (maxWeight <= 40) score += 15;

  const spread = maxWeight - minWeight;
  if (spread <= 15 && model.holdings.length >= 5) score += 20;

  const s = Math.min(100, score);

  let insight: string;
  if (s >= 80) insight = `Well diversified — no position exceeds ${maxWeight.toFixed(0)}%`;
  else if (s >= 50) insight = `Moderate concentration — largest position is ${maxWeight.toFixed(0)}%`;
  else insight = `Concentrated — consider spreading across more positions`;

  return { score: s, insight };
}

function scoreForecastAccuracy(
  _model: ModelThesis | null,
  journal: JournalEntry[],
): { score: number; insight: string } {
  // Compare buy/sell entries against mock price movements
  const predictions = journal.filter((j) => j.type === "buy" || j.type === "sell");
  if (predictions.length === 0) {
    return { score: 30, insight: "Make buy/sell entries to track forecast accuracy" };
  }

  let correct = 0;
  for (const entry of predictions) {
    const symbol = entry.winner;
    if (!symbol) continue;
    const change = mockPriceChange(symbol);
    if (entry.type === "buy" && change > 0) correct++;
    else if (entry.type === "sell" && change < 0) correct++;
  }

  const score = Math.round((correct / Math.max(predictions.length, 1)) * 70) + 30;
  const pct = Math.round((correct / Math.max(predictions.length, 1)) * 100);

  let insight: string;
  if (score >= 70) insight = `Your forecasts were correct ${pct}% of the time`;
  else if (score >= 40) insight = `Mixed accuracy — ${pct}% of predictions were right`;
  else insight = `Early stage — accuracy improves with more data points`;

  return { score: Math.min(100, score), insight };
}

function scoreLearningVelocity(
  journal: JournalEntry[],
  convictionNotes: ConvictionNote[],
): { score: number; insight: string } {
  let score = 40;
  const factors: string[] = [];

  if (journal.length >= 20) { score += 20; factors.push("extensive journal"); }
  else if (journal.length >= 10) { score += 10; factors.push("growing journal"); }
  else if (journal.length >= 5) { score += 5; factors.push("building journal habit"); }

  if (convictionNotes.length >= 5) { score += 20; factors.push("active conviction iteration"); }
  else if (convictionNotes.length >= 2) { score += 10; factors.push("some conviction notes"); }

  const recentJournal = journal.filter(
    (j) => Date.now() - j.createdAt < 30 * 24 * 60 * 60 * 1000
  );
  if (recentJournal.length >= 8) { score += 20; factors.push("high recent activity"); }
  else if (recentJournal.length >= 4) { score += 10; factors.push("moderate recent activity"); }

  const s = Math.min(100, score);

  let insight: string;
  if (s >= 70) insight = `Rapid growth — ${factors.join(", ")}`;
  else if (s >= 40) insight = `Building momentum — ${factors.join(", ") || "keep journaling regularly"}`;
  else insight = `Getting started — journal regularly and iterate on your convictions`;

  return { score: s, insight };
}

// ── Main scorer ────────────────────────────────────────────────────────────

export function computeInvestorScore(
  model: ModelThesis | null,
  journal: JournalEntry[],
  convictionNotes: ConvictionNote[],
  lastActiveDate?: string,
  lessonCompletionDates?: Record<string, number>,
): InvestorScore {
  const dimForecast = scoreForecastAccuracy(model, journal);
  const dimThesis = scoreThesisQuality(model, convictionNotes);
  const dimRisk = scoreRiskAssessment(model, journal);
  const dimPosition = scorePositionSizing(model);
  const dimDiscipline = scoreDecisionDiscipline(journal);
  const dimLearning = scoreLearningVelocity(journal, convictionNotes);

  // Build previous scores for trend calculation
  const prevScores = buildDimensionPreviousScores(journal, model, convictionNotes);

  const dimensions: DimensionScore[] = [
    {
      dimension: "forecast-accuracy",
      label: DIMENSION_LABELS["forecast-accuracy"],
      score: dimForecast.score,
      weight: DIMENSION_WEIGHTS["forecast-accuracy"],
      trend: dimensionTrend(dimForecast.score, prevScores["forecast-accuracy"] ?? null),
      insight: dimForecast.insight,
      detail: "How often your predictions prove correct.",
    },
    {
      dimension: "thesis-quality",
      label: DIMENSION_LABELS["thesis-quality"],
      score: dimThesis.score,
      weight: DIMENSION_WEIGHTS["thesis-quality"],
      trend: dimensionTrend(dimThesis.score, prevScores["thesis-quality"] ?? null),
      insight: dimThesis.insight,
      detail: "Depth and conviction of your investment theses.",
    },
    {
      dimension: "risk-assessment",
      label: DIMENSION_LABELS["risk-assessment"],
      score: dimRisk.score,
      weight: DIMENSION_WEIGHTS["risk-assessment"],
      trend: dimensionTrend(dimRisk.score, prevScores["risk-assessment"] ?? null),
      insight: dimRisk.insight,
      detail: "Your ability to identify and plan for risks.",
    },
    {
      dimension: "position-sizing",
      label: DIMENSION_LABELS["position-sizing"],
      score: dimPosition.score,
      weight: DIMENSION_WEIGHTS["position-sizing"],
      trend: dimensionTrend(dimPosition.score, prevScores["position-sizing"] ?? null),
      insight: dimPosition.insight,
      detail: "Portfolio construction discipline.",
    },
    {
      dimension: "decision-discipline",
      label: DIMENSION_LABELS["decision-discipline"],
      score: dimDiscipline.score,
      weight: DIMENSION_WEIGHTS["decision-discipline"],
      trend: dimensionTrend(dimDiscipline.score, prevScores["decision-discipline"] ?? null),
      insight: dimDiscipline.insight,
      detail: "Consistency of your decision process.",
    },
    {
      dimension: "learning-velocity",
      label: DIMENSION_LABELS["learning-velocity"],
      score: dimLearning.score,
      weight: DIMENSION_WEIGHTS["learning-velocity"],
      trend: dimensionTrend(dimLearning.score, prevScores["learning-velocity"] ?? null),
      insight: dimLearning.insight,
      detail: "Rate of improvement across all dimensions.",
    },
  ];

  const overall = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * d.weight, 0)
  );

  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const streakDays = computeStreakDays(journal);
  const allStreaks = computeAllStreaks(
    lastActiveDate ?? "",
    lessonCompletionDates ?? {},
    journal
  );
  const totalDecisions = computeTotalDecisions(journal);

  // Trend: compare journal activity this month vs last month
  const now = Date.now();
  const thisMonth = journal.filter((j) => now - j.createdAt < 30 * 24 * 60 * 60 * 1000).length;
  const lastMonth = journal.filter(
    (j) => now - j.createdAt >= 30 * 24 * 60 * 60 * 1000 && now - j.createdAt < 60 * 24 * 60 * 60 * 1000
  ).length;
  let trend: InvestorScore["trend"] = "steady";
  if (thisMonth > lastMonth + 2) trend = "improving";
  else if (thisMonth < lastMonth - 2) trend = "declining";

  return {
    overall,
    dimensions,
    streakDays,
    loginStreakDays: allStreaks.login.current,
    lessonStreakDays: allStreaks.lessons.current,
    duelStreakDays: allStreaks.duels.current,
    combinedStreakDays: allStreaks.combined.current,
    totalDecisions,
    strongestDimension: sorted[0],
    weakestDimension: sorted[sorted.length - 1],
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1],
    trend,
    computedAt: now,
  };
}

// ── History ────────────────────────────────────────────────────────────────

/**
 * Build a weekly score history from the given list of InvestorScores.
 * Useful for charting/sparkline: takes an array of computed scores (one per week)
 * and returns simplified { date, overall } points.
 */
export function getScoreHistory(scores: InvestorScore[]): ScoreHistoryPoint[] {
  return scores.map((s) => ({
    date: new Date(s.computedAt).toISOString().slice(0, 10),
    overall: s.overall,
  }));
}

// ── Weekly review ──────────────────────────────────────────────────────────

/**
 * Generate a weekly review summary from journal entries, health data, and stress test results.
 * Uses template-based summaries seeded with actual data values.
 */
export function getWeeklyReview(
  journal: JournalEntry[],
  _health: HoldingHealth[],
  _stressResults: StressTestResult[],
): WeeklyReviewResult {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const weekJournal = journal.filter((j) => j.createdAt >= weekAgo);
  const decisions = weekJournal.filter(
    (j) => j.type === "duel" || j.type === "buy" || j.type === "sell"
  );

  const highlights: string[] = [];
  const actionItems: string[] = [];

  // ── Summary text ──
  let summaryText: string;

  if (weekJournal.length === 0) {
    summaryText = "This week you made 0 decisions recorded in your journal. Start by running a duel or writing a reflection to begin tracking your growth.";
    highlights.push("No journal entries this week");
    actionItems.push("Run a stock duel to kick off your decision journal");
    actionItems.push("Add a free-form journal entry about your market thoughts");
  } else {
    const decisionWord = decisions.length === 1 ? "decision" : "decisions";
    summaryText = `This week you made ${decisions.length} ${decisionWord} across ${weekJournal.length} journal entr${weekJournal.length === 1 ? "y" : "ies"}.`;

    // Check strongest pattern
    const withEmotion = weekJournal.filter((j) => j.emotionalState).length;
    if (withEmotion > weekJournal.length / 2) {
      summaryText += ` Your emotional awareness was strong — you captured how you felt in ${withEmotion} entr${withEmotion === 1 ? "y" : "ies"}.`;
    } else if (weekJournal.length > 2) {
      summaryText += ` Good journaling volume — try adding emotional state tags to build self-awareness.`;
    }

    // Health check
    if (_health.length > 0) {
      const redCount = _health.filter((h) => h.status === "red").length;
      if (redCount > 0) {
        summaryText += ` Watch out for ${redCount} holding${redCount > 1 ? "s" : ""} in the red.`;
        actionItems.push(`Review your ${redCount} holding${redCount > 1 ? "s" : ""} flagged as urgent`);
      }
    }

    // Stress test results
    if (_stressResults.length > 0) {
      const weak = _stressResults.filter((r) => r.overallResilience < 40);
      if (weak.length > 0) {
        summaryText += ` Your stress tests show ${weak.length} holding${weak.length > 1 ? "s" : ""} with low resilience.`;
        actionItems.push(`Re-examine ${weak.map((r) => r.symbol).join(", ")} — stress test flagged low resilience`);
      }
    }

    highlights.push(`${weekJournal.length} journal entr${weekJournal.length === 1 ? "y" : "ies"} this week`);
    if (decisions.length > 0) {
      highlights.push(`${decisions.length} investment ${decisionWord} recorded`);
    }
    if (withEmotion > 0) {
      highlights.push(`Emotional state captured in ${withEmotion} entr${withEmotion === 1 ? "y" : "ies"}`);
    } else {
      actionItems.push("Tag your journal entries with how you felt — it builds self-awareness");
    }
  }

  if (actionItems.length === 0) {
    actionItems.push("Keep journaling consistently to build your Investor Score");
  }

  return {
    summaryText,
    actionItems,
    highlights,
  };
}
