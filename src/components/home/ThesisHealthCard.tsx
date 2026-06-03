import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { computeHoldingHealth, getPortfolioHealthSummary } from "@/lib/thesis-health";
import { useStore } from "@/store";

// ── Component ─────────────────────────────────────────────────────────────

/**
 * Home-screen card showing portfolio thesis health.
 * Hidden when there are no holdings.
 * Tap → navigates to /thesis-health for details.
 */
export function ThesisHealthCard() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const holdings = useStore((s) => s.holdings);
  const modelThesis = useStore((s) => s.modelThesis);

  const healthData = useMemo(
    () =>
      holdings.map((h) => computeHoldingHealth(h, profile, themeIds, modelThesis)),
    [holdings, profile, themeIds, modelThesis],
  );

  const summary = useMemo(() => getPortfolioHealthSummary(healthData), [healthData]);

  if (holdings.length === 0) return null;

  const needsAttention = summary.yellowCount + summary.redCount;

  return (
    <View className="mb-4">
      <Card pad={18} onPress={() => router.push("/thesis-health" as any)}>
        {/* ── Header ── */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <View className="bg-brand-bg w-[32px] h-[32px] rounded-[9px] items-center justify-center">
              <Icon name="sparkle" size={16} color="#0E7A66" sw={2} />
            </View>
            <Text
              className="text-ink font-displayX text-[16px]"
              style={{ letterSpacing: -0.3 }}
            >
              Thesis health
            </Text>
          </View>
          <Icon name="chev" size={14} color="#8C988F" />
        </View>

        {/* ── Status dots + counts ── */}
        <View className="flex-row items-center gap-4 mb-3">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-pos" />
            <Text className="text-ink-2 text-[13px] font-sansMd">
              {summary.greenCount} on track
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full bg-amber" />
            <Text className="text-ink-2 text-[13px] font-sansMd">
              {summary.yellowCount} watch
            </Text>
          </View>
          {summary.redCount > 0 && (
            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-neg" />
              <Text className="text-ink-2 text-[13px] font-sansMd">
                {summary.redCount} urgent
              </Text>
            </View>
          )}
        </View>

        {/* ── Callout ── */}
        {needsAttention > 0 ? (
          <View className="bg-amber-bg rounded-[10px] px-3 py-2.5 flex-row items-center gap-2">
            <Icon name="info" size={14} color="#D98512" sw={2} />
            <Text className="text-ink text-[12px] font-sansSb leading-[17px] flex-1">
              {needsAttention} holding{needsAttention > 1 ? "s" : ""} need
              {needsAttention === 1 ? "s" : ""} attention. Tap to review.
            </Text>
          </View>
        ) : (
          <View className="bg-pos-bg rounded-[10px] px-3 py-2.5 flex-row items-center gap-2">
            <View className="w-[18px] h-[18px] rounded-full bg-pos items-center justify-center">
              <Icon name="check" size={11} color="#FFFFFF" sw={3} />
            </View>
            <Text className="text-pos-ink text-[12px] font-sansSb leading-[17px] flex-1">
              All {summary.total} holdings on track
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}
