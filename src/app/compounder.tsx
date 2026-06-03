import { useMemo } from "react";
import { Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { InvestorScoreGauge } from "@/components/compounder/InvestorScoreGauge";
import { computeInvestorScore, getScoreHistory } from "@/lib/conviction-compounder";
import {
  computeHoldingHealth,
  getPortfolioHealthSummary,
} from "@/lib/thesis-health";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Bar } from "@/components/ui/Progress";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useStore } from "@/store";

// ── Color helpers ──────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return "#149059";
  if (s >= 45) return "#D98512";
  return "#D8472C";
}

function trendArrow(trend: "up" | "steady" | "down"): string {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  return "→";
}

function trendColor(trend: "up" | "steady" | "down"): string {
  if (trend === "up") return "#149059";
  if (trend === "down") return "#D8472C";
  return "#8C988F";
}

// ── Simple sparkline ───────────────────────────────────────────────────────
// Renders small bars from score history without any chart library.

function SparklineBars({ data }: { data: { overall: number }[] }) {
  const max = Math.max(...data.map((d) => d.overall), 1);
  return (
    <View className="flex-row items-end gap-[3px] h-[40px]">
      {data.map((d, i) => {
        const pct = d.overall / max;
        return (
          <View
            key={i}
            className="rounded-t-[2px]"
            style={{
              width: 8,
              height: Math.max(4, pct * 36),
              backgroundColor: scoreColor(d.overall),
              opacity: 0.7 + pct * 0.3,
            }}
          />
        );
      })}
    </View>
  );
}

// ── Compounder Screen ──────────────────────────────────────────────────────

