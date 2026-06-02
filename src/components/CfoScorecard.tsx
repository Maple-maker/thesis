import { Text, View } from "react-native";

import { Bar } from "@/components/ui/Progress";
import { Tag } from "@/components/ui/Tag";
import type { CfoDerivedMetrics } from "@/types/cfo-profile";

type Props = {
  derived: CfoDerivedMetrics;
  completedSections: number;
  totalSections?: number;
  compact?: boolean;
};

const METRICS: { key: keyof CfoDerivedMetrics; label: string }[] = [
  { key: "overallCfoReadiness", label: "CFO readiness" },
  { key: "riskScore", label: "Risk alignment" },
  { key: "behavioralScore", label: "Behavioral discipline" },
  { key: "liquidityScore", label: "Liquidity" },
  { key: "retirementReadinessScore", label: "Retirement readiness" },
  { key: "portfolioHealthScore", label: "Portfolio health" },
];

export function CfoScorecard({
  derived,
  completedSections,
  totalSections = 24,
  compact,
}: Props) {
  const rows = compact ? METRICS.slice(0, 4) : METRICS;

  return (
    <View className="bg-bg-surface border border-line rounded-card p-4">
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider">
            AI CFO scorecard
          </Text>
          <Text
            className="text-ink font-displayX text-[22px] mt-0.5"
            style={{ letterSpacing: -0.4 }}
          >
            {derived.overallCfoReadiness}
            <Text className="text-ink-3 text-[14px] font-sansMd"> / 100</Text>
          </Text>
        </View>
        <Tag label={derived.wealthStage} tone="brand" />
      </View>

      <Text className="text-ink-2 text-[12.5px] font-sansMd mb-3">
        Profile depth: {completedSections}/{totalSections} sections · improves as you add detail
      </Text>

      <View className="gap-y-2.5">
        {rows.map((m) => {
          if (m.key === "overallCfoReadiness" || m.key === "wealthStage") return null;
          const v = derived[m.key];
          if (typeof v !== "number") return null;
          return (
            <View key={m.key}>
              <View className="flex-row justify-between mb-1">
                <Text className="text-ink-2 text-[12px] font-sansSb">{m.label}</Text>
                <Text className="text-ink font-monoBold text-[12px]">{v}</Text>
              </View>
              <Bar pct={v} color="brand" height={4} />
            </View>
          );
        })}
      </View>
    </View>
  );
}
