import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { ConvictionGate } from "@/components/ConvictionGate";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { LogoImage } from "@/components/ui/LogoImage";
import { Screen } from "@/components/ui/Screen";
import { STOCKS, stockBySymbol } from "@/data/stocks";
import { detectTensions } from "@/lib/portfolio-health";
import { syncToCloud } from "@/lib/sync";
import { searchWatchlistLocal } from "@/lib/watchlist-search";
import { themeById } from "@/data/themes";
import type { ConvictionReason } from "@/store/types";
import { useStore } from "@/store";

const REASON_LABEL: Record<ConvictionReason, string> = {
  "long-term-growth": "Growth story",
  "fits-my-thesis": "Fits thesis",
  valuation: "Valuation",
  "gut-feeling": "Gut / momentum",
  "following-someone": "Following someone",
  "income-yield": "Income",
  diversification: "Diversification",
  other: "Other",
};

/** Conviction portfolio home — what you own, why you own it, where it pulls. */
export default function PortfolioScreen() {
  const router = useRouter();
  const portfolio = useStore((s) => s.portfolio);
  const removeHolding = useStore((s) => s.removeHolding);
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);

  const [query, setQuery] = useState("");
  const [gateSymbols, setGateSymbols] = useState<string[] | null>(null);

  const results = useMemo(
    () =>
      query.trim().length > 0
        ? searchWatchlistLocal(query, profile, themeIds, 6).filter(
            (r) => !portfolio.some((h) => h.symbol === r.symbol)
          )
        : [],
    [query, profile, themeIds, portfolio]
  );

  const tensions = useMemo(
    () => detectTensions(portfolio, STOCKS),
    [portfolio]
  );

  const stats = useMemo(() => {
    const reasons = portfolio.filter((h) => h.reason).length;
    const themes = new Set(
      portfolio.flatMap((h) => stockBySymbol(h.symbol)?.themes ?? [])
    );
    return { holdings: portfolio.length, reasons, themes: themes.size };
  }, [portfolio]);

  return (
    <Screen padded>
      <Header back returnTo="/(tabs)/builder" />

      <View className="pt-2 mb-6">
        <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest">
          Your portfolio
        </Text>
        <Text
          className="text-ink text-[30px] font-displayX mt-2"
          style={{ letterSpacing: -0.7, lineHeight: 34 }}
        >
          Build what you{"\n"}actually believe.
        </Text>
      </View>

      {/* Stats row */}
      <View className="flex-row gap-x-2 mb-4">
        <StatCard label="Holdings" value={String(stats.holdings)} />
        <StatCard label="Reasons logged" value={String(stats.reasons)} />
        <StatCard label="Themes covered" value={String(stats.themes)} />
      </View>

      {/* Tension flags — educational observations, never sell prompts */}
      {tensions.map((t) => (
        <Card
          key={`${t.symbolA}-${t.symbolB}`}
          pad={14}
          className="mb-4 bg-amber-bg border-amber/30"
        >
          <View className="flex-row items-center mb-1">
            <Icon name="bolt" size={14} color="#D98512" sw={2.2} />
            <Text className="text-amber text-[11px] font-sansX uppercase tracking-wider ml-1.5">
              Tension
            </Text>
          </View>
          <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px]">
            {t.description}
          </Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/duel",
                params: { a: t.symbolA, b: t.symbolB },
              } as never)
            }
            className="mt-2 active:opacity-70"
          >
            <Text className="text-brand text-[12.5px] font-sansBold">
              Duel {t.symbolA} vs {t.symbolB} →
            </Text>
          </Pressable>
        </Card>
      ))}

      {/* Holdings */}
      {portfolio.length === 0 ? (
        <Card pad={24} className="mb-4 items-center">
          <View className="bg-brand-bg w-12 h-12 rounded-full items-center justify-center mb-4">
            <Icon name="seed" size={22} color="#0E7A66" sw={2} />
          </View>
          <Text
            className="text-ink font-displayX text-[19px] text-center"
            style={{ letterSpacing: -0.3 }}
          >
            Nothing here yet — on purpose
          </Text>
          <Text className="text-ink-2 text-[13.5px] font-sansMd text-center mt-2 leading-[20px]">
            Every holding you add starts with one question: why? Your reasons
            become the record you test your thesis against.
          </Text>
        </Card>
      ) : (
        <View className="gap-y-2 mb-4">
          {portfolio.map((h) => {
            const stock = stockBySymbol(h.symbol);
            const theme = stock?.themes[0] ? themeById(stock.themes[0]) : null;
            return (
              <Card key={h.id} pad={14}>
                <View className="flex-row items-center">
                  <LogoImage
                    ticker={h.symbol}
                    domain={stock?.domain}
                    size={40}
                  />
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center gap-x-2">
                      <Text className="text-ink font-monoBold text-[14.5px]">
                        {h.symbol}
                      </Text>
                      {h.reason ? (
                        <View className="bg-brand-bg px-2 py-0.5 rounded-[6px]">
                          <Text className="text-brand text-[10px] font-sansX uppercase">
                            {REASON_LABEL[h.reason]}
                          </Text>
                        </View>
                      ) : (
                        <View className="bg-amber-bg px-2 py-0.5 rounded-[6px]">
                          <Text className="text-amber text-[10px] font-sansX uppercase">
                            No reason
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      className="text-ink-2 text-[12.5px] font-sansMd mt-0.5"
                      numberOfLines={1}
                    >
                      {stock?.name ?? h.symbol}
                      {theme ? ` · ${theme.title}` : ""}
                    </Text>
                    {/* Allocation bar */}
                    <View className="flex-row items-center mt-2">
                      <View className="flex-1 h-[5px] rounded-full bg-track overflow-hidden mr-2">
                        <View
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${Math.min(100, h.allocationPct)}%` }}
                        />
                      </View>
                      <Text className="text-ink-2 font-monoBold text-[12px]">
                        {h.allocationPct}%
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => {
                      removeHolding(h.symbol);
                      void syncToCloud();
                    }}
                    className="ml-2 w-[30px] h-[30px] rounded-[9px] bg-bg items-center justify-center active:opacity-70"
                    hitSlop={6}
                  >
                    <Icon name="close" size={13} color="#8C988F" sw={2} />
                  </Pressable>
                </View>
                {h.note ? (
                  <Text className="text-ink-3 text-[12px] font-sansMd italic mt-2 leading-[17px]">
                    “{h.note}”
                  </Text>
                ) : null}
              </Card>
            );
          })}
        </View>
      )}

      {/* Add a holding — search then conviction gate */}
      <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mt-4 mb-3">
        Add a holding
      </Text>
      <View className="bg-bg-surface border border-line rounded-[14px] px-4 py-3 flex-row items-center">
        <Icon name="search" size={16} color="#8C988F" sw={2} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search ticker or company"
          placeholderTextColor="#8C988F"
          autoCapitalize="characters"
          autoCorrect={false}
          className="text-ink text-[15px] font-sansMd ml-2 flex-1"
        />
      </View>
      {results.length > 0 && (
        <View className="bg-bg-surface border border-line rounded-[14px] mt-2 overflow-hidden">
          {results.map((r, i) => (
            <Pressable
              key={r.symbol}
              onPress={() => {
                setGateSymbols([r.symbol]);
                setQuery("");
              }}
              className={`flex-row items-center px-4 py-3 active:opacity-70 ${
                i === results.length - 1 ? "" : "border-b border-line"
              }`}
            >
              <View className="flex-1">
                <Text className="text-ink font-monoBold text-[14px]">
                  {r.symbol}
                </Text>
                <Text
                  className="text-ink-2 text-[12.5px] font-sansMd"
                  numberOfLines={1}
                >
                  {r.name}
                </Text>
              </View>
              <Icon name="plus" size={16} color="#0E7A66" sw={2.4} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Copy a lens */}
      <View className="mt-5 mb-2">
        <Button
          label="Copy a lens"
          variant="secondary"
          fullWidth
          size="lg"
          onPress={() => router.push("/lenses" as never)}
        />
        <Text className="text-ink-3 text-[11.5px] font-sansMd text-center mt-3 leading-[17px]">
          When you add a stock from a lens, we'll ask you why — you should own
          your reason, not just the ticker.
        </Text>
      </View>

      <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-4 mb-2">
        Educational only · not investment advice
      </Text>

      <ConvictionGate
        visible={gateSymbols != null}
        symbols={gateSymbols ?? []}
        onClose={() => setGateSymbols(null)}
      />
    </Screen>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-bg-surface border border-line rounded-[12px] p-3 flex-1">
      <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider">
        {label}
      </Text>
      <Text className="text-ink font-monoBold text-[20px] mt-1">{value}</Text>
    </View>
  );
}
