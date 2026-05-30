import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import { Tick } from "@/components/ui/Tick";
import { stockBySymbol } from "@/data/stocks";
import { suggestEtfForWatchlist } from "@/lib/etf-overlap";
import { useStore } from "@/store";

export default function WatchlistScreen() {
  const router = useRouter();
  const watchlist = useStore((s) => s.watchlist);
  const toggle = useStore((s) => s.toggleWatchlist);

  const stocks = watchlist.map(stockBySymbol).filter(Boolean) as NonNullable<
    ReturnType<typeof stockBySymbol>
  >[];

  const etfSuggestions = useMemo(
    () => suggestEtfForWatchlist(watchlist, 2),
    [watchlist]
  );

  if (stocks.length === 0) {
    return (
      <Screen padded>
        <Header
          title="Watchlist"
          subtitle="Nothing here yet — start with your themes."
        />
        <Card pad={28} className="mt-4 items-center">
          <View className="bg-brand-bg w-16 h-16 rounded-[16px] items-center justify-center">
            <Icon name="flag" size={28} color="#0E7A66" />
          </View>
          <Text className="text-ink text-[16px] font-sansBold text-center mt-4">
            Add stocks you're curious about
          </Text>
          <Text className="text-ink-2 text-[13.5px] font-sansMd text-center mt-1 leading-[19px]">
            We'll surface duels and ETF alternatives as your list grows.
          </Text>
          <View className="mt-5 w-full">
            <Button
              label="Browse themes"
              fullWidth
              size="md"
              onPress={() => router.push("/(tabs)/themes")}
            />
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen padded>
      <Header
        title="Watchlist"
        subtitle={`${stocks.length} ${stocks.length === 1 ? "name" : "names"} you're tracking.`}
        right={
          stocks.length >= 2 ? (
            <Pressable
              onPress={() => router.push("/duel")}
              className="bg-brand px-3.5 h-9 items-center justify-center rounded-[12px] flex-row"
              style={{
                shadowColor: "#0E7A66",
                shadowOpacity: 0.25,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <Icon name="compare" size={15} color="#FFFFFF" sw={2.2} />
              <Text className="text-white font-sansX text-[13px] ml-1.5">Duel</Text>
            </Pressable>
          ) : null
        }
      />

      <View className="gap-y-2.5 mt-1">
        {stocks.map((s) => (
          <Card key={s.symbol} pad={14}>
            <View className="flex-row items-center">
              <Pressable
                onPress={() => router.push({ pathname: "/(tabs)/stock/[symbol]", params: { symbol: s.symbol } })}
                className="flex-row items-center flex-1"
              >
                <Tick ticker={s.symbol} size={42} />
                <View className="ml-3 flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-ink font-monoBold text-[14px]">
                      {s.symbol}
                    </Text>
                    <View className="w-[3px] h-[3px] rounded-full bg-ink-3 mx-1.5" />
                    <Text className="text-ink-3 text-[11px] font-sansSb uppercase tracking-wider">
                      {s.sector}
                    </Text>
                  </View>
                  <Text className="text-ink text-[14px] font-sansSb mt-0.5">
                    {s.name}
                  </Text>
                  <View className="flex-row gap-x-1.5 mt-1.5">
                    {s.tags.slice(0, 2).map((t) => (
                      <Tag key={t} label={t} />
                    ))}
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={() => toggle(s.symbol)}
                hitSlop={10}
                className="ml-2 p-2"
              >
                <Icon name="close" size={18} color="#8C988F" sw={1.8} />
              </Pressable>
            </View>
          </Card>
        ))}
      </View>

      {etfSuggestions.length > 0 && (
        <View className="mt-7">
          <SectionTitle>ETFs that cover your list</SectionTitle>
          <View className="gap-y-2.5">
            {etfSuggestions.map(({ etf, covered }) => (
              <Card key={etf.symbol} pad={14}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="bg-violet-bg w-[40px] h-[40px] rounded-[11px] items-center justify-center mr-3">
                      <Icon name="grid" size={19} color="#7C3AED" />
                    </View>
                    <View>
                      <Text className="text-ink font-monoBold text-[14px]">
                        {etf.symbol}
                      </Text>
                      <Text className="text-ink-3 text-[12px] font-sansSb mt-0.5">
                        {etf.name}
                      </Text>
                    </View>
                  </View>
                  <Tag
                    label={`Covers ${covered.length}`}
                    tone="brand"
                  />
                </View>
                <Text className="text-ink-2 text-[12.5px] font-sansMd mt-3 leading-[18px]">
                  {etf.description}
                </Text>
                <Text className="text-ink-3 text-[11px] font-sansMd mt-2">
                  Expense {etf.expense}% · Holds: {covered.join(", ")}
                </Text>
              </Card>
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}
