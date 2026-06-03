import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { InvestorScoreGauge } from "@/components/compounder/InvestorScoreGauge";
import { computeInvestorScore } from "@/lib/conviction-compounder";
import { useStore } from "@/store";

function StreakRow({ label, days, icon }: { label: string; days: number; icon: string }) {
  if (days === 0) return null;
  return (
    <View className="flex-row items-center gap-1">
      <Icon name={icon as any} size={12} color="#D98512" />
      <Text className="text-amber text-[10px] font-sansBold">
        {days}-day {label}
      </Text>
    </View>
  );
}

export function CompounderDashboard() {
  const router = useRouter();
  const modelThesis = useStore((s) => s.modelThesis);
  const journal = useStore((s) => s.journal);
  const convictionNotes = useStore((s) => s.convictionNotes);
  const lastActiveDate = useStore((s) => s.lastActiveDate);
  const lessonCompletionDates = useStore((s) => s.lessonCompletionDates);

  const score = useMemo(
    () => computeInvestorScore(modelThesis, journal, convictionNotes, lastActiveDate, lessonCompletionDates),
    [modelThesis, journal, convictionNotes, lastActiveDate, lessonCompletionDates]
  );

  const trendIcon =
    score.trend === "improving" ? "↑" : score.trend === "declining" ? "↓" : "→";
  const trendColor =
    score.trend === "improving"
      ? "#0E7A66"
      : score.trend === "declining"
        ? "#D32F2F"
        : "#8C988F";

  return (
    <Pressable
      onPress={() => router.push("/compounder" as any)}
      className="bg-bg-surface border border-line rounded-[16px] p-4 mb-4 active:opacity-70"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="bg-brand-bg w-[32px] h-[32px] rounded-[9px] items-center justify-center">
            <Icon name="sparkle" size={16} color="#0E7A66" sw={2} />
          </View>
          <Text className="text-ink font-displayX text-[15px]" style={{ letterSpacing: -0.3 }}>
            Investor score
          </Text>
        </View>
        <Icon name="chev" size={14} color="#8C988F" />
      </View>

      {/* Gauge + trend + streaks */}
      <View className="flex-row items-start gap-4">
        <InvestorScoreGauge score={score.overall} size={80} strokeWidth={8} />

        <View className="flex-1">
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <Text style={{ color: trendColor, fontSize: 16 }}>{trendIcon}</Text>
            <Text className="text-ink-2 text-[12px] font-sansMd capitalize">
              {score.trend}
            </Text>
          </View>

          {/* Multi-streak display */}
          <View className="gap-y-0.5 mb-2">
            <StreakRow label="journal streak" days={score.streakDays} icon="flame" />
            <StreakRow label="lesson streak" days={score.lessonStreakDays} icon="cap" />
            <StreakRow label="duel streak" days={score.duelStreakDays} icon="compare" />
            {score.combinedStreakDays > 0 && score.combinedStreakDays !== score.streakDays && (
              <StreakRow label="overall streak" days={score.combinedStreakDays} icon="bolt" />
            )}
          </View>

          <View className="gap-y-1">
            <View className="flex-row justify-between">
              <Text className="text-ink-3 text-[11px] font-sansMd">
                Strongest
              </Text>
              <Text className="text-[#0E7A66] text-[11px] font-sansBold">
                {score.strongestDimension.label} ({score.strongestDimension.score})
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-ink-3 text-[11px] font-sansMd">
                Work on
              </Text>
              <Text className="text-amber text-[11px] font-sansBold">
                {score.weakestDimension.label} ({score.weakestDimension.score})
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
