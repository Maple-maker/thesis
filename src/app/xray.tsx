import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import { runPortfolioXray } from "@/lib/portfolio-xray";
import { useStore, selectPlaidConnected } from "@/store";

export default function PortfolioXrayScreen() {
  const router = useRouter();
  const holdings = useStore((s) => s.holdings);
  const themeIds = useStore((s) => s.themeIds);
  const connected = useStore(selectPlaidConnected);
  const connectDemoAccounts = useStore((s) => s.connectDemoAccounts);

  const xray = useMemo(
    () => runPortfolioXray(holdings, themeIds),
    [holdings, themeIds]
  );

  const openDuel = (a: string, b: string) => {
    router.push({ pathname: "/duel", params: { a, b } } as any);
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
            Phase 1 · Holdings analysis
          </Text>
          <Text className="text-ink font-displayX text-[26px]" style={{ letterSpacing: -0.5 }}>
            Portfolio X-Ray
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-ink-2 text-[14px] font-sansMd leading-[21px] mb-4">{xray.summary}</Text>

        {!holdings.length && (
          <Card pad={14} className="mb-4 border-dashed border-brand/40">
            <Text className="text-ink font-sansBold text-[15px]">Load a book to scan</Text>
            <Text className="text-ink-2 text-[13px] font-sansMd mt-2 leading-[19px]">
              Demo holdings include VOO + NVDA + SCHD, built to surface overlap in tonight's demo.
            </Text>
            <View className="mt-3 gap-y-2">
              <Button label="Load demo portfolio" fullWidth onPress={connectDemoAccounts} />
              <Pressable onPress={() => router.push("/accounts" as any)} className="py-2 items-center">
                <Text className="text-brand font-sansBold text-[13px]">Or connect accounts →</Text>
              </Pressable>
            </View>
          </Card>
        )}

        {connected && holdings.length > 0 && (
          <Text className="text-ink-3 text-[11px] font-sansMd mb-4">
            {holdings.length} positions · illustrative ETF look-through
          </Text>
        )}

        <SectionTitle>Effective exposure</SectionTitle>
        <Text className="text-ink-3 text-[12px] font-sansMd mb-2 -mt-2">
          Direct holdings + estimated ETF look-through
        </Text>
        {xray.topUnderlying.length === 0 ? (
          <Card pad={14} className="mb-6">
            <Text className="text-ink-2 text-[13px] font-sansMd">No positions to analyze yet.</Text>
          </Card>
        ) : (
          <Card pad={0} className="overflow-hidden mb-6">
            {xray.topUnderlying.map((u, i) => (
              <View
                key={u.symbol}
                className={`px-4 py-3 ${i < xray.topUnderlying.length - 1 ? "border-b border-line" : ""}`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-ink font-monoBold text-[14px]">{u.symbol}</Text>
                    <Text className="text-ink-3 text-[11px] font-sansMd" numberOfLines={1}>
                      {u.name}
                    </Text>
                  </View>
                  <Text className="text-ink font-monoBold text-[15px]">{u.effectivePct}%</Text>
                </View>
                {(u.directPct > 0 || u.viaEtfPct > 0) && (
                  <Text className="text-ink-3 text-[11px] font-sansMd mt-1">
                    {u.directPct > 0 ? `${u.directPct}% direct` : ""}
                    {u.directPct > 0 && u.viaEtfPct > 0 ? " · " : ""}
                    {u.viaEtfPct > 0 ? `${u.viaEtfPct}% via ETFs` : ""}
                  </Text>
                )}
              </View>
            ))}
          </Card>
        )}

        <SectionTitle>Overlap flags</SectionTitle>
        {xray.overlaps.length === 0 ? (
          <Card pad={14} className="mb-6">
            <Text className="text-ink-2 text-[13px] font-sansMd">
              No major double-counting detected on this pass.
            </Text>
          </Card>
        ) : (
          <View className="gap-y-2.5 mb-6">
            {xray.overlaps.map((o) => (
              <Card key={o.id} pad={14}>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-ink font-sansBold text-[15px] flex-1 pr-2">{o.title}</Text>
                  <Tag
                    label={o.severity === "high" ? "High" : "Medium"}
                    tone={o.severity === "high" ? "amber" : "default"}
                  />
                </View>
                <Text className="text-ink-2 text-[13.5px] font-sansMd leading-[20px]">{o.detail}</Text>
                <View className="flex-row flex-wrap items-center gap-2 mt-3">
                  {o.symbols.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/etf/[symbol]",
                          params: { symbol: s },
                        } as any)
                      }
                    >
                      <Text className="text-brand font-monoBold text-[12px]">{s}</Text>
                    </Pressable>
                  ))}
                  {o.duelParams && (
                    <Pressable
                      onPress={() => openDuel(o.duelParams!.a, o.duelParams!.b)}
                      className="ml-auto active:opacity-70"
                    >
                      <Text className="text-brand font-sansBold text-[12px]">Duel →</Text>
                    </Pressable>
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}

        <SectionTitle>What's lacking</SectionTitle>
        <Card pad={14} className="mb-6">
          {xray.lacking.map((line, i) => (
            <View key={i} className={`flex-row ${i > 0 ? "mt-2" : ""}`}>
              <Text className="text-brand mr-2">•</Text>
              <Text className="text-ink-2 text-[13.5px] font-sansMd flex-1 leading-[19px]">{line}</Text>
            </View>
          ))}
        </Card>

        <SectionTitle>Theme exposure</SectionTitle>
        {xray.themeExposure.length === 0 ? (
          <Card pad={14} className="mb-6">
            <Text className="text-ink-2 text-[13px] font-sansMd">No theme mapping yet.</Text>
          </Card>
        ) : (
          <Card pad={0} className="overflow-hidden mb-6">
            {xray.themeExposure.map((t, i) => (
              <View
                key={t.themeId}
                className={`px-4 py-3 flex-row items-center justify-between ${
                  i < xray.themeExposure.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <Text className="text-ink font-sansSb text-[14px] flex-1 pr-2">{t.title}</Text>
                <View className="flex-row items-center">
                  <View
                    className="h-2 bg-brand rounded-full mr-2"
                    style={{ width: Math.min(80, t.pct * 2) }}
                  />
                  <Text className="text-ink font-monoBold text-[14px] w-[48px] text-right">
                    {t.pct}%
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        <SectionTitle>Gaps vs your thesis</SectionTitle>
        {xray.gaps.length === 0 ? (
          <Card pad={14} className="mb-6">
            <Text className="text-ink-2 text-[13px] font-sansMd">
              Matched themes show at least ~5% exposure in this book.
            </Text>
          </Card>
        ) : (
          <View className="gap-y-2.5 mb-6">
            {xray.gaps.map((g) => (
              <Card key={g.themeId} pad={14}>
                <Text className="text-ink font-sansBold text-[15px]">{g.title}</Text>
                <Text className="text-ink-3 text-[12px] font-sansMd mt-0.5">
                  Current exposure ~{g.exposurePct}%
                </Text>
                <Text className="text-ink-2 text-[13.5px] font-sansMd mt-2 leading-[20px]">
                  {g.message}
                </Text>
                <Pressable
                  onPress={() => router.push("/screener" as any)}
                  className="mt-2 active:opacity-70"
                >
                  <Text className="text-brand text-[13px] font-sansBold">Find ETFs by theme →</Text>
                </Pressable>
              </Card>
            ))}
          </View>
        )}

        <Button label="Open Duel" fullWidth onPress={() => router.push("/duel" as any)} />
        <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-6 leading-[16px]">
          Educational only, not tax or allocation advice. Verify ETF holdings on issuer sites.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
