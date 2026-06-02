import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { lensesByCategory } from "@/data/investor-lenses";
import { themeById } from "@/data/themes";

function LensCard({
  lens,
  onPress,
}: {
  lens: ReturnType<typeof lensesByCategory>[number];
  onPress: () => void;
}) {
  const theme = themeById(lens.themeIds[0]);
  const topHoldings = lens.holdings.slice(0, 4).map((h) => h.symbol).join(", ");
  return (
    <Pressable onPress={onPress} className="active:opacity-85">
      <Card pad={16}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3 min-w-0">
            {lens.inspiredBy && (
              <Text className="text-amber text-[10px] font-sansX uppercase tracking-widest mb-1" numberOfLines={1}>
                {lens.inspiredBy}
              </Text>
            )}
            <Text className="text-ink font-sansBold text-[16px]" numberOfLines={2}>{lens.name}</Text>
            <Text className="text-ink-3 text-[12px] font-sansMd mt-0.5" numberOfLines={2}>{lens.subtitle}</Text>
            <Text className="text-ink-2 text-[13px] font-sansMd mt-2 leading-[19px]" numberOfLines={2}>
              {lens.bio}
            </Text>
            {theme && (
              <Text className="text-brand text-[11px] font-sansX uppercase tracking-wider mt-2" numberOfLines={1}>
                {theme.kicker}
              </Text>
            )}
          </View>
          <Icon name="chev" size={18} color="#8C988F" sw={2} />
        </View>
        <View className="mt-3 pt-3 border-t border-line/60">
          <Text className="text-ink-3 text-[11px] font-sansMd">
            {lens.stats.holdingsCount} holdings · {lens.stats.expensePct}% blended expense · {lens.stats.risk} risk
          </Text>
          {topHoldings ? (
            <Text className="text-ink-3 text-[10px] font-monoSb mt-1" numberOfLines={1}>
              {topHoldings}
            </Text>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

export default function LensesIndexScreen() {
  const router = useRouter();
  const famous = lensesByCategory("famous");
  const themes = lensesByCategory("theme");

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
            Model portfolios
          </Text>
          <Text className="text-ink font-displayX text-[26px]" style={{ letterSpacing: -0.5 }}>
            Investor lenses
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-ink-2 text-[14px] font-sansMd leading-[21px] mb-5">
          Learn from famous allocation styles and Thesis themes, compare target weights to your book,
          not copy-trading.
        </Text>

        <Text className="text-ink text-[15px] font-displayX mb-2">Learn from the best</Text>
        <Text className="text-ink-3 text-[12px] font-sansMd mb-3 leading-[17px]">
          Illustrative shapes inspired by public philosophies, filings, and disclosures, always lagged
          and simplified.
        </Text>
        <View className="gap-y-3 mb-6">
          {famous.map((lens) => (
            <LensCard
              key={lens.id}
              lens={lens}
              onPress={() => router.push(`/lenses/${lens.id}` as any)}
            />
          ))}
        </View>

        <Text className="text-ink text-[15px] font-displayX mb-2">Thesis themes</Text>
        <Text className="text-ink-3 text-[12px] font-sansMd mb-3 leading-[17px]">
          Macro and sector theses turned into target allocations.
        </Text>
        <View className="gap-y-3">
          {themes.map((lens) => (
            <LensCard
              key={lens.id}
              lens={lens}
              onPress={() => router.push(`/lenses/${lens.id}` as any)}
            />
          ))}
        </View>

        <Text className="text-ink-3 text-[11px] text-center font-sansMd leading-[16px] mt-6">
          Illustrative model portfolios. Not investment advice. No live trading or basket purchases.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
