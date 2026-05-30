import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import { InsightCard } from "@/components/ui/InsightCard";
import { Sparkline } from "@/components/ui/Sparkline";
import { ThesisScoreCard } from "@/components/ui/ThesisScoreCard";
import { Tick } from "@/components/ui/Tick";
import { ETFS } from "@/data/etfs";
import { insightForSymbol } from "@/data/context-insights";
import { priceHistory } from "@/data/price-data";
import { stockBySymbol } from "@/data/stocks";
import { themeById } from "@/data/themes";
import { useStore } from "@/store";

export default function StockDetail() {
  const params = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const watchlist = useStore((s) => s.watchlist);
  const toggle = useStore((s) => s.toggleWatchlist);

  const stock = stockBySymbol(params.symbol ?? "");

  // All hooks must be called before any conditional return
  const insight = stock ? insightForSymbol(stock.symbol) : undefined;
  const sparkData = stock ? priceHistory(stock.symbol) : undefined;
  const containingETFs = useMemo(
    () => stock ? ETFS.filter((e) => e.holdings.includes(stock.symbol)).slice(0, 4) : [],
    [stock?.symbol]
  );

  if (!stock) {
    return (
      <Screen padded>
        <Header back title="Stock not found" />
      </Screen>
    );
  }
  const watching = watchlist.includes(stock.symbol);

  return (
    <Screen padded>
      <Header back />

      {/* Header card */}
      <View className="flex-row items-center mt-1 mb-5">
        <Tick ticker={stock.symbol} size={62} />
        <View className="ml-3.5 flex-1">
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
            {stock.sector}
          </Text>
          <Text
            className="text-ink text-[28px] font-displayX mt-0.5"
            style={{ letterSpacing: -0.6, lineHeight: 31 }}
          >
            {stock.symbol}
          </Text>
          <Text className="text-ink-2 text-[14.5px] font-sansSb">{stock.name}</Text>
        </View>
      </View>

      {/* Thesis */}
      <Card pad={16} className="mb-4">
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
          Thesis
        </Text>
        <Text className="text-ink text-[15px] font-sansSb leading-[22px]">
          {stock.thesis}
        </Text>
      </Card>

      <ThesisScoreCard symbol={stock.symbol} />

      {insight && (
        <View className="mb-5">
          <InsightCard
            headline={insight.headline}
            attribution={insight.kicker ?? "Thesis lens · illustrative"}
            body={insight.body}
            whyItMatters={insight.whyItMatters}
            watch={insight.watch}
            chips={insight.chips}
          />
        </View>
      )}

      {/* Stats grid */}
      <View className="flex-row gap-x-2 mb-5">
        <Stat label="Mkt Cap" value={`$${stock.marketCap}B`} />
        <Stat
          label="Dividend"
          value={stock.divYield > 0 ? `${stock.divYield}%` : "—"}
        />
        <Stat label="P/E" value={stock.peRatio ? String(stock.peRatio) : "—"} />
        <Stat label="Vol" value={stock.volatility} />
      </View>

      {/* Price trend sparkline */}
      {sparkData && (
        <Card pad={14} className="mb-5">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-ink-3 text-[10.5px] font-sansX uppercase tracking-widest">
              1-year price trend
            </Text>
            <Text className="text-ink-3 text-[10px] font-monoSb">
              {sparkData[0]} → {sparkData[sparkData.length - 1]}
            </Text>
          </View>
          <Sparkline data={sparkData} color="#0E7A66" height={52} fill />
        </Card>
      )}

      {/* Tags */}
      <View className="mb-6">
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
          Tags
        </Text>
        <View className="flex-row flex-wrap gap-1.5">
          {stock.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </View>
      </View>

      {/* Themes */}
      <SectionTitle>Themes</SectionTitle>
      <View className="gap-y-2 mb-6">
        {stock.themes.map((tid) => {
          const t = themeById(tid);
          if (!t) return null;
          return (
            <Pressable
              key={tid}
              onPress={() => router.push({ pathname: "/(tabs)/theme/[id]", params: { id: tid } })}
              className="flex-row items-center bg-bg-surface border border-line rounded-[14px] p-3"
            >
              <View
                className="items-center justify-center mr-3"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  backgroundColor: `${t.color}1F`,
                }}
              >
                <Icon name={t.glyph as IconName} size={19} color={t.color} />
              </View>
              <View className="flex-1">
                <Text className="text-ink-3 text-[10.5px] font-sansX uppercase tracking-wider">
                  {t.kicker}
                </Text>
                <Text
                  className="text-ink font-displayX text-[15px] mt-0.5"
                  style={{ letterSpacing: -0.2 }}
                >
                  {t.title}
                </Text>
              </View>
              <Icon name="chev" size={18} color="#8C988F" />
            </Pressable>
          );
        })}
      </View>

      {/* ETFs */}
      {containingETFs.length > 0 && (
        <>
          <SectionTitle>ETFs that hold {stock.symbol}</SectionTitle>
          <View className="gap-y-2 mb-6">
            {containingETFs.map((etf) => (
              <Card key={etf.symbol} pad={12}>
                <View className="flex-row items-center">
                  <View className="bg-violet-bg w-[36px] h-[36px] rounded-[10px] items-center justify-center mr-3">
                    <Icon name="grid" size={18} color="#7C3AED" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-ink font-monoBold text-[13px]">
                        {etf.symbol}
                      </Text>
                      <Text className="text-ink-3 text-[11px] font-sansMd ml-2">
                        {etf.expense}%
                      </Text>
                    </View>
                    <Text className="text-ink-2 text-[12.5px] font-sansSb mt-0.5">
                      {etf.name}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </>
      )}

      <View className="mb-2">
        <Button
          label={watching ? "Remove from watchlist" : "Add to watchlist"}
          fullWidth
          size="lg"
          variant={watching ? "secondary" : "primary"}
          leftAdornment={
            <Icon
              name={watching ? "check" : "plus"}
              size={18}
              color={watching ? "#16201C" : "#FFFFFF"}
              sw={2.3}
            />
          }
          onPress={() => toggle(stock.symbol)}
        />
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View
      className="flex-1 bg-bg-surface border border-line rounded-[12px] p-3"
      style={{
        shadowColor: "#142F22",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider">
        {label}
      </Text>
      <Text className="text-ink font-monoBold text-[13px] mt-1">{value}</Text>
    </View>
  );
}
