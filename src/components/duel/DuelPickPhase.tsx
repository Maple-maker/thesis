import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInUp, FadeOut } from "react-native-reanimated";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WhyThesisVsIndex } from "@/components/duel/WhyThesisVsIndex";
import { Tag } from "@/components/ui/Tag";
import {
  DUEL_PORTFOLIO_MATCHUPS,
  listPortfolioOptions,
  resolvePortfolio,
} from "@/lib/duel-portfolio";
import {
  isPortfolioRef,
  resolveDuelAsset,
  searchDuelSymbols,
  type DuelAsset,
} from "@/lib/duel-asset";
import type { Holding } from "@/types/linked-accounts";
import { useStore } from "@/store";

type PickMode = "securities" | "portfolios";

type Props = {
  holdings: Holding[];
  onClose: () => void;
  onStart: (pair: [DuelAsset, DuelAsset]) => void;
  onQuick: () => void;
  canQuick: boolean;
  onLoadDemo?: () => void;
};

export function DuelPickPhase({
  holdings,
  onClose,
  onStart,
  onQuick,
  canQuick,
  onLoadDemo,
}: Props) {
  const params = useLocalSearchParams<{ a?: string; b?: string }>();
  const storedDuelMode = useStore((s) => s.duelMode);
  // Use store mode if set, otherwise default to portfolios for thesis vs thesis
  const [mode, setMode] = useState<PickMode>(storedDuelMode ?? "portfolios");
  const [query, setQuery] = useState("");
  const [selA, setSelA] = useState<string | null>(null);
  const [selB, setSelB] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState<"A" | "B" | null>(null);

  useEffect(() => {
    if (params.a) {
      setSelA(String(params.a));
      // Only switch to securities if a stock ticker (not a portfolio ref) is passed
      if (!isPortfolioRef(String(params.a))) setMode("securities");
    }
    if (params.b) setSelB(String(params.b));
  }, [params.a, params.b]);

  const filteredSymbols = useMemo(() => searchDuelSymbols(query, 30), [query]);
  const portfolioOptions = useMemo(() => listPortfolioOptions(holdings), [holdings]);

  const filteredPortfolios = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return portfolioOptions;
    return portfolioOptions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.ref.toLowerCase().includes(q)
    );
  }, [portfolioOptions, query]);

  const assetA = selA ? resolveDuelAsset(selA, holdings) : null;
  const assetB = selB ? resolveDuelAsset(selB, holdings) : null;
  const bothPicked = !!(assetA && assetB);

  const pickRef = (ref: string) => {
    if (!selA || (selA && selB)) {
      // Reset: start new pick (A = new, B = empty)
      setSelA(ref);
      setSelB(null);
    } else if (ref === selA) {
      // Deselect A
      return;
    } else {
      // Set B
      setSelB(ref);
    }
  };

  const swap = () => {
    if (!selA || !selB) return;
    setSelA(selB);
    setSelB(selA);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-2">
        <Pressable
          onPress={onClose}
          className="bg-bg-surface border border-line px-3 h-9 items-center justify-center rounded-[12px] active:opacity-70"
        >
          <Text className="text-ink-2 text-[13px] font-sansBold">Close</Text>
        </Pressable>
        <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest">
          The Duel
        </Text>
        <View className="w-[52px]" />
      </View>

      {/* Sticky A/B Selection Bar — always visible */}
      <View className="px-5 pb-2">
        <Text className="text-ink text-[22px] font-displayX mb-2" style={{ letterSpacing: -0.4 }}>
          {!selA ? "Pick side A" : !selB ? "Now pick side B" : "Ready to duel"}
        </Text>

        {/* A vs B selector */}
        <View className="flex-row items-center gap-2">
          {/* Side A */}
          <Pressable
            onPress={() => setPickerOpen("A")}
            className="flex-1 bg-brand-bg rounded-[14px] px-4 py-3 border-2 border-brand/40 active:opacity-80"
          >
            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider">Thesis A</Text>
            <Text
              className={`text-[15px] mt-0.5 ${selA ? "text-ink font-monoBold" : "text-ink-3 font-sansMd"}`}
              numberOfLines={1}
            >
              {assetA?.name ?? selA ?? "Tap to pick"}
            </Text>
            {assetA && (
              <Text className="text-brand text-[11px] font-monoMd mt-0.5">
                {selA}
              </Text>
            )}
          </Pressable>

          {/* Swap button */}
          <Pressable
            onPress={swap}
            disabled={!bothPicked}
            className={`w-[32px] h-[32px] rounded-[10px] items-center justify-center ${
              bothPicked ? "bg-bg-surface border border-line active:opacity-70" : "opacity-30"
            }`}
          >
            <Icon name="compare" size={16} color={bothPicked ? "#16201C" : "#B1B1B1"} sw={2} />
          </Pressable>

          {/* Side B */}
          <Pressable
            onPress={() => setPickerOpen("B")}
            className="flex-1 rounded-[14px] px-4 py-3 border-2 active:opacity-80"
            style={{
              backgroundColor: "rgba(124,58,237,0.06)",
              borderColor: selB ? "rgba(124,58,237,0.4)" : "rgba(124,58,237,0.15)",
            }}
          >
            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider">Thesis B</Text>
            <Text
              className={`text-[15px] mt-0.5 ${selB ? "text-ink font-monoBold" : "text-ink-3 font-sansMd"}`}
              numberOfLines={1}
            >
              {assetB?.name ?? selB ?? "Tap to pick"}
            </Text>
            {assetB && (
              <Text className="text-[11px] font-monoMd mt-0.5" style={{ color: "#7C3AED" }}>
                {selB}
              </Text>
            )}
          </Pressable>
        </View>

        {/* Tap hint */}
        <Text className="text-ink-3 text-[10px] font-sansMd mt-1.5 text-center">
          {!selA
            ? "Search below and tap a ticker to lock in Thesis A"
            : !selB
              ? "Tap any ticker below to lock in Thesis B"
              : "Tap below to swap a side, or start the duel"}
        </Text>
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-line mx-5" />

      {/* Search + Results — scrollable */}
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 17, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mode toggle */}
          <View className="flex-row p-1 bg-track rounded-[12px] mt-4 mb-3">
            {(
              [
                { id: "portfolios" as const, label: "Model portfolios" },
                { id: "securities" as const, label: "Stocks & ETFs" },
              ] as const
            ).map((t) => {
              const on = mode === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => {
                    setMode(t.id);
                    setSelA(null);
                    setSelB(null);
                    setQuery("");
                  }}
                  className={`flex-1 py-2.5 rounded-[10px] items-center ${on ? "bg-bg-surface" : ""}`}
                >
                  <Text className={`text-[13px] font-sansBold ${on ? "text-ink" : "text-ink-3"}`}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Search bar */}
          <View className="bg-bg-surface border border-line rounded-[14px] px-4 py-3 mb-3">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={mode === "securities" ? "Search ticker (NVDA, SCHD…)" : "Search portfolio or lens…"}
              placeholderTextColor="#8C988F"
              autoCapitalize="none"
              className="text-ink text-[16px] font-sansMd"
            />
          </View>

          {mode === "portfolios" && <WhyThesisVsIndex compact />}

          {mode === "portfolios" && holdings.length === 0 && onLoadDemo && (
            <Card pad={14} className="mb-4 bg-amber-bg/30 border-amber/25">
              <Text className="text-ink text-[14px] font-sansBold">Compare vs your book</Text>
              <Text className="text-ink-2 text-[12.5px] font-sansMd mt-1 leading-[18px]">
                Load demo holdings (VOO, NVDA, SCHD…) to duel Buffett or value vs AI against a real allocation.
              </Text>
              <View className="mt-3">
                <Button label="Load demo portfolio" fullWidth size="md" onPress={onLoadDemo} />
              </View>
            </Card>
          )}

          {mode === "portfolios" && (
            <>
              <Text className="text-ink text-[15px] font-displayX mb-2">Featured · backtested vs SPY</Text>
              <View className="gap-2 mb-4">
                {DUEL_PORTFOLIO_MATCHUPS.map((m) => {
                  const pa = resolvePortfolio(m.a, holdings);
                  const pb = resolvePortfolio(m.b, holdings);
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => {
                        setSelA(m.a);
                        setSelB(m.b);
                      }}
                      className="bg-bg-surface border border-line rounded-[14px] px-4 py-3 active:opacity-80"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="text-ink font-sansBold text-[14px] flex-1">{m.label}</Text>
                        {m.tag ? <Tag label={m.tag} tone="brand" /> : null}
                      </View>
                      <Text className="text-ink-3 text-[12px] font-sansMd mt-0.5">{m.hint}</Text>
                      {pa && pb && (
                        <Text className="text-ink-2 text-[11px] font-monoMd mt-2">
                          {pa.name.split(" ")[0]} 1Y {pa.backtest.alpha.trailing1y >= 0 ? "+" : ""}
                          {pa.backtest.alpha.trailing1y} pts · {pb.name.split(" ")[0]} 1Y{" "}
                          {pb.backtest.alpha.trailing1y >= 0 ? "+" : ""}
                          {pb.backtest.alpha.trailing1y} pts vs SPY
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
              <Text className="text-ink text-[15px] font-displayX mb-2">All model portfolios</Text>
              <View className="gap-2 mb-4">
                {filteredPortfolios.map((p) => {
                  const on = selA === p.ref || selB === p.ref;
                  return (
                    <Pressable
                      key={p.ref}
                      onPress={() => pickRef(p.ref)}
                      className={`rounded-[14px] px-4 py-3 border ${
                        on ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
                      } active:opacity-80`}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className={`font-sansBold text-[14px] ${on ? "text-brand" : "text-ink"}`}>
                          {p.name}
                        </Text>
                        <View className="px-2 py-0.5 rounded-[6px] bg-bg-surface2">
                          <Text className="text-ink-3 text-[9px] font-sansX uppercase">{p.category}</Text>
                        </View>
                      </View>
                      <Text className="text-ink-3 text-[12px] font-sansMd mt-0.5">{p.subtitle}</Text>
                      <Text className="text-brand text-[11px] font-sansMd mt-1">{p.backtestLine}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {mode === "securities" && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {filteredSymbols.map((sym) => {
                const isA = sym === selA;
                const isB = sym === selB;
                const on = isA || isB;
                return (
                  <Pressable
                    key={sym}
                    onPress={() => pickRef(sym)}
                    className={`px-3 py-2 rounded-full border active:opacity-80 ${
                      isA
                        ? "bg-brand-bg border-brand"
                        : isB
                          ? "border-2"
                          : "bg-bg-surface border-line"
                    }`}
                    style={
                      isB
                        ? { borderColor: "#7C3AED", backgroundColor: "rgba(124,58,237,0.06)" }
                        : undefined
                    }
                  >
                    <Text
                      className={`font-monoBold text-[13px] ${
                        isA ? "text-brand" : isB ? "text-[#7C3AED]" : "text-ink"
                      }`}
                    >
                      {sym}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {canQuick && mode === "securities" && (
            <View className="mb-4">
              <Button label="Quick pick from watchlist" fullWidth variant="ghost" onPress={onQuick} />
            </View>
          )}
          {holdings.length === 0 && mode === "portfolios" && (
            <Text className="text-ink-3 text-[12px] font-sansMd text-center mb-4 leading-[18px]">
              Load demo accounts from Home to enable "My portfolio" duels.
            </Text>
          )}

          {/* Extra bottom padding so content isn't hidden behind the duel bar */}
          <View className="h-4" />
        </ScrollView>
      </View>

      {/* Picker modal — opens when tapping Thesis A or B */}
      <Modal visible={!!pickerOpen} animationType="slide" transparent presentationStyle="pageSheet">
        <View className="flex-1 bg-bg">
          <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
            {/* Picker header */}
            <View className="flex-row items-center justify-between px-5 pt-2 pb-3 border-b border-line">
              <Pressable onPress={() => setPickerOpen(null)} className="py-1">
                <Text className="text-ink-2 text-[14px] font-sansBold">Cancel</Text>
              </Pressable>
              <Text className="text-ink text-[16px] font-displayX">
                Pick Thesis {pickerOpen}
              </Text>
              <View className="w-[52px]" />
            </View>

            {/* Picker content — same list as below */}
            <View className="flex-1">
              <ScrollView
                contentContainerStyle={{ paddingHorizontal: 17, paddingBottom: 30 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Search bar */}
                <View className="bg-bg-surface border border-line rounded-[14px] px-4 py-3 my-3">
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder={mode === "securities" ? "Search ticker…" : "Search portfolio…"}
                    placeholderTextColor="#8C988F"
                    autoCapitalize="none"
                    className="text-ink text-[16px] font-sansMd"
                  />
                </View>

                {/* Mode toggle */}
                <View className="flex-row p-1 bg-track rounded-[12px] mb-3">
                  {(
                    [
                      { id: "portfolios" as const, label: "Portfolios" },
                      { id: "securities" as const, label: "Stocks & ETFs" },
                    ] as const
                  ).map((t) => {
                    const on = mode === t.id;
                    return (
                      <Pressable
                        key={t.id}
                        onPress={() => setMode(t.id)}
                        className={`flex-1 py-2.5 rounded-[10px] items-center ${on ? "bg-bg-surface" : ""}`}
                      >
                        <Text className={`text-[13px] font-sansBold ${on ? "text-ink" : "text-ink-3"}`}>
                          {t.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Portfolio options */}
                {mode === "portfolios" && filteredPortfolios.map((p) => {
                  const picked = (pickerOpen === "A" && selA === p.ref) || (pickerOpen === "B" && selB === p.ref);
                  return (
                    <Pressable
                      key={p.ref}
                      onPress={() => { pickRef(p.ref); setPickerOpen(null); }}
                      className={`px-4 py-3.5 rounded-[14px] border mb-2 active:opacity-80 ${
                        picked ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className={`text-[15px] ${picked ? "text-ink font-sansBold" : "text-ink font-sansSb"}`}>
                            {p.name}
                          </Text>
                          <Text className="text-ink-3 text-[12px] font-sansMd mt-0.5">{p.subtitle}</Text>
                        </View>
                        {picked && <Icon name="check" size={16} color="#0E7A66" sw={2.6} />}
                      </View>
                    </Pressable>
                  );
                })}

                {/* Security options */}
                {mode === "securities" && filteredSymbols.map((sym) => {
                  const picked = (pickerOpen === "A" && selA === sym) || (pickerOpen === "B" && selB === sym);
                  return (
                    <Pressable
                      key={sym}
                      onPress={() => { pickRef(sym); setPickerOpen(null); }}
                      className={`flex-row items-center px-4 py-3 rounded-[14px] border mb-1.5 active:opacity-80 ${
                        picked ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
                      }`}
                    >
                      <Text className={`text-[15px] font-monoBold flex-1 ${picked ? "text-brand" : "text-ink"}`}>
                        {sym}
                      </Text>
                      {picked && <Icon name="check" size={16} color="#0E7A66" sw={2.6} />}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Floating Duel Bar — pops up as soon as both A and B are selected */}
      {bothPicked && assetA && assetB && (
        <Animated.View entering={FadeInUp.duration(250)} exiting={FadeOut.duration(150)}>
          <View className="px-5 pb-2 pt-1 border-t border-line bg-white">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="flex-1 flex-row items-center bg-bg-subtle rounded-[10px] px-3 py-2">
                <View className="bg-brand-bg rounded-[6px] px-2 py-0.5 mr-2">
                  <Text className="text-brand text-[10px] font-monoBold">{selA}</Text>
                </View>
                <Text className="text-ink-3 text-[12px] font-sansMd">vs</Text>
                <View className="rounded-[6px] px-2 py-0.5 ml-2" style={{ backgroundColor: "rgba(124,58,237,0.1)" }}>
                  <Text className="text-[10px] font-monoBold" style={{ color: "#7C3AED" }}>{selB}</Text>
                </View>
              </View>
              <Pressable
                onPress={swap}
                className="w-[32px] h-[32px] rounded-[10px] bg-bg-subtle items-center justify-center active:opacity-70"
              >
                <Icon name="compare" size={14} color="#16201C" sw={1.8} />
              </Pressable>
            </View>
            <Button
              label={`Duel: ${selA} vs ${selB}`}
              fullWidth
              size="lg"
              onPress={() => onStart([assetA, assetB])}
            />
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
