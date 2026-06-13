import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { pushRoute } from "@/lib/app-route";

import { Icon } from "@/components/Icon";
import { Tag } from "@/components/ui/Tag";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import {
  computeHoldingHealth,
  computeAlignmentGap,
  getPortfolioHealthSummary,
  getModelHealthSummary,
  type HealthStatus,
  type HoldingHealth,
  type ThesisAlignmentGap,
  type AlignmentStatus,
} from "@/lib/thesis-health";
import { useStore } from "@/store";

type ViewMode = "portfolio" | "model";

// ── Colour map ────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<HealthStatus, string> = {
  green: "#149059",
  yellow: "#D98512",
  red: "#D8472C",
};

const STATUS_BG: Record<HealthStatus, string> = {
  green: "bg-pos-bg",
  yellow: "bg-amber-bg",
  red: "bg-neg-bg",
};

const STATUS_LABEL: Record<HealthStatus, string> = {
  green: "On track",
  yellow: "Watch",
  red: "Attention",
};

const ALIGNMENT_COLOR: Record<AlignmentStatus, string> = {
  aligned: "#149059",
  overweight: "#D98512",
  underweight: "#2F5BD8",
  missing: "#D8472C",
};

const ALIGNMENT_LABEL: Record<AlignmentStatus, string> = {
  aligned: "Aligned",
  overweight: "Overweight",
  underweight: "Underweight",
  missing: "Not held",
};

// ── Portfolio holding row (existing) ──────────────────────────────────────

