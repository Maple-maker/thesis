import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { Tick } from "@/components/ui/Tick";
import { Tag } from "@/components/ui/Tag";
import type { InvestorLens } from "@/data/investor-lenses";
import { symbolHistoricalReturns } from "@/data/symbol-historical-returns";
import { SPY_BENCHMARK } from "@/data/spy-benchmark";
import type { Theme } from "@/store/types";

type Props = {
  lens: InvestorLens;
  onSelect: (lens: InvestorLens) => void;
  width?: number;
};

export function TemplateCard({ lens, onSelect, width = 160 }: Props) {
  const topHoldings = lens.holdings.slice(0, 3);
  const alpha = lens.stats.return1y - SPY_BENCHMARK.trailing1y;
  const beat = alpha > 0;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(lens);
      }}
      style={{ width }}
      className="active:opacity-90"
    >
      <Card pad={14} className="h-full">
        {/* Kicker */}
        {lens.inspiredBy && (
          <Text className="text-amber text-[9px] font-sansX uppercase tracking-widest mb-1" numberOfLines={1}>
            {lens.inspiredBy}
          </Text>
        )}

        {/* Name */}
        <Text className="text-ink font-displayX text-[15px] leading-[19px] mb-1" numberOfLines={2}>
          {lens.name}
        </Text>

        {/* Bio */}
        <Text className="text-ink-2 text-[11px] font-sansMd leading-[15px] mb-2.5" numberOfLines={2}>
          {lens.subtitle}
        </Text>

        {/* Top holdings */}
        <View className="gap-y-1 mb-2.5">
          {topHoldings.map((h) => (
            <View key={h.symbol} className="flex-row items-center">
              <Tick ticker={h.symbol} size={20} />
              <Text className="text-ink text-[12px] font-monoBold ml-1.5">{h.symbol}</Text>
              <Text className="text-ink-3 text-[11px] font-sansMd ml-1">{h.weightPct}%</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-ink-3 text-[10px] font-sansMd">
            {lens.stats.holdingsCount} holdings · {lens.stats.risk}
          </Text>
          <View className={`px-1.5 py-0.5 rounded-[4px] ${beat ? "bg-pos-bg" : "bg-neg-bg"}`}>
            <Text className={`text-[10px] font-monoBold ${beat ? "text-pos" : "text-neg"}`}>
              {beat ? "+" : ""}{alpha.toFixed(1)} pts
            </Text>
          </View>
        </View>

        {/* CTA */}
        <View className="bg-brand-bg rounded-[10px] py-2 items-center">
          <Text className="text-brand text-[12px] font-sansBold">Use this model</Text>
        </View>
      </Card>
    </Pressable>
  );
}

/** Smaller card variant for themes */
export function ThemeTemplateCard({
  theme,
  onSelect,
  width = 140,
}: {
  theme: Theme;
  onSelect: (theme: Theme) => void;
  width?: number;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onSelect(theme);
      }}
      style={{ width }}
      className="active:opacity-90"
    >
      <Card pad={12}>
        {/* Color strip */}
        <View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.color,
            marginBottom: 10,
          }}
        />
        <View
          className="w-[32px] h-[32px] rounded-[9px] items-center justify-center mb-2"
          style={{ backgroundColor: `${theme.color}1A` }}
        >
          <Icon name={theme.glyph as any} size={16} color={theme.color} />
        </View>
        <Text className="text-ink font-displayX text-[14px] leading-[17px] mb-1" numberOfLines={2}>
          {theme.title}
        </Text>
        <Text className="text-ink-2 text-[11px] font-sansMd leading-[15px] mb-2" numberOfLines={2}>
          {theme.thesis}
        </Text>
        <View className="bg-brand-bg rounded-[8px] py-1.5 items-center">
          <Text className="text-brand text-[11px] font-sansBold">Explore</Text>
        </View>
      </Card>
    </Pressable>
  );
}
