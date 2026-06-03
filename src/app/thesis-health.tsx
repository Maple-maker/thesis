import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Tag } from "@/components/ui/Tag";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import {
  computeHoldingHealth,
  getPortfolioHealthSummary,
  type HealthStatus,
  type HoldingHealth,
} from "@/lib/thesis-health";
import { useStore } from "@/store";

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

// ── Row component ─────────────────────────────────────────────────────────

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
            {/* Status dot */}
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

          {/* Status tag */}
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

          {/* ── Expanded: conviction info ── */}
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

          {/* ── Link to briefs ── */}
          {health.hasBrief && (
            <Pressable
              onPress={() => router.push("/(tabs)/watchlist" as any)}
              className="flex-row items-center gap-1.5 mt-3 active:opacity-70"
            >
              <Text className="text-brand text-[12px] font-sansBold">
                View briefs
              </Text>
              <Icon name="arrow" size={12} color="#0E7A66" sw={2.2} />
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────

export default function ThesisHealthScreen() {
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
  const hasHealthData = healthData.length > 0;

  return (
    <Screen scroll padded>
      <Header title="Thesis Health" back returnTo="/(tabs)" />

      {/* ── Summary bar ── */}
      {hasHealthData && (
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

      {/* ── Holdings list / empty state ── */}
      {!hasHealthData ? (
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
        <>
          {healthData.map((h) => (
            <HealthRow key={h.symbol} health={h} />
          ))}
        </>
      )}

      {/* ── Note ── */}
      <Text className="text-ink-3 text-[10.5px] font-sansMd leading-[15px] text-center mt-5 px-4">
        Health based on conviction score, recent earnings, and price vs thesis
        targets. Illustrative only — not investment advice.
      </Text>
    </Screen>
  );
}
