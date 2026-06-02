import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import { Tick } from "@/components/ui/Tick";
import { climateById } from "@/data/investing-climates";
import { themeById } from "@/data/themes";
import { climatePicksResolved } from "@/lib/climate-explorer";

export default function ExploreClimateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const climate = climateById(id ?? "");

  if (!climate) {
    return (
      <Screen padded>
        <Header back title="Climate not found" />
        <Button label="Back to Thesis Studio" onPress={() => router.replace("/thesis-studio")} />
      </Screen>
    );
  }

  const { favor, avoid } = climatePicksResolved(climate);

  return (
    <Screen padded>
      <Header back title={climate.title} subtitle="Investing climate" />

      <Card pad={16} className="mb-5 border-violet/20 bg-violet-bg/30">
        <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest mb-2">
          Example headline
        </Text>
        <Text className="text-ink font-sansBold text-[15px] leading-[21px]">
          {climate.exampleHeadline}
        </Text>
        <Text className="text-ink-2 text-[13px] font-sansMd mt-3 leading-[19px]">
          {climate.summary}
        </Text>
        <Text className="text-brand text-[13px] font-sansBold mt-3 leading-[19px]">
          {climate.implication}
        </Text>
      </Card>

      <View className="flex-row flex-wrap gap-1.5 mb-5">
        {climate.themeIds.map((tid) => {
          const t = themeById(tid);
          if (!t) return null;
          return <Tag key={tid} label={t.title} tone="brand" />;
        })}
      </View>

      <SectionTitle>Favor in this climate</SectionTitle>
      <Card pad={6} className="mb-5">
        {favor.map((pick, i) => (
          <Pressable
            key={pick.symbol}
            onPress={() =>
              router.push({
                pathname: pick.kind === "etf" ? "/(tabs)/etf/[symbol]" : "/(tabs)/stock/[symbol]",
                params: { symbol: pick.symbol },
              } as never)
            }
            className={`flex-row items-start px-3 py-3 active:opacity-60 ${
              i < favor.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <Tick ticker={pick.symbol} size={36} />
            <View className="flex-1 ml-2.5">
              <View className="flex-row items-center gap-2">
                <Text className="text-ink font-monoBold text-[13px]">{pick.symbol}</Text>
                {!pick.found && (
                  <Tag label="Add to catalog" tone="amber" />
                )}
              </View>
              <Text className="text-ink text-[13px] font-sansBold mt-0.5" numberOfLines={1}>
                {pick.name}
              </Text>
              <Text className="text-ink-2 text-[11.5px] font-sansMd mt-1 leading-[16px]">
                {pick.reason}
              </Text>
            </View>
            <Icon name="chev" size={14} color="#8C988F" />
          </Pressable>
        ))}
      </Card>

      <SectionTitle>Consider avoiding</SectionTitle>
      <Text className="text-ink-2 text-[12px] font-sansMd -mt-2 mb-3 leading-[17px]">
        Educational framing, not a sell recommendation.
      </Text>
      <Card pad={6} className="mb-6">
        {avoid.map((pick, i) => (
          <View
            key={pick.symbol}
            className={`px-3 py-3 ${i < avoid.length - 1 ? "border-b border-line" : ""}`}
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-ink font-monoBold text-[13px]">{pick.symbol}</Text>
              <Tag label="Avoid tilt" tone="neg" />
            </View>
            <Text className="text-ink-2 text-[12px] font-sansMd mt-1 leading-[17px]">
              {pick.reason}
            </Text>
          </View>
        ))}
      </Card>

      <Button
        label="Build weighted thesis from this climate"
        fullWidth
        size="lg"
        variant="primary"
        onPress={() =>
          router.push({
            pathname: "/thesis-studio",
            params: { climateId: climate.id },
          } as never)
        }
      />
      <View className="mt-3 mb-4">
        <Button
          label="Ask Thesis about this headline"
          fullWidth
          size="md"
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: "/ask/chat",
              params: { seed: climate.askSeed },
            } as never)
          }
        />
      </View>
    </Screen>
  );
}
