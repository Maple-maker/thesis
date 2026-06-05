import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { pushRoute, pushRouteObject } from "@/lib/app-route";

import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import { Tick } from "@/components/ui/Tick";
import { TermHelpBubble } from "@/components/education/TermHelpBubble";
import { PersonaCard, PersonaHero } from "@/components/ui/ThesisPersonaCard";
import { BuilderAllocationPie } from "@/components/builder/BuilderAllocationPie";
import { THEMES, themeById } from "@/data/themes";
import { stockBySymbol } from "@/data/stocks";
import { INVESTOR_LENSES } from "@/data/investor-lenses";
import { personaForTheme } from "@/data/thesis-personas";
import { builderProfileChips } from "@/lib/builder-profile-summary";
import { convictionLeaderboard, type ConvictionRankRow } from "@/lib/conviction-rank";
import { buildThesisPortfolio } from "@/lib/thesis-portfolio-builder";
import { backtestPlainEnglish } from "@/lib/backtest-narrative";
import { MAX_ACTIVE_THEMES } from "@/lib/thesis-limits";
import { useMilestoneCheck } from "@/lib/use-milestone-check";
import { MilestoneCelebration } from "@/components/engagement/MilestoneCelebration";
import { useStore } from "@/store";

export default function BuilderScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const modelThesis = useStore((s) => s.modelThesis);
  const adoptLens = useStore((s) => s.adoptLens);
  const trackActiveToday = useStore((s) => s.trackActiveToday);
  const clearModelThesis = useStore((s) => s.clearModelThesis);
  const clearCustomThesis = useStore((s) => s.clearCustomThesis);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const toggleWatchlist = useStore((s) => s.toggleWatchlist);
  const setWatchlistPipeline = useStore((s) => s.setWatchlistPipeline);

  const hasModel = !!modelThesis?.holdings.length;
  const chips = useMemo(() => builderProfileChips(profile, themeIds), [profile, themeIds]);
  const famousLenses = useMemo(() => INVESTOR_LENSES.filter((l) => l.category === "famous"), []);
  const themeLenses = useMemo(() => INVESTOR_LENSES.filter((l) => l.category === "theme"), []);
  const leaderboard = useMemo(() => {
    if (themeIds.length === 0) return null;
    return convictionLeaderboard(profile, themeIds, 8, 4);
  }, [profile, themeIds]);

  const previewBuilt = useMemo(() => {
    if (themeIds.length === 0) return null;
    return buildThesisPortfolio({
      name: modelThesis?.name || "My thesis portfolio",
      conviction: modelThesis?.conviction || "",
      profile,
      themeIds,
      climateId: modelThesis?.climateId ?? null,
    });
  }, [profile, themeIds, modelThesis]);

  const pieRows = useMemo(() => {
    if (modelThesis?.holdings.length) {
      return modelThesis.holdings.map((h, i) => ({
        symbol: h.symbol,
        name: h.symbol,
        weightPct: h.weightPct,
        role: "",
        kind: h.kind,
      }));
    }
    if (previewBuilt?.candidates.length) {
      return previewBuilt.candidates.map((c) => ({
        symbol: c.symbol,
        name: c.name,
        weightPct: c.weightPct,
        role: c.role,
        kind: c.kind,
      }));
    }
    return [];
  }, [modelThesis, previewBuilt]);

  const { check, currentMilestone, dismissCurrent } = useMilestoneCheck();

  const handleForkLens = (lens: (typeof famousLenses)[0]) => {
    adoptLens(lens.id);
    trackActiveToday();
    check();
    pushRoute(router, "/(tabs)/builder/portfolio");
  };

  const handleRebuild = () => {
    Alert.alert("Start fresh?", "Clears your model portfolio. Your profile and themes stay.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => { clearModelThesis(); clearCustomThesis(); } },
    ]);
  };

  return (
    <Screen padded>
      {/* Header */}
      <View className="pt-4 mb-3">
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
          Builder
        </Text>
        <Text
          className="text-ink font-displayX text-[28px]"
          style={{ letterSpacing: -0.6, lineHeight: 32 }}
        >
          {hasModel ? modelThesis!.name : "Build your portfolio"}
        </Text>
        {chips.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-2">
            {chips.map((c) => (
              <View key={c.id} className="bg-bg-subtle rounded-[8px] px-2 py-1">
                <Text className="text-ink-3 text-[9px] font-sansMd">{c.label}</Text>
                <Text className="text-ink text-[11px] font-sansSb">{c.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Saved model */}
        {hasModel && modelThesis && (
          <Card pad={16} className="mb-5 border-brand/30 bg-brand-bg/10">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Icon name="sparkle" size={14} color="#0E7A66" sw={2} />
                <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest ml-1.5">
                  Your model portfolio
                </Text>
              </View>
              <Tag label="Saved" tone="pos" />
            </View>
            {pieRows.length > 0 && (
              <View className="mb-3">
                <BuilderAllocationPie rows={pieRows} compact />
              </View>
            )}
            {previewBuilt && (
              <Text className="text-ink-2 text-[12px] font-sansMd leading-[18px] mb-4">
                {backtestPlainEnglish(previewBuilt.backtest)}
              </Text>
            )}
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button label="Edit" size="md" onPress={() => pushRoute(router, "/(tabs)/builder/portfolio")} />
              </View>
              <View className="flex-1">
                <Button label="Share" size="md" variant="secondary" onPress={() => pushRoute(router, "/(tabs)/builder/portfolio")} />
              </View>
            </View>
            <Pressable onPress={handleRebuild} className="mt-3 active:opacity-70">
              <Text className="text-ink-3 text-[11px] font-sansMd text-center">Clear and rebuild</Text>
            </Pressable>
          </Card>
        )}

        {/* Famous investor lenses */}
        <SectionTitle>Model portfolios</SectionTitle>
        <Text className="text-ink-2 text-[13px] font-sansMd mb-3 -mt-1.5 leading-[18px]">
          Start from a famous investor's allocation. Fork their holdings and customize.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingRight: 16 }}
          className="mb-6"
          snapToInterval={172}
          decelerationRate="fast"
        >
          {famousLenses.map((lens) => (
            <Pressable
              key={lens.id}
              onPress={() => handleForkLens(lens)}
              style={{ width: 160 }}
              className="active:opacity-90"
            >
              <Card pad={14}>
                <Text className="text-amber text-[9px] font-sansX uppercase tracking-widest mb-1.5" numberOfLines={1}>
                  {lens.inspiredBy}
                </Text>
                <Text className="text-ink font-sansBold text-[14px] leading-[18px] mb-2" numberOfLines={2}>
                  {lens.name}
                </Text>
                {/* Top 3 holdings */}
                {lens.holdings.slice(0, 3).map((h) => (
                  <View key={h.symbol} className="flex-row items-center mb-1">
                    <Text className="text-ink font-monoBold text-[12px] w-[44px]">{h.symbol}</Text>
                    <View className="flex-1 h-[4px] rounded-full bg-track ml-2 overflow-hidden">
                      <View
                        className="h-full rounded-full bg-ink/20"
                        style={{ width: `${Math.min(h.weightPct * 1.5, 100)}%` }}
                      />
                    </View>
                    <Text className="text-ink-3 text-[10px] font-monoMd w-[32px] text-right">{h.weightPct}%</Text>
                  </View>
                ))}
                <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-line">
                  <Text className="text-ink-3 text-[10px] font-sansMd">
                    {lens.stats.holdingsCount} holdings
                  </Text>
                  <Text className={`text-[10px] font-monoBold ${lens.stats.return1y > 0 ? "text-pos" : "text-neg"}`}>
                    {lens.stats.return1y > 0 ? "+" : ""}{lens.stats.return1y.toFixed(1)}%
                  </Text>
                </View>
                <View className="bg-brand-bg rounded-[10px] py-2 items-center mt-2.5">
                  <Text className="text-brand text-[12px] font-sansBold">Fork this model</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </ScrollView>

        {/* Themes */}
        <SectionTitle>Thesis themes</SectionTitle>
        <Text className="text-ink-2 text-[13px] font-sansMd mb-3 -mt-1.5 leading-[18px]">
          Pick a theme, we screen the best stocks and ETFs for it.
        </Text>
        <View className="flex-row flex-wrap gap-x-2.5 gap-y-2.5 mb-6">
          {THEMES.map((t) => {
            const p = personaForTheme(t.id);
            if (!p) return null;
            return (
              <View key={t.id} style={{ width: "47%" }}>
                <PersonaCard
                  theme={t}
                  persona={p}
                  onPress={() =>
                    router.push({ pathname: "/(tabs)/builder/[id]", params: { id: t.id } })
                  }
                  onLongPress={() => toggleTheme(t.id)}
                />
              </View>
            );
          })}
        </View>

        {/* Your active themes */}
        {themeIds.length > 0 && (
          <View className="mb-5">
            <SectionTitle>Your active themes ({themeIds.length}/{MAX_ACTIVE_THEMES})</SectionTitle>
            <View className="flex-row flex-wrap gap-2">
              {themeIds.map((id) => {
                const t = themeById(id);
                if (!t) return null;
                return (
                  <Pressable
                    key={id}
                    onPress={() => pushRouteObject(router, { pathname: "/(tabs)/builder/[id]", params: { id } })}
                    className="flex-row items-center bg-brand-bg border border-brand/30 rounded-full px-3 py-1.5 active:opacity-70"
                  >
                    <Icon name={t.glyph as IconName} size={13} color={t.color} />
                    <Text className="text-brand text-[12px] font-sansSb ml-1.5">{t.title}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Conviction leaderboard */}
        {leaderboard && (leaderboard.stocks.length > 0 || leaderboard.etfs.length > 0) && (
          <View className="mb-5">
            <SectionTitle>Conviction leaderboard</SectionTitle>
            <Text className="text-ink-2 text-[13px] font-sansMd mb-3 -mt-1.5 leading-[18px]">
              Ranked by thesis fit across your active themes. Tap to research or duel.
            </Text>
            {leaderboard.stocks.length > 0 && (
              <View className="mb-3">
                <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest mb-2">Stocks</Text>
                {leaderboard.stocks.slice(0, 6).map((row) => (
                  <LeaderboardRow
                    key={row.symbol}
                    row={row}
                    onPress={() =>
                      pushRouteObject(router, {
                        pathname: "/(tabs)/stock/[symbol]",
                        params: { symbol: row.symbol },
                      })
                    }
                    onDuel={() => {
                      useStore.getState().setDuelMode("securities");
                      pushRouteObject(router, { pathname: "/duel", params: { a: row.symbol } });
                    }}
                    onDossier={() =>
                      pushRouteObject(router, {
                        pathname: "/thesis-model",
                        params: { radarSymbol: row.symbol, radarTemplate: "conviction-dossier" },
                      })
                    }
                    onWatchlist={() => { toggleWatchlist(row.symbol); setWatchlistPipeline(row.symbol, "shortlisted"); }}
                  />
                ))}
              </View>
            )}
            {leaderboard.etfs.length > 0 && (
              <View>
                <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest mb-2">ETFs</Text>
                {leaderboard.etfs.slice(0, 4).map((row) => (
                  <LeaderboardRow
                    key={row.symbol}
                    row={row}
                    onPress={() =>
                      pushRouteObject(router, {
                        pathname: "/(tabs)/etf/[symbol]",
                        params: { symbol: row.symbol },
                      })
                    }
                    onDuel={() => {
                      useStore.getState().setDuelMode("securities");
                      pushRouteObject(router, { pathname: "/duel", params: { a: row.symbol } });
                    }}
                    onDossier={() =>
                      pushRouteObject(router, {
                        pathname: "/thesis-model",
                        params: { radarSymbol: row.symbol, radarTemplate: "conviction-dossier" },
                      })
                    }
                    onWatchlist={() => { toggleWatchlist(row.symbol); setWatchlistPipeline(row.symbol, "shortlisted"); }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Build custom */}
        <SectionTitle>Build your own</SectionTitle>
        <View className="gap-y-2 mb-5">
          <Button
            label="Build custom portfolio"
            fullWidth
            size="lg"
            variant="primary"
            onPress={() => pushRoute(router, "/(tabs)/builder/portfolio")}
          />
          <Button
            label="Browse full thesis library"
            fullWidth
            size="md"
            variant="secondary"
            onPress={() => pushRoute(router, "/(tabs)/themes")}
          />
        </View>

        {/* Tools */}
        <View className="flex-row gap-2.5 mb-6">
          <ToolCard icon="compare" label="Duel" color="#0E7A66" onPress={() => pushRoute(router, "/duel")} />
          <ToolCard icon="grid" label="X-Ray" color="#7C3AED" onPress={() => pushRoute(router, "/xray")} />
          <ToolCard icon="discover" label="Lenses" color="#D98512" onPress={() => pushRoute(router, "/lenses")} />
          <ToolCard icon="target" label="Forecast" color="#3B82F6" onPress={() => pushRoute(router, "/forecast")} />
        </View>

        <Text className="text-ink-3 text-[10px] text-center font-sansMd leading-[14px]">
          Educational tool. Not investment advice. Past performance does not guarantee future results.
        </Text>
      </ScrollView>

      {currentMilestone && (
        <MilestoneCelebration milestone={currentMilestone} onDismiss={dismissCurrent} />
      )}
    </Screen>
  );
}

function ToolCard({ icon, label, color, onPress }: { icon: IconName; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1 active:opacity-70">
      <Card pad={12}>
        <Icon name={icon} size={18} color={color} sw={2} />
        <Text className="text-ink font-sansBold text-[12px] mt-1.5">{label}</Text>
      </Card>
    </Pressable>
  );
}

function LeaderboardRow({
  row,
  onPress,
  onDuel,
  onDossier,
  onWatchlist,
}: {
  row: ConvictionRankRow;
  onPress: () => void;
  onDuel: () => void;
  onDossier: () => void;
  onWatchlist: () => void;
}) {
  const scoreColor =
    row.score >= 70 ? "#0E7A66" : row.score >= 45 ? "#D98512" : row.score >= 25 ? "#6B7280" : "#9CA3AF";
  const labelBg =
    row.label === "Strong"
      ? "bg-pos/10"
      : row.label === "Moderate"
        ? "bg-amber/10"
        : "bg-ink-3/10";

  // Allocation adjustment — only available when the symbol is in the model thesis
  const modelThesis = useStore((s) => s.modelThesis);
  const setModelThesis = useStore((s) => s.setModelThesis);
  const holding = modelThesis?.holdings.find(
    (h) => h.symbol.toUpperCase() === row.symbol.toUpperCase()
  );
  const weightPct = holding?.weightPct ?? 0;

  const adjustWeight = (delta: number) => {
    if (!modelThesis || !holding) return;
    const newW = Math.max(0, Math.min(100, weightPct + delta));
    const updated = modelThesis.holdings.map((h) =>
      h.symbol.toUpperCase() === row.symbol.toUpperCase()
        ? { ...h, weightPct: newW }
        : h
    );
    // Re-normalize so total stays at 100%
    const nonCashUpdated = updated.filter((h) => h.symbol !== "CASH");
    const totalNonCash = nonCashUpdated.reduce((s, h) => s + h.weightPct, 0);
    if (totalNonCash > 0) {
      const scale = 100 / totalNonCash;
      const normalized = updated.map((h) =>
        h.symbol === "CASH"
          ? h
          : { ...h, weightPct: Math.round(h.weightPct * scale) }
      );
      setModelThesis({ ...modelThesis, holdings: normalized });
    }
  };

  return (
    <Pressable onPress={onPress} className="active:opacity-70 mb-1.5">
      <Card pad={12}>
        <View className="flex-row items-center justify-between">
          {/* Company name + ticker */}
          <View className="flex-1 mr-2">
            <Text className="text-ink text-[13px] font-sansSb" numberOfLines={1}>
              {row.name}
            </Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Text className="text-ink-3 text-[11px] font-monoBold">{row.symbol}</Text>
              <Text className="text-ink-3 text-[10px] font-sansMd">
                {row.kind === "etf" ? "ETF" : "Stock"}
              </Text>
            </View>
          </View>

          {/* Allocation % stepper (only when in model thesis) */}
          {holding && (
            <View className="flex-row items-center gap-1 mr-2">
              <Pressable
                onPress={() => adjustWeight(-5)}
                className="w-[22px] h-[22px] rounded-[6px] bg-bg-subtle items-center justify-center active:opacity-70"
                hitSlop={4}
                disabled={weightPct <= 0}
              >
                <Text className="text-ink-2 text-[13px] font-monoBold" style={{ opacity: weightPct <= 0 ? 0.3 : 1 }}>−</Text>
              </Pressable>
              <View className="bg-bg-surface border border-line rounded-[7px] px-2 py-0.5 min-w-[42px] items-center">
                <Text className="text-ink text-[11px] font-monoBold">{weightPct}%</Text>
              </View>
              <Pressable
                onPress={() => adjustWeight(5)}
                className="w-[22px] h-[22px] rounded-[6px] bg-brand-bg items-center justify-center active:opacity-70"
                hitSlop={4}
                disabled={weightPct >= 100}
              >
                <Text className="text-brand text-[13px] font-monoBold" style={{ opacity: weightPct >= 100 ? 0.3 : 1 }}>+</Text>
              </Pressable>
            </View>
          )}

          {/* Score + actions */}
          <View className="flex-row items-center gap-1.5">
            <View className={`rounded-[6px] px-2 py-0.5 ${labelBg}`}>
              <Text className="text-[10px] font-sansBold" style={{ color: scoreColor }}>
                {row.score}
              </Text>
            </View>
            <Pressable
              onPress={onDuel}
              className="w-[28px] h-[28px] rounded-[8px] bg-bg-subtle items-center justify-center active:opacity-70"
              hitSlop={4}
            >
              <Icon name="compare" size={13} color="#16201C" sw={1.8} />
            </Pressable>
            <Pressable
              onPress={onDossier}
              className="w-[28px] h-[28px] rounded-[8px] bg-brand-bg items-center justify-center active:opacity-70"
              hitSlop={4}
            >
              <Icon name="discover" size={13} color="#0E7A66" sw={1.8} />
            </Pressable>
            <Pressable
              onPress={onWatchlist}
              className="w-[28px] h-[28px] rounded-[8px] bg-bg-subtle items-center justify-center active:opacity-70"
              hitSlop={4}
            >
              <Icon name="flag" size={13} color="#16201C" sw={1.8} />
            </Pressable>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
