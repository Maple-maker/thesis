import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import { ScoreBar } from "@/components/ui/Progress";
import { Tick } from "@/components/ui/Tick";
import { STOCKS } from "@/data/stocks";
import { THEMES, themeById } from "@/data/themes";
import { personaForTheme } from "@/data/thesis-personas";
import { scoreThesis } from "@/lib/thesis-score";
import { rankStocksForTheme } from "@/lib/theme-engine";
import { MAX_ACTIVE_THEMES, THESIS_LIMIT_COPY } from "@/lib/thesis-limits";
import { useStore } from "@/store";
import type { ThemeId, UserProfile } from "@/store/types";

export default function BuildThesis() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const currentThemeIds = useStore((s) => s.themeIds);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const setCustomThesis = useStore((s) => s.setCustomThesis);
  const savedCustom = useStore((s) => s.customThesis);

  const [thesisName, setThesisName] = useState(savedCustom?.name ?? "");
  const [thesisNote, setThesisNote] = useState(savedCustom?.note ?? "");
  const [picked, setPicked] = useState<Set<ThemeId>>(new Set(currentThemeIds));
  const [step, setStep] = useState<"build" | "preview">("build");

  const togglePick = (id: ThemeId) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      if (next.size >= MAX_ACTIVE_THEMES) {
        Alert.alert(THESIS_LIMIT_COPY.headline, THESIS_LIMIT_COPY.atCapacity);
        return prev;
      }
      next.add(id);
      return next;
    });
  };

  const pickedArr = [...picked];
  const pickedThemes = pickedArr.map((id) => themeById(id)!).filter(Boolean);

  // Screened stocks from selected themes
  const screened = useMemo(() => {
    if (pickedArr.length === 0) return [];
    const seen = new Set<string>();
    const results: { symbol: string; name: string; thesis: string; score: number }[] = [];
    for (const tid of pickedArr) {
      const ranked = rankStocksForTheme(tid, profile, 5);
      for (const s of ranked) {
        if (seen.has(s.symbol)) continue;
        seen.add(s.symbol);
        const scr = scoreThesis(s, profile, pickedArr);
        results.push({ symbol: s.symbol, name: s.name, thesis: s.thesis, score: scr.overall });
      }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [pickedArr, profile]);

  // Average alignment
  const avgScore = useMemo(() => {
    if (screened.length === 0) return null;
    return Math.round(screened.reduce((a, b) => a + b.score, 0) / screened.length);
  }, [screened]);

  const handleSave = () => {
    if (thesisName.trim() || thesisNote.trim()) {
      setCustomThesis(thesisName, thesisNote);
    }
    for (const tid of pickedArr) {
      if (!currentThemeIds.includes(tid)) toggleTheme(tid);
    }
    for (const tid of currentThemeIds) {
      if (!picked.has(tid)) toggleTheme(tid);
    }
    router.back();
  };

  return (
    <Screen padded>
      <Header back title={step === "build" ? "Build your thesis" : "Preview"} />

      {step === "build" ? (
        <>
          {/* Name */}
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2 mt-2">
            Name your thesis
          </Text>
          <TextInput
            className="text-ink font-displayX text-[22px] bg-bg-surface border border-line rounded-[14px] px-4 py-3.5 mb-5"
            placeholder="e.g. The AI Supply Chain thesis"
            placeholderTextColor="#8C988F"
            style={{ letterSpacing: -0.4 }}
            value={thesisName}
            onChangeText={setThesisName}
            maxLength={60}
          />

          {/* Conviction note */}
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
            Your conviction, what do you believe?
          </Text>
          <TextInput
            className="text-ink text-[14px] font-sansMd bg-bg-surface border border-line rounded-[14px] px-4 py-3.5 mb-5"
            placeholder="e.g. I believe AI chip demand will double in the next 3 years, and the companies supplying compute infrastructure will capture the most value."
            placeholderTextColor="#8C988F"
            multiline
            numberOfLines={4}
            style={{ minHeight: 90, textAlignVertical: "top" }}
            value={thesisNote}
            onChangeText={setThesisNote}
            maxLength={300}
          />

          {/* Theme picks */}
          <SectionTitle>Which themes does it draw from?</SectionTitle>
          <Text className="text-ink-2 text-[12.5px] font-sansMd mb-3 leading-[17px]">
            Pick up to {MAX_ACTIVE_THEMES} themes, {THESIS_LIMIT_COPY.body}
          </Text>

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
                  <View
                    className="items-center justify-center mr-2"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 7,
                      backgroundColor: `${t.color}1F`,
                    }}
                  >
                    <Icon name={t.glyph as IconName} size={13} color={t.color} />
                  </View>
                  <Text
                    className={`text-[13px] font-sansSb ${
                      active ? "text-brand" : "text-ink-2"
                    }`}
                  >
                    {t.title}
                  </Text>
                  {active && (
                    <Icon name="check" size={14} color="#0E7A66" sw={2.5} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <Text className="text-ink-3 text-[11px] font-sansMd text-center mb-2">
            {picked.size}/{MAX_ACTIVE_THEMES} themes selected
          </Text>

          <Button
            label={picked.size === 0 ? "Pick at least one theme" : "Preview your thesis"}
            fullWidth
            size="lg"
            variant="primary"
            disabled={picked.size === 0}
            onPress={() => setStep("preview")}
          />
        </>
      ) : (
        <>
          {/* Preview */}
          {pickedThemes.length > 0 && (
            <>
              {/* Thesis card */}
              <View className="mt-2 mb-5">
                <Card pad={20}>
                  <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-1">
                    Your custom thesis
                  </Text>
                  <Text
                    className="text-ink text-[22px] font-displayX leading-[26px]"
                    style={{ letterSpacing: -0.5 }}
                  >
                    {thesisName || "Untitled thesis"}
                  </Text>
                  {thesisNote ? (
                    <Text className="text-ink-2 text-[14px] font-sansMd mt-3 leading-[20px]">
                      "{thesisNote}"
                    </Text>
                  ) : null}

                  {/* Picked themes */}
                  <View className="flex-row flex-wrap gap-1.5 mt-4">
                    {pickedThemes.map((t) => (
                      <View key={t.id} className="flex-row items-center bg-bg-subtle px-2 py-1 rounded-[7px]">
                        <View
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 4,
                            backgroundColor: t.color,
                            marginRight: 5,
                          }}
                        />
                        <Text className="text-ink-2 text-[11px] font-sansSb">{t.title}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Alignment score */}
                  {avgScore !== null && (
                    <View className="flex-row items-center mt-4 pt-4 border-t border-line">
                      <View
                        className="w-[40px] h-[40px] rounded-[10px] items-center justify-center mr-3"
                        style={{
                          backgroundColor:
                            avgScore >= 70 ? "#E5F5EC" : avgScore >= 45 ? "#FCF1E0" : "#FBEAE5",
                        }}
                      >
                        <Text
                          className="font-displayX text-[17px]"
                          style={{
                            color: avgScore >= 70 ? "#149059" : avgScore >= 45 ? "#D98512" : "#D8472C",
                            letterSpacing: -0.5,
                          }}
                        >
                          {avgScore}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-ink text-[14px] font-sansBold">Thesis coherence</Text>
                        <Text className="text-ink-2 text-[12px] font-sansMd mt-0.5">
                          Avg stock alignment across your themes.
                        </Text>
                      </View>
                    </View>
                  )}
                </Card>
              </View>

              {/* Screened stocks */}
              {screened.length > 0 && (
                <View className="mb-6">
                  <SectionTitle>Top matches</SectionTitle>
                  <Card pad={6}>
                    {screened.map((s, i) => (
                      <Pressable
                        key={s.symbol}
                        onPress={() =>
                          router.push({
                            pathname: "/(tabs)/stock/[symbol]",
                            params: { symbol: s.symbol },
                          })
                        }
                        className={`flex-row items-center px-3 py-2.5 active:opacity-60 ${
                          i < Math.min(9, screened.length - 1) ? "border-b border-line" : ""
                        }`}
                      >
                        <Text className="text-ink-3 text-[11px] font-monoSb w-6">{i + 1}</Text>
                        <Tick ticker={s.symbol} size={34} />
                        <View className="flex-1 ml-2.5">
                          <Text className="text-ink text-[14px] font-sansBold">{s.name}</Text>
                          <Text className="text-ink-2 text-[11.5px] font-sansMd mt-0.5" numberOfLines={1}>
                            {s.thesis}
                          </Text>
                        </View>
                        <View
                          className={`px-2 py-1 rounded-[6px] ${
                            s.score >= 70 ? "bg-pos-bg" : s.score >= 45 ? "bg-amber-bg" : "bg-neg-bg"
                          }`}
                        >
                          <Text
                            className={`text-[11px] font-monoBold ${
                              s.score >= 70 ? "text-pos" : s.score >= 45 ? "text-amber" : "text-neg"
                            }`}
                          >
                            {s.score}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </Card>
                </View>
              )}

              <View className="gap-y-3 mb-6">
                <Button
                  label="Save & apply to your profile"
                  fullWidth
                  size="lg"
                  variant="primary"
                  onPress={handleSave}
                />
                <Button
                  label="Back to edit"
                  fullWidth
                  size="md"
                  variant="secondary"
                  onPress={() => setStep("build")}
                />
              </View>
            </>
          )}
        </>
      )}
      <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-2 mb-2">
        Educational only · not investment advice
      </Text>
    </Screen>
  );
}