function HealthRow({ health }: { health: HoldingHealth }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const color = STATUS_COLOR[health.status];

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      className="bg-bg-surface border border-line rounded-[14px] mb-2.5 overflow-hidden active:opacity-70"
    >
      {/* ── Row header ── */}
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <View className="flex-1">
              <View className="flex-row items-center gap-2 flex-wrap">
                <Text className="text-ink font-monoBold text-[14px]">
                  {health.symbol}
                </Text>
                <Text
                  className="text-ink-3 text-[12px] font-sansMd flex-shrink"
                  numberOfLines={1}
                >
                  {health.name}
                </Text>
              </View>
              <View className="flex-row items-center gap-2 mt-1">
                <Text className="text-ink-2 text-[12px] font-sansMd">
                  Conviction {health.convictionScore}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            {health.hasBrief && (
              <Tag label="Brief" tone="brand" />
            )}
            <View className={`${STATUS_BG[health.status]} px-2.5 py-1 rounded-[7px]`}>
              <Text
                className="text-[10px] font-sansBold uppercase tracking-wider"
                style={{ color }}
              >
                {STATUS_LABEL[health.status]}
              </Text>
            </View>
            <Icon name="chev" size={14} color="#8C988F" />
          </View>
        </View>
      </View>

      {/* ── Expanded: triggers ── */}
      {expanded && (
        <View className="px-4 pb-4 border-t border-line pt-3">
          {health.triggers.length > 0 && (
            <>
              <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-2">
                Recent triggers
              </Text>
              {health.triggers.map((t, i) => (
                <View
                  key={i}
                  className="bg-bg-surface2 rounded-[9px] px-3 py-2.5 mb-1.5"
                >
                  <View className="flex-row items-start gap-2">
                    <View
                      className="w-1.5 h-1.5 rounded-full mt-[5px]"
                      style={{
                        backgroundColor:
                          health.status === "red"
                            ? "#D8472C"
                            : health.status === "yellow"
                              ? "#D98512"
                              : "#149059",
                      }}
                    />
                    <Text className="text-ink-2 text-[12px] font-sansMd leading-[17px] flex-1">
                      {t}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}

          <View className="mt-2 bg-bg-surface2 rounded-[9px] px-3 py-2.5">
            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-1">
              Thesis score
            </Text>
            <Text className="text-ink text-[13px] font-sansMd">
              {health.convictionScore}/100 —{" "}
              {health.status === "green"
                ? "Solid conviction across thesis categories"
                : health.status === "yellow"
                  ? "Moderate alignment, monitor key drivers"
                  : "Low conviction, consider thesis review"}
            </Text>
          </View>

          {/* ── Actions ── */}
          <View className="flex-row gap-2 mt-3">
            {health.status !== "green" && (
              <Pressable
                onPress={() => pushRoute(router, `/(tabs)/stock/[symbol]?symbol=${health.symbol}`)}
                className="flex-row items-center gap-1.5 active:opacity-70"
              >
                <Text className="text-brand text-[12px] font-sansBold">
                  Review {health.symbol}
                </Text>
                <Icon name="arrow" size={12} color="#0E7A66" sw={2.2} />
              </Pressable>
            )}
            {health.hasBrief && (
              <Pressable
                onPress={() => pushRoute(router, "/(tabs)/watchlist")}
                className="flex-row items-center gap-1.5 ml-3 active:opacity-70"
              >
                <Text className="text-brand text-[12px] font-sansBold">
                  View briefs
                </Text>
                <Icon name="arrow" size={12} color="#0E7A66" sw={2.2} />
              </Pressable>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}

// ── Alignment gap row (new) ───────────────────────────────────────────────

function GapRow({ gap, onPress }: { gap: ThesisAlignmentGap; onPress: (symbol: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const color = ALIGNMENT_COLOR[gap.status];
  const healthStatus: HealthStatus =
    gap.convictionScore >= 70 ? "green" : gap.convictionScore >= 40 ? "yellow" : "red";

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      className="bg-bg-surface border border-line rounded-[14px] mb-2.5 overflow-hidden active:opacity-70"
    >
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            {/* Alignment dot */}
            <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <View className="flex-1">
              <View className="flex-row items-center gap-2 flex-wrap">
                <Text className="text-ink font-monoBold text-[14px]">
                  {gap.symbol}
                </Text>
                <Text
                  className="text-ink-3 text-[12px] font-sansMd flex-shrink"
                  numberOfLines={1}
                >
                  {gap.name}
                </Text>
              </View>
              <View className="flex-row items-center gap-2 mt-1">
                <Text className="text-ink-2 text-[12px] font-sansMd">
                  Target {gap.targetWeightPct}%
                </Text>
                {gap.status !== "missing" && (
                  <Text className="text-ink-3 text-[12px] font-sansMd">
                    · Actual {gap.actualWeightPct}%
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <View
              className={`${STATUS_BG[healthStatus]} px-2.5 py-1 rounded-[7px]`}
            >
              <Text
                className="text-[10px] font-sansBold uppercase tracking-wider"
                style={{ color: STATUS_COLOR[healthStatus] }}
              >
                {STATUS_LABEL[healthStatus]}
              </Text>
            </View>
            <Tag
              label={ALIGNMENT_LABEL[gap.status]}
              tone={
                gap.status === "aligned" ? "brand" : gap.status === "missing" ? "neg" : "amber"
              }
            />
            <Icon name="chev" size={14} color="#8C988F" />
          </View>
        </View>

        {/* Mini gap bar */}
        <View className="mt-2.5">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Text className="text-ink-3 text-[10px] font-sansMd">
              Target
            </Text>
            <View className="flex-1 h-1.5 bg-track rounded-full overflow-hidden">
              <View
                style={{
                  width: `${Math.min(100, gap.targetWeightPct)}%`,
                  backgroundColor: "#0E7A66",
                  height: "100%",
                  borderRadius: 999,
                }}
              />
            </View>
            <Text className="text-ink-3 text-[10px] font-monoBold">
              {gap.targetWeightPct}%
            </Text>
          </View>
          {gap.status !== "missing" && (
            <View className="flex-row items-center gap-1.5">
              <Text className="text-ink-3 text-[10px] font-sansMd">
                Actual
              </Text>
              <View className="flex-1 h-1.5 bg-track rounded-full overflow-hidden">
                <View
                  style={{
                    width: `${Math.min(100, gap.actualWeightPct)}%`,
                    backgroundColor: color,
                    height: "100%",
                    borderRadius: 999,
                  }}
                />
              </View>
              <Text className="text-ink-3 text-[10px] font-monoBold">
                {gap.actualWeightPct}%
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Expanded: triggers + actions ── */}
      {expanded && (
        <View className="px-4 pb-4 border-t border-line pt-3">
          {gap.triggers.length > 0 && (
            <>
              <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-2">
                Triggers
              </Text>
              {gap.triggers.map((t, i) => (
                <View
                  key={i}
                  className="bg-bg-surface2 rounded-[9px] px-3 py-2.5 mb-1.5"
                >
                  <View className="flex-row items-start gap-2">
                    <View
                      className="w-1.5 h-1.5 rounded-full mt-[5px]"
                      style={{ backgroundColor: color }}
                    />
                    <Text className="text-ink-2 text-[12px] font-sansMd leading-[17px] flex-1">
                      {t}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}

          <View className="mt-2 bg-bg-surface2 rounded-[9px] px-3 py-2.5">
            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-1">
              Conviction score
            </Text>
            <Text className="text-ink text-[13px] font-sansMd">
              {gap.convictionScore}/100 —{" "}
              {gap.convictionScore >= 70
                ? "Strong thesis fit across your themes and profile"
                : gap.convictionScore >= 40
                  ? "Decent fit, monitor for conviction drift"
                  : "Weak fit — may not align with your thesis profile"}
            </Text>
          </View>

          {/* Action: link to Builder or stock detail */}
          <View className="flex-row gap-2 mt-3">
            <Pressable
              onPress={() => onPress(gap.symbol)}
              className="flex-row items-center gap-1.5 active:opacity-70"
            >
              <Text className="text-brand text-[12px] font-sansBold">
                {gap.status === "missing"
                  ? `Add ${gap.symbol} to thesis`
                  : `Review ${gap.symbol} in Builder`}
              </Text>
              <Icon name="arrow" size={12} color="#0E7A66" sw={2.2} />
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Screen
// ════════════════════════════════════════════════════════════════════════════

export default function ThesisHealthScreen() {
  const router = useRouter();
  const { mode: initialMode } = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<ViewMode>(
    initialMode === "model" ? "model" : "portfolio"
  );
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const holdings = useStore((s) => s.holdings);
  const modelThesis = useStore((s) => s.modelThesis);

  // Portfolio health
  const healthData = useMemo(
    () =>
      holdings.map((h) => computeHoldingHealth(h, profile, themeIds, modelThesis)),
    [holdings, profile, themeIds, modelThesis],
  );

  const summary = useMemo(() => getPortfolioHealthSummary(healthData), [healthData]);

  // Model thesis health + alignment gap
  const alignmentGaps = useMemo(
    () =>
      modelThesis?.holdings?.length
        ? computeAlignmentGap(modelThesis.holdings, holdings, profile, themeIds)
        : [],
    [modelThesis, holdings, profile, themeIds],
  );

  const modelSummary = useMemo(() => getModelHealthSummary(alignmentGaps), [alignmentGaps]);

  const hasHoldings = holdings.length > 0;
  const hasModel = alignmentGaps.length > 0;

  const handleGapAction = (symbol: string) => {
    // Deep link to the holding's conviction details.
    // If a model thesis exists, go to the builder portfolio view where
    // the user can adjust thesis weights for this specific holding.
    // Otherwise, open the stock detail to review conviction factors there.
    if (modelThesis) {
      pushRoute(router, `/(tabs)/builder/portfolio?highlight=${symbol}`);
    } else {
      pushRoute(router, `/(tabs)/stock/[symbol]?symbol=${symbol}`);
    }
  };

  return (
    <Screen scroll padded>
      <Header title="Thesis Health" back returnTo="/(tabs)" />

      {/* ── View mode toggle ── */}
      <View className="flex-row gap-1.5 p-1 bg-track rounded-[14px] mb-5">
        {[
          { id: "portfolio" as const, label: "Your portfolio", count: summary.total },
          { id: "model" as const, label: "Thesis model", count: modelSummary.total },
        ].map((t) => {
          const on = mode === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setMode(t.id)}
              className={`flex-1 py-2.5 rounded-[11px] items-center ${
                on ? "bg-bg-surface" : ""
              }`}
              style={
                on
                  ? {
                      shadowColor: "#142F22",
                      shadowOpacity: 0.06,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 2 },
                    }
                  : undefined
              }
            >
              <Text
                className={`text-[13px] font-sansBold ${
                  on ? "text-ink" : "text-ink-3"
                }`}
              >
                {t.label}
              </Text>
              <Text
                className={`text-[11px] font-monoBold mt-0.5 ${
                  on ? "text-brand" : "text-ink-3"
                }`}
              >
                {t.count} holdings
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Portfolio view */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {mode === "portfolio" && (
        <>
          {/* Summary bar */}
          {hasHoldings && (
            <View className="flex-row gap-2 mb-5">
              <View className="flex-1 bg-pos-bg rounded-[12px] p-3 items-center">
                <Text className="text-pos font-monoBold text-[22px]">
                  {summary.greenCount}
                </Text>
                <Text className="text-pos-ink text-[10px] font-sansBold uppercase mt-0.5">
                  On track
                </Text>
              </View>
              <View className="flex-1 bg-amber-bg rounded-[12px] p-3 items-center">
                <Text className="text-amber font-monoBold text-[22px]">
                  {summary.yellowCount}
                </Text>
                <Text className="text-amber text-[10px] font-sansBold uppercase mt-0.5">
                  Watch
                </Text>
              </View>
              <View className="flex-1 bg-neg-bg rounded-[12px] p-3 items-center">
                <Text className="text-neg font-monoBold text-[22px]">
                  {summary.redCount}
                </Text>
                <Text className="text-neg-ink text-[10px] font-sansBold uppercase mt-0.5">
                  Attention
                </Text>
              </View>
            </View>
          )}

          {!hasHoldings ? (
            <View className="items-center py-14 px-6">
              <View className="w-[56px] h-[56px] rounded-[16px] bg-bg-surface2 items-center justify-center mb-4">
                <Icon name="grid" size={28} color="#8C988F" />
              </View>
              <Text className="text-ink text-[17px] font-displayX text-center">
                No holdings to monitor
              </Text>
              <Text className="text-ink-2 text-[14px] font-sansMd mt-2 text-center leading-[20px]">
                Connect accounts to see thesis health, or load demo data from the
                Accounts tab.
              </Text>
            </View>
          ) : (
            healthData.map((h) => (
              <HealthRow key={h.symbol} health={h} />
            ))
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Thesis model view */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {mode === "model" && (
        <>
          {/* Summary bars — health + alignment */}
          {hasModel && (
            <View className="mb-5 gap-y-3">
              {/* Health row */}
              <View className="flex-row gap-2">
                <View className="flex-1 bg-pos-bg rounded-[12px] p-3 items-center">
                  <Text className="text-pos font-monoBold text-[22px]">
                    {modelSummary.greenCount}
                  </Text>
                  <Text className="text-pos-ink text-[10px] font-sansBold uppercase mt-0.5">
                    On track
                  </Text>
                </View>
                <View className="flex-1 bg-amber-bg rounded-[12px] p-3 items-center">
                  <Text className="text-amber font-monoBold text-[22px]">
                    {modelSummary.yellowCount}
                  </Text>
                  <Text className="text-amber text-[10px] font-sansBold uppercase mt-0.5">
                    Watch
                  </Text>
                </View>
                <View className="flex-1 bg-neg-bg rounded-[12px] p-3 items-center">
                  <Text className="text-neg font-monoBold text-[22px]">
                    {modelSummary.redCount}
                  </Text>
                  <Text className="text-neg-ink text-[10px] font-sansBold uppercase mt-0.5">
                    Attention
                  </Text>
                </View>
              </View>

              {/* Alignment row */}
              <View className="flex-row gap-2">
                <View className="flex-1 bg-bg-surface border border-line rounded-[12px] p-3 items-center">
                  <Text className="text-ink font-monoBold text-[20px] text-brand">
                    {modelSummary.alignedCount}
                  </Text>
                  <Text className="text-ink-3 text-[10px] font-sansBold uppercase mt-0.5">
                    Aligned
                  </Text>
                </View>
                <View className="flex-1 bg-bg-surface border border-line rounded-[12px] p-3 items-center">
                  <Text className="text-ink font-monoBold text-[20px] text-amber">
                    {modelSummary.misalignedCount}
                  </Text>
                  <Text className="text-ink-3 text-[10px] font-sansBold uppercase mt-0.5">
                    Misaligned
                  </Text>
                </View>
                <View className="flex-1 bg-bg-surface border border-line rounded-[12px] p-3 items-center">
                  <Text className="text-ink font-monoBold text-[20px] text-neg">
                    {modelSummary.missingCount}
                  </Text>
                  <Text className="text-ink-3 text-[10px] font-sansBold uppercase mt-0.5">
                    Missing
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Overall alignment callout */}
          {hasModel && (
            <View className="mb-5 bg-bg-surface border border-line rounded-[14px] p-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Icon
                  name={modelSummary.missingCount + modelSummary.misalignedCount === 0 ? "sparkle" : "info"}
                  size={16}
                  color={modelSummary.missingCount + modelSummary.misalignedCount === 0 ? "#0E7A66" : "#D98512"}
                  sw={2}
                />
                <Text className="text-ink font-displayX text-[14px]">
                  {modelSummary.missingCount + modelSummary.misalignedCount === 0
                    ? "Fully aligned"
                    : `${modelSummary.missingCount + modelSummary.misalignedCount} holdings need attention`}
                </Text>
              </View>
              <Text className="text-ink-2 text-[12.5px] font-sansMd leading-[18px]">
                {modelSummary.missingCount + modelSummary.misalignedCount === 0
                  ? "Your portfolio weights match your thesis model targets. Conviction is strong across all holdings."
                  : modelSummary.missingCount > 0
                    ? `${modelSummary.missingCount} thesis holding${modelSummary.missingCount > 1 ? "s" : ""} not found in your portfolio. Add them to close the gap between your thesis and your book.`
                    : "Some holdings are over or under their thesis target weight. Rebalance to stay aligned with your conviction."}
              </Text>
              {modelSummary.missingCount + modelSummary.misalignedCount > 0 && (
                <Pressable
                  onPress={() => pushRoute(router, "/(tabs)/builder")}
                  className="flex-row items-center gap-1.5 mt-3 active:opacity-70"
                >
                  <Text className="text-brand text-[12px] font-sansBold">
                    Open Builder to adjust
                  </Text>
                  <Icon name="arrow" size={12} color="#0E7A66" sw={2.2} />
                </Pressable>
              )}
            </View>
          )}

          {!hasModel ? (
            <View className="items-center py-14 px-6">
              <View className="w-[56px] h-[56px] rounded-[16px] bg-bg-surface2 items-center justify-center mb-4">
                <Icon name="grid" size={28} color="#8C988F" />
              </View>
              <Text className="text-ink text-[17px] font-displayX text-center">
                No thesis model yet
              </Text>
              <Text className="text-ink-2 text-[14px] font-sansMd mt-2 text-center leading-[20px]">
                Build your thesis model in the Builder tab to see conviction
                health and track alignment against your real portfolio.
              </Text>
              <View className="mt-5">
                <Button
                  label="Go to Builder"
                  size="md"
                  onPress={() => pushRoute(router, "/(tabs)/builder")}
                />
              </View>
            </View>
          ) : (
            alignmentGaps.map((g) => (
              <GapRow key={g.symbol} gap={g} onPress={handleGapAction} />
            ))
          )}
        </>
      )}

      {/* ── Note ── */}
      <Text className="text-ink-3 text-[10.5px] font-sansMd leading-[15px] text-center mt-5 px-4">
        {mode === "portfolio"
          ? "Health based on conviction score, recent earnings, and price vs thesis targets. Illustrative only — not investment advice."
          : "Alignment compares your thesis model weights to actual portfolio weights. Illustrative only — not investment advice."}
      </Text>
    </Screen>
  );
}
