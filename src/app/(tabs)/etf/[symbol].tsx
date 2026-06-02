import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";

import { BullBearCasesSection } from "@/components/BullBearCasesSection";
import { Icon } from "@/components/Icon";
import { casesForEtf } from "@/lib/cases";
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

      <Button
        label="View fund page & prospectus"
        fullWidth
        size="md"
        variant="secondary"
        onPress={openProspectus}
      />

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
