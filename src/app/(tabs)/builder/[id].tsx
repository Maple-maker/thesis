import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ScoreBar } from "@/components/ui/Progress";
import { ProConChip } from "@/components/ui/Tag";
import { MetricChip } from "@/components/ui/MetricChip";
import { Tick } from "@/components/ui/Tick";
import { ThemeId } from "@/store/types";
import { EtfListRow } from "@/components/EtfListRow";
import { ETFS } from "@/data/etfs";
import { STOCKS, stockBySymbol } from "@/data/stocks";
import { NotFoundState } from "@/components/NotFoundState";
import { youtubeForNotFound } from "@/data/youtube-resources";
import { themeById } from "@/data/themes";
import { personaForTheme } from "@/data/thesis-personas";
import { scoreThesis } from "@/lib/thesis-score";
import { rankStocksForTheme } from "@/lib/theme-engine";
import { useStore } from "@/store";
import { backtestForTheme, BACKTEST_DISCLAIMER } from "@/data/thesis-backtest-mock";
import { canAdoptTheme, THESIS_LIMIT_COPY } from "@/lib/thesis-limits";

export default function BuilderDetail() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);

  const theme = themeById(params.id ?? "");
  const persona = personaForTheme((params.id ?? "") as ThemeId);

  // All hooks before conditional return
  const stocks = useMemo(
    () => (theme ? rankStocksForTheme(theme.id as ThemeId, profile, 8) : []),
    [theme?.id, profile]
  );
  const scoredStocks = useMemo(
    () =>
      stocks
        .map((s) => ({ stock: s, result: scoreThesis(s, profile, themeIds) }))
        .sort((a, b) => b.result.overall - a.result.overall),
    [stocks, profile, themeIds]
  );
  const avgAlignment = useMemo(() => {
    if (!persona) return null;
    const scores = persona.modelStocks
      .map((sym) => stockBySymbol(sym))
      .filter(Boolean)
      .map((s) => scoreThesis(s!, profile, themeIds).overall);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [persona, profile, themeIds]);

  const backtest = useMemo(
    () => (theme ? backtestForTheme(theme.id as ThemeId) : undefined),
    [theme?.id]
  );

  if (!theme || !persona) {
    const query = (params.id ?? "").trim();
    return (
      <Screen padded>
        <Header back />
        <NotFoundState
          title="Thesis not found"
          query={query || undefined}
          message="Pick a thesis from Library first, then open the builder from that theme."
          videos={youtubeForNotFound("builder", query)}
          primaryLabel="Open Library"
          onPrimary={() => router.push("/(tabs)/themes")}
        />
      </Screen>
    );
  }

  const isAdopted = themeIds.includes(theme.id);
  const canAdopt = canAdoptTheme(themeIds, theme.id as ThemeId);
  const etfs = ETFS.filter((e) => e.themes.includes(theme.id as ThemeId)).slice(0, 3);

  return (
    <Screen padded>
      <Header back />

      {/* Hero */}
      <View className="overflow-hidden mt-1 mb-5" style={{ borderRadius: 22 }}>
        <LinearGradient
          colors={[theme.color, darken(theme.color, 0.5)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 22 }}
        >
          <View style={{ position: "absolute", right: -20, bottom: -25, opacity: 0.12 }}>
            <Icon name={theme.glyph as IconName} size={150} sw={1} color="#FFFFFF" />
          </View>
          <View className="relative">
            <View className="flex-row items-center self-start bg-white/20 px-2.5 py-1 rounded-[9px] mb-3">
              <Icon name="sparkle" size={13} color="#FFFFFF" />
              <Text className="text-white text-[11px] font-sansX uppercase tracking-wider ml-1.5">
                {persona.personaName}
              </Text>
            </View>
            <Text className="text-white/95 text-[18px] font-displayX leading-[24px] mb-3" style={{ letterSpacing: -0.3 }}>
              "{persona.philosophy}"
            </Text>
            <Text className="text-white text-[14px] font-sansBold opacity-90">
              {theme.title}
            </Text>
            <Text className="text-white/75 text-[12px] font-sansMd mt-0.5">
              {persona.tagline}
            </Text>

            {/* Risk + horizon chips */}
            <View className="flex-row gap-x-1.5 mt-3">
              <MetricChip label="Risk" delta={persona.riskLevel} tone={persona.riskLevel === "low" ? "pos" : persona.riskLevel === "high" ? "neg" : "neutral"} />
              <MetricChip label="Horizon" delta={persona.timeHorizon} tone="neutral" />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Adopt / remove */}
      <View className="mb-5">
        {!canAdopt && !isAdopted && (
          <Text className="text-ink-2 text-[12px] font-sansMd mb-2 leading-[17px]">
            {THESIS_LIMIT_COPY.atCapacity}
          </Text>
        )}
        <Button
          label={isAdopted ? "Remove from thesis" : "Adopt this thesis"}
          fullWidth
          size="lg"
          variant={isAdopted ? "secondary" : "primary"}
          disabled={!canAdopt && !isAdopted}
          leftAdornment={
            <Icon name={isAdopted ? "check" : "plus"} size={18} color={isAdopted ? "#16201C" : "#FFFFFF"} sw={2.3} />
          }
          onPress={() => {
            const ok = useStore.getState().toggleTheme(theme.id as ThemeId);
            if (!ok) {
              Alert.alert(THESIS_LIMIT_COPY.headline, THESIS_LIMIT_COPY.atCapacity);
            }
          }}
        />
      </View>

      {/* Exposure breakdown */}
      <SectionTitle>Allocation model</SectionTitle>
      <Card pad={16} className="mb-5">
        <View className="gap-y-3">
          {persona.modelAllocation.map((a, i) => (
            <View key={i}>
              <View className="flex-row justify-between mb-1">
                <Text className="text-ink text-[13px] font-sansSb">{a.label}</Text>
                <Text className="text-ink font-monoBold text-[12px]">{a.pct}%</Text>
              </View>
              <ScoreBar value={a.pct} height={6} />
            </View>
          ))}
        </View>
        <View className="flex-row flex-wrap gap-1.5 mt-4">
          {persona.exposureTags.map((tag) => (
            <MetricChip key={tag} label={tag} delta="" />
          ))}
        </View>
      </Card>

      {/* Pros & Cons */}
      <SectionTitle>Strengths & risks</SectionTitle>
      <View className="flex-row mb-5" style={{ marginHorizontal: -4 }}>
        {/* Pros */}
        <View style={{ flex: 1, paddingHorizontal: 4 }}>
          <Card pad={14}>
            <View className="flex-row items-center mb-3">
              <Icon name="check" size={14} color="#149059" sw={2.5} />
              <Text className="text-ink text-[12px] font-sansX uppercase tracking-wider ml-2">
                Strengths
              </Text>
            </View>
            {persona.pros.map((pro, i) => (
              <View key={i} className="flex-row items-start mb-2.5 last:mb-0">
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#14905966", marginTop: 6, marginRight: 7 }} />
                <Text className="text-ink-2 text-[12px] font-sansMd leading-[17px] flex-1">
                  {pro}
                </Text>
              </View>
            ))}
          </Card>
        </View>
        {/* Cons */}
        <View style={{ flex: 1, paddingHorizontal: 4 }}>
          <Card pad={14}>
            <View className="flex-row items-center mb-3">
              <Icon name="info" size={14} color="#D98512" sw={2.5} />
              <Text className="text-ink text-[12px] font-sansX uppercase tracking-wider ml-2">
                Risks
              </Text>
            </View>
            {persona.cons.map((con, i) => (
              <View key={i} className="flex-row items-start mb-2.5 last:mb-0">
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#D9851266", marginTop: 6, marginRight: 7 }} />
                <Text className="text-ink-2 text-[12px] font-sansMd leading-[17px] flex-1">
                  {con}
                </Text>
              </View>
            ))}
          </Card>
        </View>
      </View>

      {/* Model stocks */}
      <SectionTitle>Model portfolio</SectionTitle>
      <Card pad={6} className="mb-5">
        {persona.modelStocks.map((sym, i) => {
          const s = stockBySymbol(sym);
          if (!s) return null;
          return (
            <Pressable
              key={sym}
              onPress={() => router.push({ pathname: "/(tabs)/stock/[symbol]", params: { symbol: sym } })}
              className={`flex-row items-center px-3 py-3 ${
                i < persona.modelStocks.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <Tick ticker={sym} size={38} />
              <View className="ml-3 flex-1">
                <Text className="text-ink text-[14px] font-sansBold">{s.name}</Text>
                <Text className="text-ink-3 text-[11.5px] font-sansMd mt-0.5" numberOfLines={1}>
                  {s.thesis}
                </Text>
              </View>
              <Icon name="chev" size={14} color="#8C988F" />
            </Pressable>
          );
        })}
      </Card>

      {/* Model ETFs */}
      <SectionTitle>How to invest</SectionTitle>
      <View className="gap-y-2 mb-5">
        {persona.modelETFs.map((sym) => {
          const etf = ETFS.find((e) => e.symbol === sym);
          if (!etf) return null;
          return <EtfListRow key={sym} etf={etf} />;
        })}
      </View>

      {/* Fit check */}
      {avgAlignment !== null && (
        <View className="mb-5">
          <SectionTitle>How this fits your profile</SectionTitle>
          <Card pad={16}>
            <View className="flex-row items-center">
              <View
                className="w-[48px] h-[48px] rounded-[14px] items-center justify-center mr-4"
                style={{
                  backgroundColor:
                    avgAlignment >= 70 ? "#E5F5EC" : avgAlignment >= 45 ? "#FCF1E0" : "#FBEAE5",
                }}
              >
                <Text
                  className="font-displayX text-[20px]"
                  style={{
                    color: avgAlignment >= 70 ? "#149059" : avgAlignment >= 45 ? "#D98512" : "#D8472C",
                    letterSpacing: -0.5,
                  }}
                >
                  {avgAlignment}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-ink text-[15px] font-sansBold">
                  {avgAlignment >= 70
                    ? "Strong profile fit"
                    : avgAlignment >= 45
                    ? "Moderate fit"
                    : "Not a natural fit"}
                </Text>
                <Text className="text-ink-2 text-[12.5px] font-sansMd mt-0.5 leading-[17px]">
                  {avgAlignment >= 70
                    ? "This thesis aligns well with your risk tolerance, time horizon, and stated interests."
                    : avgAlignment >= 45
                    ? "Some dimensions fit, others conflict. Explore the details below to understand the trade-offs."
                    : "This thesis diverged from your profile. That does not mean it is wrong, just that it pushes against your stated preferences."}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* Illustrative backtest */}
      {backtest && (
        <View className="mb-5">
          <SectionTitle>Hypothetical performance</SectionTitle>
          <Card pad={16}>
            <Text className="text-ink-2 text-[12px] font-sansMd leading-[17px] mb-4">
              If you had held a representative basket for this thesis (not advice), here is how it would have moved.
            </Text>
            <View className="gap-y-3">
              {([
                { label: "1 year", key: "y1" as const },
                { label: "5 year (ann.)", key: "y5" as const },
                { label: "10 year (ann.)", key: "y10" as const },
              ]).map(({ label, key }) => {
                const val = backtest[key];
                const isNeg = val < 0;
                return (
                  <View key={key}>
                    <View className="flex-row justify-between mb-1.5">
                      <Text className="text-ink-2 text-[12px] font-sansMd">{label}</Text>
                      <Text
                        className={`text-[12px] font-monoBold ${isNeg ? "text-neg" : "text-pos"}`}
                      >
                        {isNeg ? "" : "+"}
                        {val.toFixed(1)}%
                      </Text>
                    </View>
                    <View className="h-[8px] rounded-full bg-bg-surface2 overflow-hidden">
                      <View
                        className={`h-full rounded-full ${isNeg ? "bg-neg" : "bg-brand"}`}
                        style={{
                          width: `${Math.min(Math.abs(val) / 40 * 100, 100)}%`,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
            <Text className="text-ink-3 text-[10.5px] font-sansMd leading-[15px] mt-4 pt-3 border-t border-line">
              {BACKTEST_DISCLAIMER}
            </Text>
          </Card>
        </View>
      )}

      {/* Screened stocks for this thesis */}
      {scoredStocks.length > 0 && (
        <View className="mb-6">
          <SectionTitle>Screened for this theme</SectionTitle>
          <Card pad={6}>
            {scoredStocks.map(({ stock, result }, i) => (
              <Pressable
                key={stock.symbol}
                onPress={() =>
                  router.push({ pathname: "/(tabs)/stock/[symbol]", params: { symbol: stock.symbol } })
                }
                className={`flex-row items-center px-3 py-2.5 active:opacity-60 ${
                  i < Math.min(7, scoredStocks.length - 1) ? "border-b border-line" : ""
                }`}
              >
                <Text className="text-ink-3 text-[11px] font-monoSb w-6">{i + 1}</Text>
                <View className="flex-1 ml-1">
                  <View className="flex-row items-center">
                    <Text className="text-ink font-monoBold text-[13px] mr-2">{stock.symbol}</Text>
                    <View
                      className={`px-1.5 py-0.5 rounded-[5px] ${
                        result.overall >= 70
                          ? "bg-pos-bg"
                          : result.overall >= 45
                          ? "bg-amber-bg"
                          : "bg-neg-bg"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-monoBold ${
                          result.overall >= 70
                            ? "text-pos"
                            : result.overall >= 45
                            ? "text-amber"
                            : "text-neg"
                        }`}
                      >
                        {result.overall}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-ink-2 text-[11.5px] font-sansMd mt-0.5" numberOfLines={1}>
                    {result.topReason}
                  </Text>
                </View>
              </Pressable>
            ))}
          </Card>
        </View>
      )}

      <View className="mb-2">
        <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-2">
          Educational tool. Not investment advice.
        </Text>
      </View>
    </Screen>
  );
}

function darken(hex: string, amount: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `#${[r, g, b]
    .map((n) => Math.round(n * (1 - amount)).toString(16).padStart(2, "0"))
    .join("")}`;
}
