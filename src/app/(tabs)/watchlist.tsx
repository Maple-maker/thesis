import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { pushRoute, pushRouteObject } from "@/lib/app-route";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import { Tick } from "@/components/ui/Tick";
import { WatchlistAlertsSheet } from "@/components/watchlist/WatchlistAlertsSheet";
import { stockBySymbol } from "@/data/stocks";
import { themeById } from "@/data/themes";
import { convictionLeaderboard } from "@/lib/conviction-rank";
import { searchWatchlistLocal } from "@/lib/watchlist-search";
import { useStore } from "@/store";

const FIT_TONES: Record<"strong" | "moderate" | "weak", { bg: string; ink: string }> = {
  strong: { bg: "bg-pos-bg", ink: "text-pos" },
  moderate: { bg: "bg-amber-bg", ink: "text-amber" },
  weak: { bg: "bg-bg-subtle", ink: "text-ink-3" },
};

function fitTone(score: number): "strong" | "moderate" | "weak" {
  if (score >= 62) return "strong";
  if (score >= 40) return "moderate";
  return "weak";
}

export default function WatchlistScreen() {
  const router = useRouter();
  const watchlist = useStore((s) => s.watchlist);
  const toggle = useStore((s) => s.toggleWatchlist);
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const watchlistAlerts = useStore((s) => s.watchlistAlerts);

  const [query, setQuery] = useState("");
  const [alertsVisible, setAlertsVisible] = useState(false);
  const [alertFocusSymbol, setAlertFocusSymbol] = useState<string | undefined>();

  const stocks = watchlist.map(stockBySymbol).filter(Boolean) as NonNullable<
    ReturnType<typeof stockBySymbol>
  >[];

  const searchResults = useMemo(
    () => searchWatchlistLocal(query, profile, themeIds, 12),
    [query, profile, themeIds]
  );

  const leaderboard = useMemo(() => {
    if (themeIds.length === 0) return null;
    return convictionLeaderboard(profile, themeIds, 8, 6);
  }, [profile, themeIds]);

  const isSearching = query.trim().length > 0;

  // ── Alert helpers ─────────────────────────────────────────

  /** Number of alerts (active or triggered) for a given symbol */
  function alertCountForSymbol(symbol: string): number {
    return watchlistAlerts.filter(
      (a) => a.symbol.toUpperCase() === symbol.toUpperCase()
    ).length;
  }

  /** Number of triggered alerts for a given symbol */
  function triggeredCountForSymbol(symbol: string): number {
    return watchlistAlerts.filter(
      (a) => a.symbol.toUpperCase() === symbol.toUpperCase() && a.triggered
    ).length;
  }

  function openAlertsForSymbol(symbol: string) {
    setAlertFocusSymbol(symbol);
    setAlertsVisible(true);
  }

  function openAlertsOverview() {
    setAlertFocusSymbol(undefined);
    setAlertsVisible(true);
  }

  return (
    <Screen padded>
      <Header
        title="Watchlist"
        subtitle={
          stocks.length > 0
            ? `${stocks.length} ${stocks.length === 1 ? "name" : "names"} tracking`
            : "Track stocks and ETFs that fit your thesis"
        }
        right={
          <View className="flex-row gap-2 items-center">
            {stocks.length >= 2 ? (
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
            ) : null}
          </View>
        }
      />

      {/* Search bar */}
      <View className="bg-bg-surface border border-line rounded-[14px] px-4 py-3 mt-2">
        <View className="flex-row items-center">
          <Icon name="search" size={16} color="#8C988F" sw={1.5} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search stocks or ETFs by ticker or name…"
            placeholderTextColor="#8C988F"
            autoCapitalize="characters"
            className="text-ink text-[15px] font-sansMd ml-2 flex-1"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Icon name="close" size={16} color="#8C988F" sw={1.5} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }} className="flex-1">
        {/* Search results */}
        {isSearching && (
          <View className="mt-4">
            <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
              {searchResults.length > 0 ? "Search results" : "No matches — try a different ticker"}
            </Text>
            <View className="gap-y-2">
              {searchResults.map((row) => {
                const tone = fitTone(row.fit.score);
                const colors = FIT_TONES[tone];
                const isWatched = watchlist.includes(row.symbol.toUpperCase());
                return (
                  <Card key={row.symbol} pad={12}>
                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => {
                          if (row.kind === "etf") {
                            pushRouteObject(router, { pathname: "/(tabs)/etf/[symbol]", params: { symbol: row.symbol } });
                          } else {
                            pushRouteObject(router, { pathname: "/(tabs)/stock/[symbol]", params: { symbol: row.symbol } });
                          }
                        }}
                        className="flex-row items-center flex-1 active:opacity-70"
                      >
                        <View className={`w-[38px] h-[38px] rounded-[10px] items-center justify-center mr-3 ${colors.bg}`}>
                          <Text className={`text-[16px] font-monoBold ${colors.ink}`}>
                            {row.symbol.slice(0, 3)}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center gap-1.5">
                            <Text className="text-ink font-monoBold text-[13px]">{row.symbol}</Text>
                            <Tag label={row.kind === "etf" ? "ETF" : "Stock"} tone={row.kind === "etf" ? "violet" : "default"} />
                          </View>
                          <Text className="text-ink-2 text-[12px] font-sansMd mt-0.5" numberOfLines={1}>
                            {row.headline}
                          </Text>
                          <View className="flex-row items-center mt-1 gap-2">
                            <Text className={`text-[10px] font-sansBold ${colors.ink}`}>
                              Fit {row.fit.score}%
                            </Text>
                            {row.kind === "etf" && (
                              <Pressable
                                onPress={() => pushRouteObject(router, { pathname: "/(tabs)/etf/[symbol]", params: { symbol: row.symbol } })}
                              >
                                <Text className="text-violet text-[10px] font-sansBold underline">ETF research →</Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      </Pressable>
                      <Pressable
                        onPress={() => toggle(row.symbol)}
                        hitSlop={10}
                        className={`ml-2 px-3 py-1.5 rounded-[10px] border active:opacity-70 ${
                          isWatched ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
                        }`}
                      >
                        <Text className={`text-[12px] font-sansBold ${isWatched ? "text-brand" : "text-ink-2"}`}>
                          {isWatched ? "Added" : "+ Add"}
                        </Text>
                      </Pressable>
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        )}

        {/* Currently watching */}
        {!isSearching && stocks.length > 0 && (
          <View className="mt-4">
            <SectionTitle
              action="Alerts"
              onAction={openAlertsOverview}
            >
              Tracking
            </SectionTitle>
            <View className="gap-y-2">
              {stocks.map((s) => {
                const alertCount = alertCountForSymbol(s.symbol);
                const triggeredCount = triggeredCountForSymbol(s.symbol);
                return (
                  <Card key={s.symbol} pad={14}>
                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => pushRouteObject(router, { pathname: "/(tabs)/stock/[symbol]", params: { symbol: s.symbol } })}
                        className="flex-row items-center flex-1 active:opacity-70"
                      >
                        <Tick ticker={s.symbol} size={42} />
                        <View className="ml-3 flex-1">
                          <View className="flex-row items-center gap-1.5">
                            <Text className="text-ink font-monoBold text-[14px]">{s.symbol}</Text>
                            <Text className="text-ink-3 text-[10px] font-sansSb uppercase tracking-wider">{s.sector}</Text>
                          </View>
                          <Text className="text-ink text-[13px] font-sansSb mt-0.5">{s.name}</Text>
                          <View className="flex-row gap-x-1.5 mt-1">
                            {s.tags.slice(0, 2).map((t) => (
                              <Tag key={t} label={t} />
                            ))}
                          </View>
                        </View>
                      </Pressable>

                      {/* Bell icon with alert count badge */}
                      <Pressable
                        onPress={() => openAlertsForSymbol(s.symbol)}
                        hitSlop={10}
                        className="ml-1 p-2 relative active:opacity-70"
                      >
                        <Icon
                          name="bell"
                          size={20}
                          color={triggeredCount > 0 ? "#D98512" : "#8C988F"}
                          sw={1.8}
                        />
                        {alertCount > 0 && (
                          <View className="absolute -top-0.5 -right-0.5 bg-brand min-w-[16px] h-[16px] rounded-full items-center justify-center px-1">
                            <Text className="text-white text-[9px] font-sansBold">
                              {alertCount}
                            </Text>
                          </View>
                        )}
                        {triggeredCount > 0 && alertCount === 0 && (
                          <View className="absolute top-0 right-0 w-[8px] h-[8px] rounded-full bg-amber" />
                        )}
                      </Pressable>

                      <Pressable onPress={() => toggle(s.symbol)} hitSlop={10} className="ml-1 p-2">
                        <Icon name="close" size={18} color="#8C988F" sw={1.8} />
                      </Pressable>
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        )}

        {/* Thesis-fit suggestions (when not searching + leaderboard exists) */}
        {!isSearching && leaderboard && (leaderboard.stocks.length > 0 || leaderboard.etfs.length > 0) && (
          <View className="mt-6">
            <SectionTitle>
              {themeIds.length > 0
                ? `Potential thesis fits for ${themeById(themeIds[0])?.title ?? "you"}`
                : "Explore opportunities"}
            </SectionTitle>
            <Text className="text-ink-2 text-[12px] font-sansMd mb-3 -mt-1.5 leading-[17px]">
              Ranked by alignment with your thesis. Tap to research, + Add to track.
            </Text>

            {leaderboard.stocks.length > 0 && (
              <View className="mb-3">
                <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest mb-2">Stocks</Text>
                <View className="gap-y-2">
                  {leaderboard.stocks.slice(0, 5).map((row) => {
                    const isWatched = watchlist.includes(row.symbol.toUpperCase());
                    const tone = fitTone(row.score);
                    const colors = FIT_TONES[tone];
                    return (
                      <Card key={row.symbol} pad={12}>
                        <View className="flex-row items-center">
                          <Pressable
                            onPress={() => pushRouteObject(router, { pathname: "/(tabs)/stock/[symbol]", params: { symbol: row.symbol } })}
                            className="flex-row items-center flex-1 active:opacity-70"
                          >
                            <View className={`w-[36px] h-[36px] rounded-[9px] items-center justify-center mr-3 ${colors.bg}`}>
                              <Text className={`text-[15px] font-monoBold ${colors.ink}`}>{row.symbol.slice(0, 3)}</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-ink font-monoBold text-[13px]">{row.symbol}</Text>
                              <Text className="text-ink-2 text-[11px] font-sansMd mt-0.5">{row.name}</Text>
                            </View>
                          </Pressable>
                          <View className="items-end mr-2">
                            <Text className={`text-[11px] font-monoBold ${colors.ink}`}>{row.score}%</Text>
                            <Text className="text-ink-3 text-[9px] font-sansMd">fit</Text>
                          </View>
                          <Pressable
                            onPress={() => toggle(row.symbol)}
                            hitSlop={8}
                            className={`px-2.5 py-1.5 rounded-[8px] border active:opacity-70 ${
                              isWatched ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
                            }`}
                          >
                            <Text className={`text-[11px] font-sansBold ${isWatched ? "text-brand" : "text-ink-2"}`}>
                              {isWatched ? "✓" : "+"}
                            </Text>
                          </Pressable>
                        </View>
                      </Card>
                    );
                  })}
                </View>
              </View>
            )}

            {leaderboard.etfs.length > 0 && (
              <View>
                <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest mb-2">ETFs</Text>
                <View className="gap-y-2">
                  {leaderboard.etfs.slice(0, 4).map((row) => {
                    const isWatched = watchlist.includes(row.symbol.toUpperCase());
                    const tone = fitTone(row.score);
                    const colors = FIT_TONES[tone];
                    return (
                      <Card key={row.symbol} pad={12}>
                        <View className="flex-row items-center">
                          <Pressable
                            onPress={() => pushRouteObject(router, { pathname: "/(tabs)/etf/[symbol]", params: { symbol: row.symbol } })}
                            className="flex-row items-center flex-1 active:opacity-70"
                          >
                            <View className="bg-violet-bg/50 w-[36px] h-[36px] rounded-[9px] items-center justify-center mr-3">
                              <Icon name="grid" size={16} color="#7C3AED" />
                            </View>
                            <View className="flex-1">
                              <View className="flex-row items-center gap-1.5">
                                <Text className="text-ink font-monoBold text-[13px]">{row.symbol}</Text>
                                <Tag label="ETF" tone="violet" />
                              </View>
                              <Text className="text-ink-2 text-[11px] font-sansMd mt-0.5">{row.name}</Text>
                            </View>
                          </Pressable>
                          <View className="items-end mr-2">
                            <Text className={`text-[11px] font-monoBold ${colors.ink}`}>{row.score}%</Text>
                            <Text className="text-ink-3 text-[9px] font-sansMd">fit</Text>
                          </View>
                          <Pressable
                            onPress={() => toggle(row.symbol)}
                            hitSlop={8}
                            className={`px-2.5 py-1.5 rounded-[8px] border active:opacity-70 ${
                              isWatched ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
                            }`}
                          >
                            <Text className={`text-[11px] font-sansBold ${isWatched ? "text-brand" : "text-ink-2"}`}>
                              {isWatched ? "✓" : "+"}
                            </Text>
                          </Pressable>
                        </View>
                        {/* ETF research link */}
                        <Pressable
                          onPress={() => pushRouteObject(router, { pathname: "/(tabs)/etf/[symbol]", params: { symbol: row.symbol } })}
                          className="mt-2 pt-2 border-t border-line"
                        >
                          <Text className="text-violet text-[11px] font-sansBold">
                            ETF research → {row.name} · {row.symbol}
                          </Text>
                        </Pressable>
                      </Card>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* No themes yet, empty state with CTA */}
        {!isSearching && stocks.length === 0 && !leaderboard && (
          <Card pad={28} className="mt-4 items-center">
            <View className="bg-brand-bg w-16 h-16 rounded-[16px] items-center justify-center">
              <Icon name="flag" size={28} color="#0E7A66" />
            </View>
            <Text className="text-ink text-[16px] font-sansBold text-center mt-4">
              Start your thesis to unlock fits
            </Text>
            <Text className="text-ink-2 text-[13.5px] font-sansMd text-center mt-1 leading-[19px]">
              Complete the onboarding to get personalized stock and ETF suggestions ranked by thesis alignment.
            </Text>
            <View className="mt-5 w-full">
              <Button label="Go to builder" fullWidth size="md" onPress={() => router.push("/(tabs)/builder")} />
            </View>
          </Card>
        )}

        {/* Extra padding */}
        <View className="h-10" />
      </ScrollView>

      {/* ── Alerts sheet modal ── */}
      <Modal
        visible={alertsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAlertsVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="h-[85%]">
            <WatchlistAlertsSheet
              onClose={() => setAlertsVisible(false)}
              focusSymbol={alertFocusSymbol}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
