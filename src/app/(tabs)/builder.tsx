import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ScoreBar } from "@/components/ui/Progress";
import { Tag } from "@/components/ui/Tag";
import { Tick } from "@/components/ui/Tick";
import { STOCKS, stockBySymbol } from "@/data/stocks";
import { THEMES, themeById } from "@/data/themes";
import { personaForTheme } from "@/data/thesis-personas";
import { scoreThesis } from "@/lib/thesis-score";
import { useStore } from "@/store";

export default function BuilderScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const [fitQuery, setFitQuery] = useState("");

  const yourThemes = themeIds.map((id) => themeById(id)!).filter(Boolean);

  // Quick-fit lookup
  const fitStock = fitQuery.trim()
    ? stockBySymbol(fitQuery.trim().toUpperCase())
    : undefined;
  const fitResult = fitStock ? scoreThesis(fitStock, profile, themeIds) : null;

  // Global screener — rank top stocks by thesis alignment
  const screened = useMemo(() => {
    if (themeIds.length === 0) return [];
    return [...STOCKS]
      .map((s) => ({ stock: s, result: scoreThesis(s, profile, themeIds) }))
      .sort((a, b) => b.result.overall - a.result.overall)
      .slice(0, 12);
  }, [profile, themeIds]);

  return (
    <Screen padded>
      <View className="pt-4 mb-5">
        <Text
          className="text-ink font-displayX text-[28px]"
          style={{ letterSpacing: -0.6, lineHeight: 32 }}
        >
          Builder
        </Text>
        <Text className="text-ink-2 text-[14.5px] font-sansMd mt-1 leading-[20px]">
          Explore theses. Find investments that fit.
        </Text>
      </View>

      {/* Your theses */}
      {yourThemes.length > 0 && (
        <View className="mb-6">
          <SectionTitle>Your theses</SectionTitle>
          <View className="gap-y-2.5">
            {yourThemes.map((t) => {
              const p = personaForTheme(t.id);
              return (
                <Pressable
                  key={t.id}
                  onPress={() => router.push({ pathname: "/(tabs)/builder/[id]", params: { id: t.id } })}
                  className="flex-row items-center bg-bg-surface border border-line rounded-[14px] p-3.5 active:opacity-70"
                >
                  <View
                    className="items-center justify-center mr-3"
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      backgroundColor: `${t.color}1F`,
                    }}
                  >
                    <Icon name={t.glyph as IconName} size={20} color={t.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-ink font-displayX text-[15px]" style={{ letterSpacing: -0.2 }}>
                      {t.title}
                    </Text>
                    {p && (
                      <Text className="text-ink-3 text-[11.5px] font-sansMd mt-0.5" numberOfLines={1}>
                        {p.personaName} · {p.tagline}
                      </Text>
                    )}
                  </View>
                  <View className="w-[28px] h-[28px] rounded-[8px] bg-brand items-center justify-center">
                    <Icon name="arrow" size={14} color="#FFFFFF" sw={2.5} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Browse library CTA */}
      <Card pad={14} className="mb-6" onPress={() => router.push("/(tabs)/themes")}>
        <View className="flex-row items-center">
          <View className="bg-brand-bg w-[40px] h-[40px] rounded-[12px] items-center justify-center mr-3">
            <Icon name="discover" size={20} color="#0E7A66" sw={2} />
          </View>
          <View className="flex-1">
            <Text className="text-ink font-displayX text-[14px]" style={{ letterSpacing: -0.2 }}>
              Browse thesis library
            </Text>
            <Text className="text-ink-2 text-[12px] font-sansMd mt-0.5">
              12 philosophies — adopt one, build around it.
            </Text>
          </View>
          <Icon name="chev" size={16} color="#8C988F" />
        </View>
      </Card>

      {/* Build your own */}
      <Card pad={16} className="mb-5" onPress={() => router.push({ pathname: "/(tabs)/builder/build" })}>
        <View className="flex-row items-start">
          <View className="bg-brand-bg w-[44px] h-[44px] rounded-[14px] items-center justify-center mr-3.5">
            <Icon name="sparkle" size={22} color="#0E7A66" sw={2} />
          </View>
          <View className="flex-1">
            <Text className="text-ink font-displayX text-[17px]" style={{ letterSpacing: -0.2 }}>
              Build your own thesis
            </Text>
            <Text className="text-ink-2 text-[13px] font-sansMd mt-1 leading-[19px]">
              Combine themes, name your frame, and see which stocks align with what you believe.
            </Text>
          </View>
        </View>
        <View className="mt-4">
          <Button label="Start building" fullWidth size="md" variant="primary" />
        </View>
      </Card>

      {/* Quick fit check */}
      <SectionTitle>Does this fit?</SectionTitle>
      <Card pad={14} className="mb-5">
        <TextInput
          className="text-ink font-monoBold text-[15px] bg-bg-subtle rounded-[12px] px-4 py-3"
          placeholder="Type a ticker…"
          placeholderTextColor="#8C988F"
          autoCapitalize="characters"
          maxLength={5}
          value={fitQuery}
          onChangeText={setFitQuery}
        />

        {fitStock && fitResult && (
          <View className="mt-3 pt-3 border-t border-line">
            <Pressable
              onPress={() =>
                router.push({ pathname: "/(tabs)/stock/[symbol]", params: { symbol: fitStock.symbol } })
              }
              className="flex-row items-center active:opacity-70"
            >
              <Tick ticker={fitStock.symbol} size={42} />
              <View className="ml-3 flex-1">
                <Text className="text-ink text-[15px] font-sansBold">{fitStock.name}</Text>
                <Text className="text-ink-2 text-[12px] font-sansMd mt-0.5" numberOfLines={1}>
                  {fitResult.topReason}
                </Text>
              </View>
              <View
                className="w-[48px] h-[48px] rounded-[12px] items-center justify-center"
                style={{
                  backgroundColor:
                    fitResult.overall >= 70 ? "#E5F5EC" : fitResult.overall >= 45 ? "#FCF1E0" : "#FBEAE5",
                }}
              >
                <Text
                  className="font-displayX text-[18px]"
                  style={{
                    color: fitResult.overall >= 70 ? "#149059" : fitResult.overall >= 45 ? "#D98512" : "#D8472C",
                    letterSpacing: -0.5,
                  }}
                >
                  {fitResult.overall}
                </Text>
              </View>
            </Pressable>

            {/* Sub-scores */}
            <View className="mt-3 gap-y-2">
              {fitResult.breakdown.slice(0, 4).map((b) => (
                <View key={b.category}>
                  <View className="flex-row justify-between mb-0.5">
                    <Text className="text-ink-3 text-[10.5px] font-sansSb">{b.label}</Text>
                    <Text
                      className={`text-[11px] font-monoBold ${
                        b.tone === "pos" ? "text-pos" : b.tone === "neg" ? "text-neg" : "text-amber"
                      }`}
                    >
                      {b.score}
                    </Text>
                  </View>
                  <ScoreBar value={b.score} height={3} />
                </View>
              ))}
            </View>
          </View>
        )}
      </Card>

      {/* Screener — top alignment picks */}
      {screened.length > 0 && (
        <View className="mb-6">
          <SectionTitle>Top picks for your thesis</SectionTitle>
          <Card pad={6}>
            {screened.map(({ stock, result }, i) => (
              <Pressable
                key={stock.symbol}
                onPress={() =>
                  router.push({ pathname: "/(tabs)/stock/[symbol]", params: { symbol: stock.symbol } })
                }
                className={`flex-row items-center px-3 py-2.5 active:opacity-60 ${
                  i < screened.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <Text className="text-ink-3 text-[11px] font-monoSb w-6">{i + 1}</Text>
                <View className="flex-1 ml-1">
                  <View className="flex-row items-center">
                    <Text className="text-ink font-monoBold text-[13px] mr-2">
                      {stock.symbol}
                    </Text>
                    <Tag
                      label={result.overall >= 70 ? "Strong" : result.overall >= 45 ? "Moderate" : "Watch"}
                      tone={result.overall >= 70 ? "pos" : result.overall >= 45 ? "amber" : "neg"}
                    />
                  </View>
                  <Text className="text-ink-2 text-[11.5px] font-sansMd mt-0.5" numberOfLines={1}>
                    {stock.thesis}
                  </Text>
                </View>
                <Text className="text-ink text-[15px] font-monoBold ml-3">{result.overall}</Text>
              </Pressable>
            ))}
          </Card>
        </View>
      )}

      {/* Learn link */}
      <View className="mt-2 mb-4">
        <Button
          label="Learn investing concepts"
          fullWidth
          size="md"
          variant="secondary"
          onPress={() => router.push("/learn")}
        />
      </View>

      <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-2 mb-4">
        Educational tool. Not investment advice.
      </Text>
    </Screen>
  );
}
