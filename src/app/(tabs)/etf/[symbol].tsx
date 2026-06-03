import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";

import { BullBearCasesSection } from "@/components/BullBearCasesSection";
import { Icon } from "@/components/Icon";
import { casesForEtf } from "@/lib/cases";
import { computeEtfConviction } from "@/lib/conviction-rank";
import { etfTagLabel, etfTagTone } from "@/lib/etf-tags";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tick } from "@/components/ui/Tick";
import { prospectusUrlForEtf } from "@/data/etf-links";
import { ETFS, etfBySymbol, isCuratedEtf } from "@/data/etfs";
import { stockBySymbol } from "@/data/stocks";
import { themeById } from "@/data/themes";
import { navigateBack } from "@/lib/app-route";
import { useStore } from "@/store";

export default function EtfDetail() {
  const params = useLocalSearchParams<{ symbol: string; returnTo?: string | string[] }>();
  const router = useRouter();
  const handleBack = () => navigateBack(router, params.returnTo);
  const watchlist = useStore((s) => s.watchlist);
  const toggle = useStore((s) => s.toggleWatchlist);
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const [tab, setTab] = useState<"overview" | "conviction">("overview");

  const sym = (params.symbol ?? "").toUpperCase();
  const etf = etfBySymbol(sym);
  const curated = isCuratedEtf(sym);

  const holdings = useMemo(
    () =>
      etf
        ? etf.holdings
            .map((sym) => stockBySymbol(sym))
            .filter(Boolean)
            .slice(0, 12)
        : [],
    [etf]
  );

  const bullBear = useMemo(() => (etf ? casesForEtf(etf) : null), [etf]);

  const convictionScore = useMemo(
    () => (etf ? computeEtfConviction(etf, profile, themeIds) : 0),
    [etf, profile, themeIds]
  );

  const convictionLabel =
    convictionScore >= 70 ? "Strong" : convictionScore >= 45 ? "Moderate" : convictionScore >= 25 ? "Weak" : "Mismatch";

  const convictionDescription =
    convictionScore >= 70
      ? "Strong alignment with your themes and profile"
      : convictionScore >= 45
        ? "Moderate alignment — some overlap, verify fit"
        : convictionScore >= 25
          ? "Some overlap, review holdings carefully"
          : "Limited alignment with your current themes";

  const themeOverlap = useMemo(
    () => (etf ? etf.themes.filter((tid) => themeIds.includes(tid)).length : 0),
    [etf, themeIds]
  );

  if (!etf) {
    return (
      <Screen padded>
        <Header back title="ETF not found" returnTo={params.returnTo} onBack={handleBack} />
        <Text className="text-ink-2 text-[14px] font-sansMd mt-4">
          Try browsing a theme's "How to invest" list.
        </Text>
      </Screen>
    );
  }

  const watching = watchlist.includes(etf.symbol);
  const prospectusUrl = prospectusUrlForEtf(etf.symbol);

  const openProspectus = async () => {
    try {
      await Linking.openURL(prospectusUrl);
    } catch {
      Alert.alert("Could not open link", prospectusUrl);
    }
  };

  return (
    <Screen padded>
      <Header back returnTo={params.returnTo} onBack={handleBack} />

      <View className="flex-row items-center mt-1 mb-5">
        <View className="bg-violet-bg w-[56px] h-[56px] rounded-[14px] items-center justify-center mr-3">
          <Icon name="grid" size={26} color="#7C3AED" />
        </View>
        <View className="flex-1">
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
            ETF
          </Text>
          <Text className="text-ink font-monoBold text-[26px]" style={{ letterSpacing: -0.5 }}>
            {etf.symbol}
          </Text>
          <Text className="text-ink-2 text-[14px] font-sansSb">{etf.name}</Text>
        </View>
      </View>

      {/* Tab switcher */}
      <View className="flex-row p-1 bg-track rounded-[12px] mb-4">
        {(["overview", "conviction"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-[10px] items-center ${tab === t ? "bg-bg-surface" : ""}`}
          >
            <Text className={`text-[13px] font-sansBold ${tab === t ? "text-ink" : "text-ink-3"}`}>
              {t === "overview" ? "Overview" : "Conviction"}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "overview" && (
        <>
      <Card pad={16} className="mb-4">
        <Text className="text-ink text-[15px] font-sansMd leading-[22px]">{etf.description}</Text>
        <Text className="text-ink-3 text-[12px] font-sansMd mt-3">
          {curated
            ? `Expense ratio ${etf.expense}% · Illustrative top holdings below`
            : etf.expense > 0
              ? `Expense ratio ${etf.expense}% · Full holdings on issuer site`
              : "Verify fee and holdings on the official fund page"}
        </Text>
      </Card>

      {etf.tags.length > 0 && (
        <View className="mb-5">
          <SectionTitle>Tags</SectionTitle>
          <View className="flex-row flex-wrap gap-1.5">
            {etf.tags.map((t) => (
              <Tag key={t} label={etfTagLabel(t)} tone={etfTagTone(t)} />
            ))}
          </View>
        </View>
      )}

      {bullBear && (
        <BullBearCasesSection symbol={etf.symbol} bull={bullBear.bull} bear={bullBear.bear} />
      )}

      {!curated && (
        <Card pad={14} className="mb-4 bg-brand-bg/30 border-brand/20">
          <Text className="text-brand text-[11px] font-sansX uppercase tracking-wider mb-1">
            Catalog listing
          </Text>
          <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px]">
            Searchable US ETF, add to watchlist or duel. Portfolio X-Ray overlap and Thesis themes
            apply to our {ETFS.length} deep-dive funds; we're expanding coverage over time.
          </Text>
        </Card>
      )}

      {holdings.length > 0 && (
        <>
      <SectionTitle>Top holdings</SectionTitle>
      <Card pad={6} className="mb-4">
        {holdings.map((s, i) => (
          <Pressable
            key={s!.symbol}
            onPress={() =>
              router.push({ pathname: "/(tabs)/stock/[symbol]", params: { symbol: s!.symbol } })
            }
            className={`flex-row items-center px-3 py-3 active:opacity-70 ${
              i < holdings.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <Tick ticker={s!.symbol} size={36} />
            <View className="ml-3 flex-1">
              <Text className="text-ink font-monoBold text-[13px]">{s!.symbol}</Text>
              <Text className="text-ink-2 text-[12px] font-sansMd" numberOfLines={1}>
                {s!.name}
              </Text>
            </View>
            <Icon name="chev" size={14} color="#8C988F" />
          </Pressable>
        ))}
      </Card>
        </>
      )}

      {etf.themes.length > 0 && (
        <>
          <SectionTitle>Thesis themes</SectionTitle>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {etf.themes.map((tid) => {
              const t = themeById(tid);
              return (
                <Pressable
                  key={tid}
                  onPress={() =>
                    router.push({ pathname: "/(tabs)/theme/[id]", params: { id: tid } })
                  }
                  className="px-3 py-1.5 rounded-chip bg-brand-bg border border-brand/20 active:opacity-70"
                >
                  <Text className="text-brand-deep text-[12px] font-sansSb">
                    {t?.title ?? tid}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
        </>
      )}

      {tab === "conviction" && (
        <>
          <Card pad={16} className="mb-4">
            <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
              Thesis alignment score
            </Text>
            <View className="flex-row items-end gap-2 mb-3">
              <Text className="text-ink font-monoBold text-[30px]">
                {convictionScore}
              </Text>
              <Text className="text-ink-3 text-[14px] font-sansMd mb-1">/ 100</Text>
              <View className={`ml-2 mb-1 px-2.5 py-0.5 rounded-[8px] ${
                convictionScore >= 70 ? "bg-brand-bg" : convictionScore >= 45 ? "bg-amber-bg" : convictionScore >= 25 ? "bg-track" : "bg-neg-bg/40"
              }`}>
                <Text className={`text-[11px] font-sansBold ${
                  convictionScore >= 70 ? "text-brand" : convictionScore >= 45 ? "text-amber" : convictionScore >= 25 ? "text-ink-2" : "text-neg"
                }`}>
                  {convictionLabel}
                </Text>
              </View>
            </View>
            <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px]">
              {convictionDescription}
            </Text>
          </Card>

          <Card pad={16} className="mb-4">
            <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-3">
              Score breakdown
            </Text>
            <View className="gap-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-ink text-[14px] font-sansSb">Theme overlap</Text>
                <Text className="text-ink-2 text-[14px] font-sansMd">
                  {themeOverlap} of {themeIds.length || 0} your themes
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-ink text-[14px] font-sansSb">Expense efficiency</Text>
                <Text className="text-ink-2 text-[14px] font-sansMd">
                  {etf.expense <= 0.1 ? "Excellent" : etf.expense <= 0.3 ? "Good" : "Above average"} ({etf.expense}%)
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-ink text-[14px] font-sansSb">Holding quality</Text>
                <Text className="text-ink-2 text-[14px] font-sansMd">
                  {themeOverlap > 0 ? "Relevant to your themes" : "Review individual holdings"}
                </Text>
              </View>
            </View>
          </Card>

          {etf.themes.length > 0 && (
            <Card pad={14} className="mb-4">
              <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-2">
                Connected themes
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {etf.themes.map((tid) => {
                  const t = themeById(tid);
                  const matched = themeIds.includes(tid);
                  return (
                    <Pressable
                      key={tid}
                      onPress={() =>
                        router.push({ pathname: "/(tabs)/theme/[id]", params: { id: tid } })
                      }
                      className={`px-3 py-1.5 rounded-chip border active:opacity-70 ${
                        matched ? "bg-brand-bg border-brand/20" : "bg-bg-surface border-line"
                      }`}
                    >
                      <Text className={`text-[12px] font-sansSb ${matched ? "text-brand-deep" : "text-ink-2"}`}>
                        {matched ? "✓ " : ""}{t?.title ?? tid}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          )}

          <Text className="text-ink-3 text-[11px] font-sansMd leading-[16px] px-1">
            Conviction for ETFs combines theme alignment, expense ratio, and the thesis fit of underlying holdings. The numerical score is illustrative based on profile data; not investment advice.
          </Text>
        </>
      )}

      <View className="mt-4 mb-2">
        <Button
          label="View fund page & prospectus"
          fullWidth
          size="md"
          variant="secondary"
          onPress={openProspectus}
        />
      </View>

      <View className="mt-3 mb-6">
        <Button
          label={watching ? "Remove from watchlist" : "Add to watchlist"}
          fullWidth
          size="md"
          variant={watching ? "secondary" : "primary"}
          onPress={() => toggle(etf.symbol)}
        />
      </View>

      <Text className="text-ink-3 text-[10.5px] font-sansMd leading-[15px] text-center">
        Opens the issuer's website. Educational only, verify holdings and fees on the official
        prospectus before investing.
      </Text>
    </Screen>
  );
}
