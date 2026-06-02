import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Tick } from "@/components/ui/Tick";
import { AllocationDonut } from "@/components/lenses/AllocationDonut";
import { lensById } from "@/data/investor-lenses";
import { etfBySymbol } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import { themeById } from "@/data/themes";
import { compareLensToBook, lensThemeFit } from "@/lib/lens-compare";
import { backtestPortfolio, formatAlpha } from "@/lib/portfolio-backtest";
import { SPY_BENCHMARK_AS_OF } from "@/data/spy-benchmark";
import { useStore } from "@/store";

const COLORS = ["#5B9BD5", "#0E7A66", "#7C3AED", "#D98512", "#D8472C", "#8C988F"];

export default function LensDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const lens = lensById(id ?? "");
  const [tab, setTab] = useState<"details" | "targets">("details");
  const holdings = useStore((s) => s.holdings);
  const themeIds = useStore((s) => s.themeIds);

  const compare = useMemo(
    () => (lens ? compareLensToBook(lens, holdings, themeIds) : null),
    [lens, holdings, themeIds]
  );

  const lensBacktest = useMemo(
    () => (lens ? backtestPortfolio(lens.holdings) : null),
    [lens]
  );

  const donutSlices = useMemo(
    () =>
      lens?.holdings.map((h, i) => ({
        pct: h.weightPct,
        color: COLORS[i % COLORS.length],
      })) ?? [],
    [lens]
  );

  if (!lens) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
        <Text className="text-ink font-sansBold text-center">Lens not found</Text>
        <View className="mt-4 w-full">
          <Button label="Back" fullWidth onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#0A1628" }}>
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-full bg-white/10 items-center justify-center mr-3"
        >
          <Icon name="back" size={16} color="#FFFFFF" sw={2} />
        </Pressable>
        <View className="flex-1 flex-row justify-center gap-6">
          {(["details", "targets"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)}>
              <Text
                className={`text-[15px] font-sansBold capitalize ${
                  tab === t ? "text-white" : "text-white/50"
                }`}
              >
                {t === "details" ? "Details" : "Targets"}
              </Text>
              {tab === t && <View className="h-[2px] bg-brand mt-1 rounded-full" />}
            </Pressable>
          ))}
        </View>
        <View className="w-[36px]" />
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-white font-displayX text-[28px] mt-2" style={{ letterSpacing: -0.6 }}>
          {lens.name}
        </Text>
        {lens.inspiredBy ? (
          <View className="self-start mt-2">
            <Tag label={`Inspired by ${lens.inspiredBy}`} tone="meta" />
          </View>
        ) : null}
        <Text className="text-white/70 text-[13px] font-sansMd mt-1">{lens.subtitle}</Text>

        <View className="flex-row flex-wrap gap-2 mt-4">
          {lens.holdings.slice(0, 5).map((h) => (
            <Tick key={h.symbol} ticker={h.symbol} size={36} color={COLORS[0]} />
          ))}
          {lens.holdings.length > 5 && (
            <View className="w-[36px] h-[36px] rounded-full bg-white/20 items-center justify-center">
              <Text className="text-white font-monoBold text-[11px]">+{lens.holdings.length - 5}</Text>
            </View>
          )}
        </View>

        <Text className="text-white/85 text-[14px] font-sansMd leading-[21px] mt-4">{lens.bio}</Text>

        {tab === "details" ? (
          <View className="mt-6">
            <DarkSectionTitle>Stats</DarkSectionTitle>
            <Card pad={0} className="overflow-hidden mt-2 bg-white/5 border-white/10">
              <StatRow label="Holdings" value={String(lens.stats.holdingsCount)} />
              <StatRow label="Blended expenses" value={`${lens.stats.expensePct}%`} />
              <StatRow label="Dividend yield" value={`${lens.stats.dividendYieldPct}%`} />
              <StatRow label="Risk" value={lens.stats.risk} last />
            </Card>

            <DarkSectionTitle className="mt-6">Backtest vs S&P 500</DarkSectionTitle>
            <Text className="text-white/50 text-[11px] font-sansMd mb-2">
              Weighted model returns as of {SPY_BENCHMARK_AS_OF} · benchmark SPY. {lens.performanceNote}
            </Text>
            {lensBacktest && (
              <Card pad={14} className="bg-white/5 border-white/10">
                <PerfRow label="1 year (model)" pct={lensBacktest.portfolio.trailing1y} />
                <PerfRow
                  label="vs SPY 1Y"
                  pct={lensBacktest.alpha.trailing1y}
                  suffix=" pts"
                />
                <PerfRow label="3 year ann." pct={lensBacktest.portfolio.ann3y} />
                <PerfRow label="5 year ann." pct={lensBacktest.portfolio.ann5y} />
                <PerfRow
                  label="vs SPY 5Y"
                  pct={lensBacktest.alpha.ann5y}
                  suffix=" pts ann."
                />
                <Text className="text-white/45 text-[10px] font-sansMd mt-3 leading-[14px]">
                  {formatAlpha(lensBacktest.alpha.trailing1y)} on 1Y ·{" "}
                  {lensBacktest.disclaimer}
                </Text>
              </Card>
            )}

            <DarkSectionTitle className="mt-6">Methodology</DarkSectionTitle>
            <View className="mt-2 gap-y-2">
              {lens.methodology.map((m, i) => (
                <View key={i} className="flex-row">
                  <Text className="text-brand mr-2">•</Text>
                  <Text className="text-white/80 text-[14px] font-sansMd flex-1 leading-[20px]">{m}</Text>
                </View>
              ))}
            </View>

            {compare && (
              <Card pad={14} className="mt-6 bg-white/5 border-white/10">
                <Text className="text-brand text-[11px] font-sansX uppercase tracking-wider mb-1">
                  vs your book
                </Text>
                <Text className="text-white font-monoBold text-[22px]">{compare.alignmentScore}/100</Text>
                <Text className="text-white/75 text-[13px] font-sansMd mt-1 leading-[19px]">
                  {compare.summary}
                </Text>
                <Text className="text-white/50 text-[12px] font-sansMd mt-2">
                  Thesis fit: {lens ? lensThemeFit(lens, themeIds) : ""}
                </Text>
                {compare.gaps.length > 0 && (
                  <View className="mt-3 gap-y-1">
                    {compare.gaps.slice(0, 2).map((g) => (
                      <Text key={g.symbol} className="text-white/70 text-[12px] font-sansMd">
                        · {g.message}
                      </Text>
                    ))}
                  </View>
                )}
              </Card>
            )}
          </View>
        ) : (
          <View className="mt-6">
            <DarkSectionTitle>Target weights</DarkSectionTitle>
            <AllocationDonut
              slices={donutSlices}
              centerLabel={`${lens.holdings.length} names`}
            />
            {lens.holdings.map((h, i) => {
              const stock = stockBySymbol(h.symbol);
              const etf = etfBySymbol(h.symbol);
              const name = stock?.name ?? etf?.name ?? h.symbol;
              return (
                <View
                  key={h.symbol}
                  className="flex-row items-center py-3 border-b border-white/10"
                >
                  <View
                    className="w-1 h-10 rounded-full mr-3"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <Tick ticker={h.symbol} size={32} color={COLORS[i % COLORS.length]} />
                  <View className="flex-1 ml-3">
                    <Text className="text-white font-monoBold text-[14px]">{h.symbol}</Text>
                    <Text className="text-white/60 text-[12px] font-sansMd" numberOfLines={1}>
                      {name}
                    </Text>
                  </View>
                  <Text className="text-white font-monoBold text-[16px]">{h.weightPct}%</Text>
                </View>
              );
            })}
            <View className="flex-row flex-wrap gap-1.5 mt-4">
              {lens.themeIds.map((tid) => {
                const t = themeById(tid);
                return t ? <Tag key={tid} label={t.title} tone="brand" /> : null;
              })}
            </View>
          </View>
        )}

        <Text className="text-white/40 text-[11px] font-sansMd text-center mt-8 leading-[16px]">
          {lens.disclaimer}
        </Text>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3 bg-[#0A1628]/95">
        <View className="flex-row gap-2 mb-2">
          <View className="flex-1">
            <Button
              label="Use this model"
              fullWidth
              size="lg"
              variant="primary"
              onPress={() => {
                useStore.getState().adoptLens(lens.id);
                router.push("/(tabs)/builder/portfolio" as any);
              }}
            />
          </View>
        </View>
        <Button
          label="Compare to my book"
          fullWidth
          size="md"
          variant="secondary"
          onPress={() => router.push("/xray" as any)}
        />
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/duel",
              params: { a: `lens:${lens.id}`, b: "portfolio:my" },
            } as never)
          }
          className="mt-2 py-3 items-center"
        >
          <Text className="text-brand text-[14px] font-sansBold">Duel this lens vs my book →</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            const [a, b] = lens.holdings;
            if (a && b) {
              router.push({
                pathname: "/duel",
                params: { a: a.symbol, b: b.symbol },
              } as never);
            }
          }}
          className="mt-1 py-2 items-center"
        >
          <Text className="text-ink-3 text-[13px] font-sansBold">Duel top two holdings</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function DarkSectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Text className={`text-white font-displayX text-[19px] mb-3 ${className ?? ""}`}>
      {children}
    </Text>
  );
}

function StatRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      className={`flex-row justify-between px-4 py-3.5 ${last ? "" : "border-b border-white/10"}`}
    >
      <Text className="text-white/60 text-[14px] font-sansMd">{label}</Text>
      <Text className="text-white font-sansBold text-[14px]">{value}</Text>
    </View>
  );
}

function PerfRow({
  label,
  pct,
  suffix = "%",
}: {
  label: string;
  pct: number;
  suffix?: string;
}) {
  return (
    <View className="flex-row justify-between py-2">
      <Text className="text-white/70 font-sansMd">{label}</Text>
      <Text className={`font-monoBold text-[15px] ${pct >= 0 ? "text-pos" : "text-neg"}`}>
        {pct >= 0 ? "+" : ""}
        {pct}
        {suffix}
      </Text>
    </View>
  );
}
