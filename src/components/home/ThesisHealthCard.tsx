import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { pushRoute } from "@/lib/app-route";
import {
  computeHoldingHealth,
  computeAlignmentGap,
  getPortfolioHealthSummary,
  getModelHealthSummary,
} from "@/lib/thesis-health";
import { useStore } from "@/store";

/**
 * Home-screen card showing portfolio + model thesis health.
 * Hidden when there are no holdings AND no model thesis.
 * Shows alignment gap when model thesis exists.
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

  const alignmentGaps = useMemo(
    () =>
      modelThesis?.holdings?.length
        ? computeAlignmentGap(modelThesis.holdings, holdings, profile, themeIds)
        : [],
    [modelThesis, holdings, profile, themeIds],
  );

  const modelSummary = useMemo(() => getModelHealthSummary(alignmentGaps), [alignmentGaps]);

  if (holdings.length === 0 && alignmentGaps.length === 0) return null;

  const needsAttention = summary.yellowCount + summary.redCount;
  const modelNeedsAttention = modelSummary.misalignedCount + modelSummary.missingCount;

  return (
    <View className="mb-4">
      <Card
        pad={18}
        onPress={() => {
          // Deep link to model/conviction view when alignment gaps exist,
          // otherwise default to portfolio health view.
          const target =
            modelNeedsAttention > 0
              ? "/thesis-health?mode=model"
              : "/thesis-health";
          pushRoute(router, target);
        }}
      >
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

        {/* ── Portfolio status dots ── */}
        {summary.total > 0 && (
          <View className="flex-row items-center gap-4 mb-2.5">
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
        )}

        {/* ── Model thesis alignment bar ── */}
        {modelSummary.total > 0 && (
          <View className="flex-row items-center gap-3 mb-2.5">
            <Text className="text-ink-3 text-[11px] font-sansMd">Model:</Text>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-brand" />
              <Text className="text-ink-2 text-[13px] font-sansMd">
                {modelSummary.alignedCount} aligned
              </Text>
            </View>
            {modelNeedsAttention > 0 && (
              <View className="flex-row items-center gap-1.5">
                <View className="w-2 h-2 rounded-full bg-amber" />
                <Text className="text-ink-2 text-[13px] font-sansMd">
                  {modelNeedsAttention} off
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Callout ── */}
        {needsAttention > 0 ? (
          <View className="bg-amber-bg rounded-[10px] px-3 py-2.5 flex-row items-center gap-2">
            <Icon name="info" size={14} color="#D98512" sw={2} />
            <Text className="text-ink text-[12px] font-sansSb leading-[17px] flex-1">
              {needsAttention} holding{needsAttention > 1 ? "s" : ""} need
              {needsAttention === 1 ? "s" : ""} attention{modelNeedsAttention > 0 ? ` · ${modelNeedsAttention} thesis gap${modelNeedsAttention > 1 ? "s" : ""}` : ""}. Tap to review.
            </Text>
          </View>
        ) : modelNeedsAttention > 0 ? (
          <View className="bg-amber-bg rounded-[10px] px-3 py-2.5 flex-row items-center gap-2">
            <Icon name="info" size={14} color="#D98512" sw={2} />
            <Text className="text-ink text-[12px] font-sansSb leading-[17px] flex-1">
              {modelNeedsAttention} thesis gap{modelNeedsAttention > 1 ? "s" : ""} — {modelSummary.missingCount > 0 ? `${modelSummary.missingCount} missing from portfolio` : "weights need rebalancing"}. Tap to review.
            </Text>
          </View>
        ) : (
          <View className="bg-pos-bg rounded-[10px] px-3 py-2.5 flex-row items-center gap-2">
            <View className="w-[18px] h-[18px] rounded-full bg-pos items-center justify-center">
              <Icon name="check" size={11} color="#FFFFFF" sw={3} />
            </View>
            <Text className="text-pos-ink text-[12px] font-sansSb leading-[17px] flex-1">
              {modelSummary.total > 0
                ? `All ${summary.total} holdings on track · fully aligned`
                : `All ${summary.total} holdings on track`}
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
}
