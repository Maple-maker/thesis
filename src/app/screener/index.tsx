import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { SecurityRow } from "@/components/screener/SecurityRow";
import { ASSET_CLASS_LABELS, type EtfAssetClass } from "@/data/etf-catalog";
import { THEMES } from "@/data/themes";
import { isMarketLiveCooldown, searchMarketLive } from "@/lib/market-api";
import {
  mergeLiveSecurities,
  needsLiveMarketSearch,
  screenSecurities,
  securitiesFromMarketHits,
  securityUniverseLabel,
  type SecurityKind,
} from "@/lib/security-screener";
import type { ThemeId } from "@/store/types";

const ASSET_CLASSES: (EtfAssetClass | "all")[] = [
  "all",
  "us-equity",
  "intl-equity",
  "fixed-income",
  "sector",
  "thematic",
  "factor",
  "commodity",
  "real-estate",
];

const KINDS: { id: "all" | SecurityKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "etf", label: "ETFs" },
  { id: "stock", label: "Stocks" },
];

function FilterChip({
  label,
  on,
  onPress,
  tone = "brand",
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  tone?: "brand" | "amber";
}) {
  const active =
    tone === "amber"
      ? on
        ? "bg-amber border-amber"
        : "bg-bg-surface border-line"
      : on
        ? "bg-brand border-brand"
        : "bg-bg-surface border-line";
  const textActive = on ? "text-white" : "text-ink-2";

  return (
    <Pressable
      onPress={onPress}
      style={{ flexShrink: 0 }}
      className={`px-3 py-2 rounded-full border ${active}`}
    >
      <Text className={`text-[12px] font-sansBold ${textActive}`}>{label}</Text>
    </Pressable>
  );
}