export default function CompounderScreen() {
  const modelThesis = useStore((s) => s.modelThesis);
  const journal = useStore((s) => s.journal);
  const convictionNotes = useStore((s) => s.convictionNotes);
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const holdings = useStore((s) => s.holdings);

  const lastActiveDate = useStore((s) => s.lastActiveDate);
  const lessonCompletionDates = useStore((s) => s.lessonCompletionDates);

  const score = useMemo(
    () => computeInvestorScore(modelThesis, journal, convictionNotes, lastActiveDate, lessonCompletionDates),
    [modelThesis, journal, convictionNotes, lastActiveDate, lessonCompletionDates],
  );

  // Build score history for sparkline — generate weekly snapshots for past 12 weeks
  const scoreHistory = useMemo(() => {
    const weeklyScores: typeof score[] = [];
    const now = Date.now();
    for (let w = 11; w >= 0; w--) {
      const cutoff = now - (w + 1) * 7 * 24 * 60 * 60 * 1000;
      const windowEnd = now - w * 7 * 24 * 60 * 60 * 1000;
      const windowJournal = journal.filter(
        (j) => j.createdAt > cutoff && j.createdAt <= windowEnd,
      );
      const windowNotes = convictionNotes.filter(
        (n) => n.createdAt > cutoff && n.createdAt <= windowEnd,
      );
      weeklyScores.push(
        computeInvestorScore(modelThesis, windowJournal, windowNotes),
      );
    }
    return getScoreHistory(weeklyScores);
  }, [journal, convictionNotes, modelThesis]);

  const healthSummary = useMemo(() => {
    if (holdings.length === 0) return null;
    const healthData = holdings.map((h) =>
      computeHoldingHealth(h, profile, themeIds, modelThesis),
    );
    return getPortfolioHealthSummary(healthData);
  }, [holdings, profile, themeIds, modelThesis]);

  const trendIcon =
    score.trend === "improving" ? "↑" : score.trend === "declining" ? "↓" : "→";
  const trendClr =
    score.trend === "improving"
      ? "#149059"
      : score.trend === "declining"
        ? "#D8472C"
        : "#8C988F";

  // ── Empty state ──
  if (journal.length === 0) {
    return (
      <Screen padded>
        <Header
          title="Conviction Compounder"
          subtitle="Tracking your growth as an investor"
          back
        />
        <View className="flex-1 items-center justify-center pt-20">
          <View className="bg-bg-surface2 w-[72px] h-[72px] rounded-full items-center justify-center mb-4">
            <Icon name="sparkle" size={32} color="#8C988F" sw={1.5} />
          </View>
          <Text className="text-ink-3 text-[15px] font-sansMd text-center leading-[21px] max-w-[280px]">
            Start journaling to unlock your Investor Score. Every decision you
            record helps measure your growth.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded>
      <Header
        title="Conviction Compounder"
        subtitle="Tracking your growth as an investor"
        back
      />

      {/* ── Gauge + overall score ── */}
      <Card pad={24} className="mb-5 items-center">
        <InvestorScoreGauge score={score.overall} size={140} strokeWidth={12} />
        <View className="flex-row items-center gap-1.5 mt-2">
          <Text style={{ color: trendClr, fontSize: 18 }}>{trendIcon}</Text>
          <Text
            className="font-sansBold capitalize"
            style={{ color: trendClr, fontSize: 14 }}
          >
            {score.trend}
          </Text>
        </View>
        <Text className="text-ink-3 text-[12px] font-sansMd mt-1">
          {score.totalDecisions} total decisions
        </Text>
        <View className="flex-row flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
          {score.streakDays > 0 && (
            <View className="flex-row items-center gap-1 bg-amber-bg rounded-[10px] px-2.5 py-1.5">
              <Icon name="flame" size={13} color="#D98512" />
              <Text className="text-amber text-[11px] font-sansBold">{score.streakDays}d journal</Text>
            </View>
          )}
          {score.lessonStreakDays > 0 && (
            <View className="flex-row items-center gap-1 bg-brand-bg rounded-[10px] px-2.5 py-1.5">
              <Icon name="cap" size={13} color="#0E7A66" />
              <Text className="text-brand text-[11px] font-sansBold">{score.lessonStreakDays}d lessons</Text>
            </View>
          )}
          {score.duelStreakDays > 0 && (
            <View className="flex-row items-center gap-1 bg-violet-bg rounded-[10px] px-2.5 py-1.5">
              <Icon name="compare" size={13} color="#7C3AED" />
              <Text className="text-[#7C3AED] text-[11px] font-sansBold">{score.duelStreakDays}d duels</Text>
            </View>
          )}
        </View>
      </Card>

      {/* ── Score history sparkline ── */}
      {scoreHistory.length > 0 && (
        <View className="mb-5">
          <SectionTitle>Score history</SectionTitle>
          <Card pad={16}>
            <SparklineBars data={scoreHistory} />
            <View className="flex-row justify-between mt-1.5">
              <Text className="text-ink-3 text-[9px] font-monoMd">
                {scoreHistory[0]?.date?.slice(5) ?? ""}
              </Text>
              <Text className="text-ink-3 text-[9px] font-monoMd">
                {scoreHistory[scoreHistory.length - 1]?.date?.slice(5) ?? ""}
              </Text>
            </View>
          </Card>
        </View>
      )}

      {/* ── Dimension breakdown ── */}
      <SectionTitle>Dimension breakdown</SectionTitle>
      <Card pad={16} className="mb-5">
        <View className="gap-y-4">
          {score.dimensions.map((dim) => (
            <View key={dim.dimension}>
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center gap-2 flex-1">
                  <Text className="text-ink text-[13px] font-sansSb">
                    {dim.label}
                  </Text>
                  <Text
                    style={{ color: trendColor(dim.trend), fontSize: 13 }}
                  >
                    {trendArrow(dim.trend)}
                  </Text>
                </View>
                <Text
                  className="font-monoBold text-[13px]"
                  style={{ color: scoreColor(dim.score) }}
                >
                  {dim.score}
                </Text>
              </View>
              <Bar pct={dim.score / 100} height={6} />
              <Text className="text-ink-3 text-[11px] font-sansMd mt-1.5 leading-[15px]">
                {dim.insight}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* ── Strongest / Weakest dimension callouts ── */}
      <View className="flex-row gap-3 mb-5">
        {/* Strongest */}
        <View className="flex-1 bg-bg-surface border border-line rounded-[16px] p-4">
          <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-1.5">
            Strongest
          </Text>
          <Text className="text-[#149059] text-[13px] font-sansBold mb-1">
            {score.strongestDimension.label}
          </Text>
          <View className="flex-row items-center gap-1">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: scoreColor(score.strongestDimension.score) }}
            />
            <Text className="text-ink-2 text-[11px] font-monoBold">
              {score.strongestDimension.score}/100
            </Text>
          </View>
          <Text className="text-ink-3 text-[10px] font-sansMd mt-1 leading-[14px]">
            {score.strongestDimension.insight}
          </Text>
        </View>

        {/* Weakest */}
        <View className="flex-1 bg-bg-surface border border-line rounded-[16px] p-4">
          <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-1.5">
            Needs work
          </Text>
          <Text className="text-amber text-[13px] font-sansBold mb-1">
            {score.weakestDimension.label}
          </Text>
          <View className="flex-row items-center gap-1">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: scoreColor(score.weakestDimension.score) }}
            />
            <Text className="text-ink-2 text-[11px] font-monoBold">
              {score.weakestDimension.score}/100
            </Text>
          </View>
          <Text className="text-ink-3 text-[10px] font-sansMd mt-1 leading-[14px]">
            {score.weakestDimension.insight}
          </Text>
        </View>
      </View>

      {/* ── Portfolio health summary ── */}
      {healthSummary && (
        <View className="mb-6">
          <SectionTitle>Portfolio health</SectionTitle>
          <Card pad={16}>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <View className="w-2.5 h-2.5 rounded-full bg-pos" />
                <Text className="text-ink-2 text-[13px] font-sansMd">
                  {healthSummary.greenCount} on track
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="w-2.5 h-2.5 rounded-full bg-amber" />
                <Text className="text-ink-2 text-[13px] font-sansMd">
                  {healthSummary.yellowCount} watch
                </Text>
              </View>
              {healthSummary.redCount > 0 && (
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2.5 h-2.5 rounded-full bg-neg" />
                  <Text className="text-ink-2 text-[13px] font-sansMd">
                    {healthSummary.redCount} urgent
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </View>
      )}
    </Screen>
  );
}
