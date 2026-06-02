import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { ThesisPerformancePreview } from "@/components/thesis/ThesisPerformancePreview";
import { WhyThesisVsIndex } from "@/components/duel/WhyThesisVsIndex";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import { Tick } from "@/components/ui/Tick";
import { climateById, INVESTING_CLIMATES } from "@/data/investing-climates";
import { THEMES, themeById } from "@/data/themes";
import { matchClimates } from "@/lib/climate-explorer";
import { buildThesisPortfolio } from "@/lib/thesis-portfolio-builder";
import { DEFAULT_PIE_CUSTOMIZATION } from "@/types/pie-customization";
import { useStore } from "@/store";
import type { ThemeId } from "@/store/types";

type Step = "climates" | "compose" | "portfolio";

export default function ThesisStudioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ climateId?: string }>();
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const setThemeIds = useStore((s) => s.setThemeIds);
  const setCustomThesis = useStore((s) => s.setCustomThesis);
  const setModelThesis = useStore((s) => s.setModelThesis);
  const modelThesis = useStore((s) => s.modelThesis);

  const initialClimate = params.climateId ? climateById(params.climateId) : undefined;

  const [step, setStep] = useState<Step>(initialClimate ? "compose" : "climates");
  const [climateId, setClimateId] = useState<string | null>(initialClimate?.id ?? null);
  const [climateQuery, setClimateQuery] = useState("");
  const [thesisName, setThesisName] = useState(initialClimate?.title ?? "");
  const [conviction, setConviction] = useState(initialClimate?.implication ?? "");
  const [picked, setPicked] = useState<Set<ThemeId>>(
    () =>
      new Set(
        initialClimate
          ? [...new Set([...themeIds, ...initialClimate.themeIds])]
          : themeIds
      )
  );

  const climate = climateId ? climateById(climateId) : undefined;
  const matchedClimates = useMemo(
    () => matchClimates(climateQuery, 6),
    [climateQuery]
  );

  const pickedArr = [...picked];
  const built = useMemo(() => {
    if (step !== "portfolio" || pickedArr.length === 0) return null;
    return buildThesisPortfolio({
      name: thesisName,
      conviction,
      profile,
      themeIds: pickedArr,
      climateId,
    });
  }, [step, thesisName, conviction, profile, pickedArr, climateId]);

  const togglePick = (id: ThemeId) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectClimate = (id: string) => {
    const c = climateById(id);
    if (!c) return;
    setClimateId(id);
    setThesisName(c.title);
    setConviction(c.implication);
    setPicked((prev) => new Set([...prev, ...c.themeIds]));
    setStep("compose");
  };

  const handleSave = () => {
    if (!built) return;
    setCustomThesis(built.name, built.conviction);
    setThemeIds(built.themeIds);
    setModelThesis({
      name: built.name,
      conviction: built.conviction,
      climateId: built.climateId,
      themeIds: built.themeIds,
      holdings: built.holdings,
      appliedLifeScenarios: modelThesis?.appliedLifeScenarios ?? [],
      stressSummaries: modelThesis?.stressSummaries ?? [],
      radarReports: modelThesis?.radarReports ?? [],
      pieCustomization: modelThesis?.pieCustomization ?? DEFAULT_PIE_CUSTOMIZATION,
    });
    router.back();
  };

  return (
    <Screen padded>
      <Header
        back
        title="Thesis Studio"
        subtitle="Formulate a climate-aware book with weights and performance vs SPY."
      />

      {modelThesis && step === "climates" && (
        <Card pad={16} className="mb-5 border-brand/25 bg-brand-bg/15">
          <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest mb-1">
            Saved model book
          </Text>
          <Text className="text-ink font-displayX text-[18px]" style={{ letterSpacing: -0.3 }}>
            {modelThesis.name}
          </Text>
          <Text className="text-ink-2 text-[12px] font-sansMd mt-2">
            {modelThesis.holdings.length} positions ·{" "}
            {modelThesis.holdings.map((h) => `${h.symbol} ${h.weightPct}%`).join(" · ")}
          </Text>
          <Pressable
            onPress={() => {
              setThesisName(modelThesis.name);
              setConviction(modelThesis.conviction);
              setClimateId(modelThesis.climateId);
              setPicked(new Set(modelThesis.themeIds));
              setStep("portfolio");
            }}
            className="mt-3 active:opacity-70"
          >
            <Text className="text-brand text-[12px] font-sansBold">View performance →</Text>
          </Pressable>
        </Card>
      )}

      {step === "climates" && (
        <>
          <TextInput
            className="text-ink text-[14px] font-sansMd bg-bg-surface border border-line rounded-[14px] px-4 py-3 mb-4"
            placeholder='Paste a headline or theme, e.g. "quantum grants" or "inflation"'
            placeholderTextColor="#8C988F"
            value={climateQuery}
            onChangeText={setClimateQuery}
          />

          <SectionTitle>Investing climates</SectionTitle>
          <Text className="text-ink-2 text-[12.5px] font-sansMd -mt-2 mb-3 leading-[18px]">
            We map news and macro stories to favor/avoid names, then help you build a weighted model portfolio.
          </Text>

          <View className="gap-y-2.5 mb-6">
            {(climateQuery ? matchedClimates : INVESTING_CLIMATES).map((c) => (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/explore-climate/${c.id}` as never)}
                className="bg-bg-surface border border-line rounded-[14px] p-4 active:opacity-70"
              >
                <Text className="text-ink font-displayX text-[15px]" style={{ letterSpacing: -0.2 }}>
                  {c.title}
                </Text>
                <Text className="text-ink-2 text-[12px] font-sansMd mt-1 leading-[17px]" numberOfLines={2}>
                  {c.exampleHeadline}
                </Text>
                <View className="flex-row items-center justify-between mt-3">
                  <Pressable
                    onPress={() => selectClimate(c.id)}
                    className="active:opacity-70"
                  >
                    <Text className="text-brand text-[12px] font-sansBold">Build thesis →</Text>
                  </Pressable>
                  <Icon name="chev" size={16} color="#8C988F" />
                </View>
              </Pressable>
            ))}
          </View>

          <Button
            label="Skip, compose without a climate"
            fullWidth
            size="md"
            variant="secondary"
            onPress={() => setStep("compose")}
          />
        </>
      )}

      {step === "compose" && (
        <>
          {climate && (
            <Card pad={14} className="mb-4 border-brand/20">
              <Text className="text-brand text-[10px] font-sansX uppercase tracking-widest mb-1">
                Active climate
              </Text>
              <Text className="text-ink font-sansBold text-[14px]">{climate.title}</Text>
              <Pressable onPress={() => setStep("climates")} className="mt-2 active:opacity-70">
                <Text className="text-ink-3 text-[11px] font-sansMd">Change climate</Text>
              </Pressable>
            </Card>
          )}

          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
            Thesis name
          </Text>
          <TextInput
            className="text-ink font-displayX text-[20px] bg-bg-surface border border-line rounded-[14px] px-4 py-3 mb-4"
            placeholder="e.g. Quantum policy sleeve"
            placeholderTextColor="#8C988F"
            value={thesisName}
            onChangeText={setThesisName}
            maxLength={60}
          />

          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
            Your conviction
          </Text>
          <TextInput
            className="text-ink text-[14px] font-sansMd bg-bg-surface border border-line rounded-[14px] px-4 py-3 mb-4"
            placeholder="What you believe about this climate…"
            placeholderTextColor="#8C988F"
            multiline
            style={{ minHeight: 80, textAlignVertical: "top" }}
            value={conviction}
            onChangeText={setConviction}
            maxLength={400}
          />

          <SectionTitle>Themes</SectionTitle>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {THEMES.map((t) => {
              const active = picked.has(t.id);
              return (
                <Pressable
                  key={t.id}
                  onPress={() => togglePick(t.id)}
                  className={`flex-row items-center px-3 py-2 rounded-[12px] border ${
                    active ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
                  }`}
                >
                  <Icon name={t.glyph as IconName} size={13} color={active ? "#0E7A66" : "#8C988F"} />
                  <Text
                    className={`text-[12px] font-sansSb ml-1.5 ${
                      active ? "text-brand" : "text-ink-2"
                    }`}
                  >
                    {t.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            label={picked.size === 0 ? "Pick at least one theme" : "Generate model portfolio"}
            fullWidth
            size="lg"
            variant="primary"
            disabled={picked.size === 0}
            onPress={() => setStep("portfolio")}
          />
          <View className="mt-3 mb-4">
            <Button
              label="Back"
              fullWidth
              size="md"
              variant="secondary"
              onPress={() => setStep("climates")}
            />
          </View>
        </>
      )}

      {step === "portfolio" && built && (
        <>
          <Card pad={16} className="mb-4">
            <Text className="text-ink font-displayX text-[20px]" style={{ letterSpacing: -0.4 }}>
              {built.name}
            </Text>
            {built.rationale.map((line, i) => (
              <Text key={i} className="text-ink-2 text-[13px] font-sansMd mt-2 leading-[19px]">
                {line}
              </Text>
            ))}
            <View className="flex-row flex-wrap gap-1.5 mt-3">
              {built.themeIds.map((tid) => {
                const t = themeById(tid);
                return t ? <Tag key={tid} label={t.title} tone="pos" /> : null;
              })}
            </View>
          </Card>

          <ThesisPerformancePreview name={built.name} backtest={built.backtest} />
          <WhyThesisVsIndex compact />

          <SectionTitle>Recommended weights</SectionTitle>
          <Card pad={6} className="mb-5">
            {built.candidates.map((c, i) => (
              <Pressable
                key={c.symbol}
                onPress={() =>
                  router.push({
                    pathname: c.kind === "etf" ? "/(tabs)/etf/[symbol]" : "/(tabs)/stock/[symbol]",
                    params: { symbol: c.symbol },
                  } as never)
                }
                className={`flex-row items-center px-3 py-3 active:opacity-60 ${
                  i < built.candidates.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <Tick ticker={c.symbol} size={36} />
                <View className="flex-1 ml-2.5">
                  <Text className="text-ink font-monoBold text-[13px]">
                    {c.symbol} · {c.weightPct}%
                  </Text>
                  <Text className="text-ink text-[12px] font-sansBold" numberOfLines={1}>
                    {c.name}
                  </Text>
                  <Text className="text-ink-2 text-[11px] font-sansMd mt-0.5" numberOfLines={2}>
                    {c.role}
                  </Text>
                </View>
                <Tag
                  label={String(c.score)}
                  tone={c.score >= 70 ? "pos" : c.score >= 45 ? "amber" : "neg"}
                />
              </Pressable>
            ))}
          </Card>

          {built.avoidSymbols.length > 0 && (
            <>
              <SectionTitle>Avoid in this climate</SectionTitle>
              <Card pad={14} className="mb-5">
                <Text className="text-ink-2 text-[12px] font-sansMd leading-[17px]">
                  {climate?.avoid.map((a) => `${a.symbol}: ${a.reason}`).join("\n\n")}
                </Text>
              </Card>
            </>
          )}

          <Button label="Save model thesis" fullWidth size="lg" variant="primary" onPress={handleSave} />
          {built.holdings.length >= 1 && (
            <View className="mt-3 mb-2">
              <Button
                label="Duel top holding vs SPY"
                fullWidth
                size="md"
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: "/duel",
                    params: { a: built.holdings[0].symbol, b: "SPY" },
                  } as never)
                }
              />
            </View>
          )}
          <Button
            label="Edit composition"
            fullWidth
            size="md"
            variant="secondary"
            onPress={() => setStep("compose")}
          />
        </>
      )}

      {step === "portfolio" && !built && (
        <Card pad={16} className="mb-4">
          <Text className="text-ink font-sansBold text-[15px]">Could not build a portfolio</Text>
          <Text className="text-ink-2 text-[13px] font-sansMd mt-2">
            Add themes or pick a climate with favor names we can resolve.
          </Text>
          <View className="mt-4">
            <Button
              label="Back to compose"
              fullWidth
              size="md"
              variant="primary"
              onPress={() => setStep("compose")}
            />
          </View>
        </Card>
      )}

      <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-4 mb-6">
        Educational tool. Not investment advice.
      </Text>
    </Screen>
  );
}