export default function EtfScreener() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | SecurityKind>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [themeId, setThemeId] = useState<ThemeId | "all">("all");
  const [assetClass, setAssetClass] = useState<EtfAssetClass | "all">("all");
  const [maxExpense, setMaxExpense] = useState<number | null>(null);
  const [includeLeveraged, setIncludeLeveraged] = useState(false);

  const showEtfFilters = kind === "etf" || kind === "all";
  const activeFilterCount =
    (themeId !== "all" ? 1 : 0) +
    (assetClass !== "all" ? 1 : 0) +
    (maxExpense != null ? 1 : 0) +
    (includeLeveraged ? 1 : 0);

  const [liveExtra, setLiveExtra] = useState<ReturnType<typeof screenSecurities>>([]);
  const [liveLimited, setLiveLimited] = useState(false);

  const localResults = useMemo(
    () =>
      screenSecurities({
        query,
        kind,
        themeId: kind === "stock" ? "all" : themeId,
        assetClass: kind === "stock" ? "all" : assetClass,
        maxExpense: kind === "stock" ? null : maxExpense,
        includeLeveraged,
        sort: "expense",
      }),
    [query, kind, themeId, assetClass, maxExpense, includeLeveraged]
  );

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setLiveExtra([]);
      setLiveLimited(false);
      return;
    }
    if (!needsLiveMarketSearch(q, localResults)) {
      setLiveExtra([]);
      setLiveLimited(false);
      return;
    }
    if (isMarketLiveCooldown()) {
      setLiveLimited(true);
      return;
    }
    const type = kind === "stock" ? "stock" : kind === "etf" ? "etf" : "all";
    let cancelled = false;
    const timer = setTimeout(async () => {
      const hits = await searchMarketLive(q, type, 8);
      if (cancelled) return;
      setLiveLimited(isMarketLiveCooldown());
      setLiveExtra(securitiesFromMarketHits(hits));
    }, 900);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, kind, localResults]);

  const results = useMemo(
    () => mergeLiveSecurities(localResults, liveExtra),
    [localResults, liveExtra]
  );

  const clearFilters = () => {
    setThemeId("all");
    setAssetClass("all");
    setMaxExpense(null);
    setIncludeLeveraged(false);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      {/* Top bar */}
      <View className="flex-row items-center px-4 pt-2 pb-1">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-2 active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <Text className="text-ink font-displayX text-[22px] flex-1">Search</Text>
      </View>

      {/* Sticky search + controls */}
      <View className="bg-bg border-b border-line px-4 pb-3">
        <View className="flex-row items-center bg-bg-surface border border-line rounded-[14px] px-3 mb-3">
          <Icon name="search" size={18} color="#8C988F" sw={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Ticker or name, NVDA, VOO, bond, dividend…"
            placeholderTextColor="#8C988F"
            autoCapitalize="characters"
            autoCorrect={false}
            clearButtonMode="while-editing"
            className="flex-1 py-3 pl-2.5 text-ink text-[16px] font-sansMd"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={10} className="active:opacity-70">
              <Icon name="close" size={16} color="#8C988F" sw={2} />
            </Pressable>
          )}
        </View>

        <View className="flex-row p-1 bg-track rounded-[12px] mb-2">
          {KINDS.map((k) => {
            const on = kind === k.id;
            return (
              <Pressable
                key={k.id}
                onPress={() => setKind(k.id)}
                className={`flex-1 py-2 rounded-[10px] items-center ${on ? "bg-bg-surface" : ""}`}
                style={
                  on
                    ? {
                        shadowColor: "#142F22",
                        shadowOpacity: 0.06,
                        shadowRadius: 4,
                        shadowOffset: { width: 0, height: 1 },
                      }
                    : undefined
                }
              >
                <Text className={`text-[13px] font-sansBold ${on ? "text-ink" : "text-ink-3"}`}>
                  {k.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {showEtfFilters && (
          <Pressable
            onPress={() => setFiltersOpen((v) => !v)}
            className="flex-row items-center justify-between py-1 active:opacity-70"
          >
            <Text className="text-ink-2 text-[13px] font-sansSb">
              ETF filters{activeFilterCount > 0 ? ` · ${activeFilterCount} on` : ""}
            </Text>
            <View style={{ transform: filtersOpen ? [{ rotate: "180deg" }] : undefined }}>
              <Icon name="chevDown" size={16} color="#8C988F" sw={2} />
            </View>
          </Pressable>
        )}

        {showEtfFilters && filtersOpen && (
          <View className="mt-2 pt-2 border-t border-line">
            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-2">
              Asset class
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 8 }}
              className="mb-3"
            >
              {ASSET_CLASSES.map((ac) => (
                <FilterChip
                  key={ac}
                  label={ac === "all" ? "All types" : ASSET_CLASS_LABELS[ac]}
                  on={assetClass === ac}
                  onPress={() => setAssetClass(ac)}
                />
              ))}
            </ScrollView>

            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-2">
              Thesis theme
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 8 }}
              className="mb-3"
            >
              <FilterChip label="All themes" on={themeId === "all"} onPress={() => setThemeId("all")} />
              {THEMES.map((t) => (
                <FilterChip
                  key={t.id}
                  label={t.title}
                  on={themeId === t.id}
                  onPress={() => setThemeId(t.id)}
                />
              ))}
            </ScrollView>

            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-2">
              Expense & type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {[0.2, 0.35, 0.5].map((cap) => (
                <FilterChip
                  key={cap}
                  label={`≤ ${cap}%`}
                  on={maxExpense === cap}
                  onPress={() => setMaxExpense(maxExpense === cap ? null : cap)}
                />
              ))}
              <FilterChip
                label="Leveraged"
                on={includeLeveraged}
                onPress={() => setIncludeLeveraged((v) => !v)}
                tone="amber"
              />
              {activeFilterCount > 0 && (
                <Pressable onPress={clearFilters} className="px-3 py-2 active:opacity-70">
                  <Text className="text-brand text-[12px] font-sansBold">Clear</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => `${item.kind}-${item.symbol}`}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
        ListHeaderComponent={
          <View className="mb-3">
            <Text className="text-ink-3 text-[12px] font-sansMd">
              {securityUniverseLabel(results.length, kind)}
            </Text>
            {liveLimited && (
              <Text className="text-amber text-[11.5px] font-sansMd mt-1.5 leading-[16px]">
                Live lookup paused (API rate limit). Results are from your bundled catalog.
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View className="py-12 items-center px-6">
            <Text className="text-ink-2 text-[15px] font-sansMd text-center">
              No matches for “{query}”. Try a ticker (VOO) or keyword (semiconductor).
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => <SecurityRow item={item} />}
      />
    </SafeAreaView>
  );
}
