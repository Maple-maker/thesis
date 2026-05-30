import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { ScoreBar } from "@/components/ui/Progress";
import { ThesisBadge } from "@/components/ui/ThesisBadge";
import { stockBySymbol } from "@/data/stocks";
import { scoreThesis, type ThesisScoreCategory } from "@/lib/thesis-score";
import { useStore } from "@/store";
import type { UserProfile } from "@/store/types";
import { HealthGauge } from "./HealthGauge";

const SUBCAT_LABELS: Record<ThesisScoreCategory, string> = {
  alignment: "Theme alignment",
  "risk-fit": "Risk fit",
  "horizon-fit": "Horizon fit",
  "income-fit": "Income fit",
  "value-fit": "Value alignment",
  "moat-quality": "Business quality",
  "growth-tilt": "Growth tilt",
};

const SUBCAT_ICONS: Record<ThesisScoreCategory, IconName> = {
  alignment: "target",
  "risk-fit": "shield",
  "horizon-fit": "compass",
  "income-fit": "piggy",
  "value-fit": "sparkle",
  "moat-quality": "moat",
  "growth-tilt": "trend",
};

export function ThesisScoreCard({ symbol }: { symbol: string }) {
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const experience = useStore((s) => s.profile.experience);

  const stock = stockBySymbol(symbol);
  const [showBreakdown, setShowBreakdown] = useState(experience === "experienced");

  const result = useMemo(() => {
    if (!stock) return null;
    return scoreThesis(stock, profile, themeIds);
  }, [stock, profile, themeIds]);

  if (!result || !stock) return null;

  return (
    <View className="mb-5">
      <ThesisBadge>
        <View className="items-center py-2">
          {/* Score gauge */}
          <HealthGauge score={result.overall} size={120} />

          {/* Top insight */}
          <Text className="text-ink text-[13px] font-sansMd text-center mt-2 leading-[18px]">
            {result.topReason}
          </Text>
          {result.topRisk && (
            <Text className="text-ink-2 text-[12px] font-sansMd text-center mt-1 leading-[17px]">
              Watch: {result.topRisk}
            </Text>
          )}

          {/* Data points used */}
          {result.dataPoints.length > 0 && (
            <View className="flex-row flex-wrap justify-center gap-x-2 mt-2.5">
              {result.dataPoints.map((dp, i) => (
                <View key={i} className="bg-bg-subtle px-2 py-1 rounded-[6px] mb-1">
                  <Text className="text-ink-3 text-[10px] font-monoSb">{dp}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Expand/collapse breakdown */}
          <Pressable
            onPress={() => setShowBreakdown((v) => !v)}
            className="flex-row items-center mt-3"
          >
            <Text className="text-brand text-[12px] font-sansBold mr-1">
              {showBreakdown ? "Hide breakdown" : "Show breakdown"}
            </Text>
            <View style={{ transform: showBreakdown ? [{ rotate: "180deg" }] : undefined }}>
              <Icon name="chevDown" size={13} color="#0E7A66" sw={2.5} />
            </View>
          </Pressable>
        </View>

        {/* Sub-score breakdown */}
        {showBreakdown && (
          <View className="mt-1 pt-3 border-t border-line gap-y-3">
            {result.breakdown.map((b) => {
              const toneColor: Record<string, string> = {
                pos: "text-pos",
                amber: "text-amber",
                neg: "text-neg",
              };
              return (
                <View key={b.category}>
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center flex-1">
                      <Icon name={SUBCAT_ICONS[b.category]} size={14} color="#4D5A54" sw={1.8} />
                      <Text className="text-ink-2 text-[12px] font-sansSb ml-1.5">
                        {SUBCAT_LABELS[b.category]}
                      </Text>
                    </View>
                    <Text className={`font-monoBold text-[13px] ${toneColor[b.tone]}`}>
                      {b.score}
                    </Text>
                  </View>
                  <ScoreBar value={b.score} height={4} />
                  <Text className="text-ink-3 text-[11px] font-sansMd mt-1 leading-[15px]">
                    {b.reason}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <Text className="text-ink-3 text-[9.5px] font-sansMd text-center mt-3 leading-[13px]">
          Score reflects profile alignment, not a recommendation. Based on illustrative data.
        </Text>
      </ThesisBadge>
    </View>
  );
}
