import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { pushRoute, pushRouteObject } from "@/lib/app-route";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Icon } from "@/components/Icon";
import { StressTestSheet } from "@/components/thesis/StressTestSheet";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { Tag } from "@/components/ui/Tag";
import { LIFE_SCENARIO_PRESETS } from "@/data/life-scenario-presets";
import { EDUCATIONAL_DISCLOSURE, RESEARCH_LIMITATION } from "@/data/educational-disclosures";
import { radarTemplateLabel } from "@/data/conviction-research-framework";
import {
  RADAR_SEARCH_TEMPLATES,
  type RadarSearchTemplateId,
} from "@/data/radar-search-templates";
import {
  checklistForScenario,
  forecastScenarioIdForLife,
} from "@/lib/life-scenario-forecast";
import { lessonHintForRadar, lessonPath } from "@/lib/lesson-hints";
import { dueRadarRevisits } from "@/lib/today-for-thesis";
import type { LifeScenarioId } from "@/data/life-scenario-presets";
import { builderThesisConvictionDefault } from "@/lib/builder-profile-summary";
import { runThesisRadarResearch } from "@/lib/thesis-radar-research";
import { buildThesisPortfolio } from "@/lib/thesis-portfolio-builder";
import { DEFAULT_PIE_CUSTOMIZATION } from "@/types/pie-customization";
import { normalizeModelThesis, useStore } from "@/store";
import type { StressTestResult } from "@/lib/thesis-stress-test";

export default function ThesisModelScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const modelThesis = useStore((s) => s.modelThesis);
  const customThesis = useStore((s) => s.customThesis);
  const setModelThesis = useStore((s) => s.setModelThesis);
  const toggleLifeScenario = useStore((s) => s.toggleLifeScenario);
  const addRadarReport = useStore((s) => s.addRadarReport);
  const removeRadarReport = useStore((s) => s.removeRadarReport);
  const snoozeRadarRevisit = useStore((s) => s.snoozeRadarRevisit);
  const thesisChangelog = useStore((s) => s.thesisChangelog);
  const convictionNotes = useStore((s) => s.convictionNotes);
  const watchlist = useStore((s) => s.watchlist);
  const thesisUserId = useStore((s) => s.thesisUserId);
  const params = useLocalSearchParams<{
    radarSymbol?: string;
    radarTemplate?: string;
  }>();

  const [researching, setResearching] = useState<string | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [stressSheetSymbol, setStressSheetSymbol] = useState<string | null>(null);
  const [pendingRadarSymbol, setPendingRadarSymbol] = useState<string | null>(null);
  const [pendingRadarTemplate, setPendingRadarTemplate] =
    useState<RadarSearchTemplateId>("conviction-dossier");
  const [lastStressResult, setLastStressResult] = useState<StressTestResult | null>(null);

  useEffect(() => {
    const sym = params.radarSymbol?.toString().toUpperCase();
    if (sym) setPendingRadarSymbol(sym);
    const raw = params.radarTemplate?.toString();
    if (
      raw === "deep-research" ||
      raw === "conviction-dossier" ||
      raw === "relative-valuation"
    ) {
      setPendingRadarTemplate(raw);
    }
  }, [params.radarSymbol, params.radarTemplate]);

  const workingModel = useMemo(() => {
    if (modelThesis) return modelThesis;
    if (themeIds.length === 0) return null;
    const built = buildThesisPortfolio({
      name: customThesis?.name || "My thesis portfolio",
      conviction: customThesis?.note || builderThesisConvictionDefault(profile, themeIds),
      profile,
      themeIds,
    });
    if (!built) return null;
    return normalizeModelThesis({
      name: built.name,
      conviction: built.conviction,
      climateId: built.climateId,
      themeIds: built.themeIds,
      holdings: built.holdings,
      appliedLifeScenarios: [],
      stressSummaries: [],
      radarReports: [],
    });
  }, [modelThesis, themeIds, profile, customThesis]);

  const stockSymbols = useMemo(
    () =>
      (workingModel?.holdings ?? [])
        .filter((h) => h.kind === "stock")
        .map((h) => h.symbol.toUpperCase()),
    [workingModel]
  );

  const ensureSavedModel = () => {
    if (!workingModel) return null;
    if (!modelThesis) {
      setModelThesis({
        name: workingModel.name,
        conviction: workingModel.conviction,
        climateId: workingModel.climateId,
        themeIds: workingModel.themeIds,
        holdings: workingModel.holdings,
        appliedLifeScenarios: workingModel.appliedLifeScenarios,
        stressSummaries: workingModel.stressSummaries,
        radarReports: workingModel.radarReports,
        pieCustomization: DEFAULT_PIE_CUSTOMIZATION,
      });
      return useStore.getState().modelThesis ?? workingModel;
    }
    return modelThesis;
  };

  const runRadar = async (templateId: RadarSearchTemplateId, symbol: string) => {
    const model = ensureSavedModel();
    if (!model) return;
    const key = `${templateId}-${symbol}`;
    setResearching(key);
    try {
      const result = await runThesisRadarResearch({
        userId: thesisUserId,
        templateId,
        symbol,
        model,
        profile,
      });
      addRadarReport({
        templateId,
        symbol,
        competitors: result.competitors,
        title: result.title,
        content: result.content,
      });
      setExpandedReportId(null);
    } catch (e) {
      Alert.alert(
        "Research unavailable",
        e instanceof Error ? e.message : "Could not reach Thesis API."
      );
    } finally {
      setResearching(null);
      setPendingRadarSymbol(null);
    }
  };

  useEffect(() => {
    if (!pendingRadarSymbol || researching) return;
    const sym = pendingRadarSymbol;
    const t = setTimeout(() => {
      void runRadar(pendingRadarTemplate, sym);
    }, 400);
    return () => clearTimeout(t);
  }, [pendingRadarSymbol, pendingRadarTemplate, workingModel, modelThesis]);

  if (!workingModel) {
    return (
      <Screen padded>
        <Header back title="Thesis model" />
        <Card pad={16}>
          <Text className="text-ink font-sansBold text-[15px]">Choose thesis interests first</Text>
          <Text className="text-ink-2 text-[13px] font-sansMd mt-2 leading-[19px]">
            Life scenarios and radar research nest inside your saved model book, pick up to 2
            themes in Builder.
          </Text>
          <View className="mt-4">
            <Button
              label="Go to Builder"
              fullWidth
              onPress={() => router.replace("/(tabs)/builder")}
            />
          </View>
        </Card>
      </Screen>
    );
  }

  const appliedIds = new Set(workingModel.appliedLifeScenarios.map((a) => a.id));
  const dueRevisits = dueRadarRevisits(workingModel.radarReports);

  return (
    <Screen padded>
      <Header
        back
        title="Thesis model"
        subtitle="Life scenarios reform your book · radar research stays nested here"
      />

      <Card pad={16} className="mb-4 border-brand/20">
        <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest mb-1">
          Active model
        </Text>
        <Text className="text-ink font-displayX text-[20px]" style={{ letterSpacing: -0.3 }}>
          {workingModel.name}
        </Text>
        <Text className="text-ink-2 text-[12px] font-sansMd mt-2 leading-[18px]">
          {workingModel.holdings.map((h) => `${h.symbol} ${h.weightPct}%`).join(" · ")}
        </Text>
        {(modelThesis?.pieCustomization?.cashReservePct ?? 0) > 0 && (
          <Text className="text-brand text-[12px] font-sansMd mt-2">
            {modelThesis!.pieCustomization.cashReservePct}% dry powder in saved pie
          </Text>
        )}
      </Card>

      {/* Stress test section */}
      {stockSymbols.length > 0 && (
        <View className="mb-4">
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button
                label={lastStressResult ? "Re-run stress test" : "Stress test thesis"}
                fullWidth
                size="md"
                variant="secondary"
                onPress={() => setStressSheetSymbol(stockSymbols[0])}
              />
            </View>
          </View>

          {/* Last result summary */}
          {lastStressResult && (
            <Card pad={14} className="mt-3">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest">
                    Last stress test
                  </Text>
                  <Text className="text-ink-2 text-[12px] font-sansMd mt-0.5">
                    {new Date(lastStressResult.runAt).toLocaleDateString()} · {lastStressResult.symbol}
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    className="font-monoBold text-[24px]"
                    style={{
                      color:
                        lastStressResult.overallResilience >= 70
                          ? "#0E7A66"
                          : lastStressResult.overallResilience >= 40
                            ? "#D98512"
                            : "#D32F2F",
                    }}
                  >
                    {lastStressResult.overallResilience}
                  </Text>
                  <Text
                    className="text-[10px] font-sansBold uppercase"
                    style={{
                      color:
                        lastStressResult.overallResilience >= 70
                          ? "#0E7A66"
                          : lastStressResult.overallResilience >= 40
                            ? "#D98512"
                            : "#D32F2F",
                    }}
                  >
                    {lastStressResult.resilienceLabel}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setStressSheetSymbol(stockSymbols[0])}
                className="mt-2 active:opacity-70"
              >
                <Text className="text-brand text-[12px] font-sansBold">View full results →</Text>
              </Pressable>
            </Card>
          )}
        </View>
      )}

      {(convictionNotes.length > 0 || thesisChangelog.length > 0) && (
        <Card pad={14} className="mb-4">
          {convictionNotes.length > 0 && (
            <>
              <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest mb-2">
                Latest conviction
              </Text>
              <Text className="text-ink text-[14px] font-sansMd leading-[20px]">
                {convictionNotes[0].mindChange}
              </Text>
              <Text className="text-ink-3 text-[10px] font-sansMd mt-1">
                From {convictionNotes[0].source}
                {convictionNotes.length > 1
                  ? ` · +${convictionNotes.length - 1} more below`
                  : ""}
              </Text>
            </>
          )}
          {thesisChangelog.length > 0 && (
            <View className={convictionNotes.length > 0 ? "mt-3 pt-3 border-t border-line" : ""}>
              <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest mb-1">
                Recent change
              </Text>
              <Text className="text-ink-2 text-[13px] font-sansMd">{thesisChangelog[0].summary}</Text>
            </View>
          )}
        </Card>
      )}

      <View className="flex-row flex-wrap gap-2 mb-5">
        <Pressable
          onPress={() => pushRoute(router, "/(tabs)/builder/portfolio")}
          className="flex-1 min-w-[30%] rounded-[12px] border border-line bg-bg-surface px-3 py-2.5 active:opacity-70"
        >
          <Text className="text-ink text-[12px] font-sansBold">Edit pie</Text>
        </Pressable>
        <Pressable
          onPress={() => pushRoute(router, "/(tabs)/watchlist")}
          className="flex-1 min-w-[30%] rounded-[12px] border border-line bg-bg-surface px-3 py-2.5 active:opacity-70"
        >
          <Text className="text-ink text-[12px] font-sansBold">Watchlist</Text>
        </Pressable>
        {watchlist.length >= 2 && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/duel",
                params: { a: watchlist[0], b: watchlist[1] },
              })
            }
            className="flex-1 min-w-[30%] rounded-[12px] border border-brand/30 bg-brand-bg px-3 py-2.5 active:opacity-70"
          >
            <Text className="text-brand text-[12px] font-sansBold">Duel</Text>
          </Pressable>
        )}
      </View>

      <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2 px-1">
        Life scenarios
      </Text>
      <Text className="text-ink-2 text-[13px] font-sansMd mb-3 px-1 leading-[19px]">
        Tap to stress-test and reform weights & conviction. Tap again to remove.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
      >
        {LIFE_SCENARIO_PRESETS.map((s) => {
          const on = appliedIds.has(s.id);
          return (
            <Pressable
              key={s.id}
              onPress={() => {
                ensureSavedModel();
                toggleLifeScenario(s.id);
              }}
              className={`rounded-[14px] border px-3 py-2.5 min-w-[148px] active:opacity-80 ${
                on ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
              }`}
            >
              <Text className="text-[18px] mb-1">{s.emoji}</Text>
              <Text className={`text-[13px] font-sansBold ${on ? "text-brand" : "text-ink"}`}>
                {s.label}
              </Text>
              <Text className="text-ink-3 text-[10px] font-sansMd mt-0.5">{s.oneLiner}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {dueRevisits.length > 0 && (
        <Card pad={14} className="mb-4 border-brand/25">
          <Text className="text-brand text-[11px] font-sansX uppercase tracking-wider mb-2">
            Revisit in 90 days
          </Text>
          <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px] mb-2">
            {dueRevisits[0].title}, does it still fit your thesis?
          </Text>
          <View className="flex-row gap-2">
            <Button
              label="Snooze 90 days"
              size="sm"
              variant="secondary"
              onPress={() => snoozeRadarRevisit(dueRevisits[0].id)}
            />
            <Button
              label="Read report"
              size="sm"
              variant="primary"
              onPress={() => setExpandedReportId(dueRevisits[0].id)}
            />
          </View>
        </Card>
      )}

      {workingModel.appliedLifeScenarios.length > 0 && (
        <Card pad={14} className="mb-4">
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
            Life checklist
          </Text>
          {workingModel.appliedLifeScenarios.flatMap((a) =>
            checklistForScenario(a.id as LifeScenarioId).map((item) => (
              <Text key={`${a.id}-${item.id}`} className="text-ink-2 text-[13px] font-sansMd mb-1.5">
                · {item.label}
              </Text>
            ))
          )}
          <Pressable
            onPress={() => pushRoute(router, "/forecast")}
            className="mt-2 active:opacity-70"
          >
            <Text className="text-brand text-[12px] font-sansBold">
              See in Forecast
              {workingModel.appliedLifeScenarios[0]
                ? ` (${forecastScenarioIdForLife(workingModel.appliedLifeScenarios[0].id as LifeScenarioId) ?? "scenarios"})`
                : ""}{" "}
              →
            </Text>
          </Pressable>
        </Card>
      )}

      {workingModel.stressSummaries.length > 0 && (
        <Card pad={14} className="mb-5 bg-amber-bg/30 border-amber/25">
          <Text className="text-amber text-[11px] font-sansX uppercase tracking-wider mb-2">
            Stress test
          </Text>
          {workingModel.stressSummaries.map((line, i) => (
            <Text key={i} className="text-ink-2 text-[13px] font-sansMd leading-[19px] mb-2">
              {line}
            </Text>
          ))}
        </Card>
      )}

      <Pressable
        onPress={() => pushRoute(router, "/(tabs)/watchlist")}
        className="mb-2 px-1 active:opacity-70 flex-row items-center justify-between"
      >
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
          Search radar
        </Text>
        <Text className="text-brand text-[11px] font-sansBold">Discover more →</Text>
      </Pressable>
      <Text className="text-ink-2 text-[13px] font-sansMd mb-1 px-1 leading-[19px]">
        Conviction dossiers, deep briefs, and peer valuation for model names, nested under this
        thesis.
      </Text>
      <Text className="text-ink-3 text-[11px] font-sansMd mb-3 px-1 leading-[16px]">
        {RESEARCH_LIMITATION}
      </Text>

      {stockSymbols.length === 0 ? (
        <Card pad={14} className="mb-4">
          <Text className="text-ink-2 text-[13px] font-sansMd">
            Save a model book with stocks to run ticker radar. ETFs use theme-level research for
            now.
          </Text>
        </Card>
      ) : (
        <View className="gap-2 mb-4">
          {stockSymbols.map((sym) => (
            <Card key={sym} pad={12}>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-ink font-monoBold text-[16px]">{sym}</Text>
                <Tag label="In model" tone="brand" />
              </View>
              <View className="gap-2">
                {RADAR_SEARCH_TEMPLATES.map((t) => {
                  const busy = researching === `${t.id}-${sym}`;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => runRadar(t.id, sym)}
                      disabled={!!researching}
                      className="rounded-[10px] bg-bg-subtle border border-line px-3 py-2.5 active:opacity-70"
                    >
                      {busy ? (
                        <ActivityIndicator size="small" color="#0E7A66" />
                      ) : (
                        <>
                          <Text className="text-ink text-[11px] font-sansBold">{t.title}</Text>
                          <Text className="text-ink-3 text-[9px] font-sansMd mt-0.5" numberOfLines={2}>
                            {t.subtitle}
                          </Text>
                        </>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          ))}
        </View>
      )}

      {workingModel.radarReports.length > 0 && (
        <>
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2 px-1">
            Nested in this thesis
          </Text>
          <View className="gap-3 mb-6">
            {workingModel.radarReports.map((r) => {
              const open = expandedReportId === r.id;
              return (
                <Card key={r.id} pad={14}>
                  <Pressable
                    onPress={() => setExpandedReportId(open ? null : r.id)}
                    className="active:opacity-80"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-2">
                        <Text className="text-brand text-[10px] font-sansX uppercase tracking-wider">
                          {radarTemplateLabel(r.templateId)}
                        </Text>
                        <Text className="text-ink font-sansBold text-[14px] mt-0.5">{r.title}</Text>
                        <Text className="text-ink-3 text-[11px] font-sansMd mt-1">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Icon name={open ? "chev" : "chev"} size={14} color="#8C988F" />
                    </View>
                  </Pressable>
                  {open && (
                    <Text className="text-ink-2 text-[13px] font-sansMd mt-3 leading-[20px]">
                      {r.content}
                    </Text>
                  )}
                  {!open && (
                    <Text className="text-ink-3 text-[12px] font-sansMd mt-2" numberOfLines={3}>
                      {r.content}
                    </Text>
                  )}
                  {open && (() => {
                    const hint = lessonHintForRadar(r.templateId);
                    return hint ? (
                      <Pressable
                        onPress={() => router.push(lessonPath(hint) as never)}
                        className="mt-2 active:opacity-70"
                      >
                        <Text className="text-brand text-[12px] font-sansBold">
                          Related lesson: {hint.title} →
                        </Text>
                      </Pressable>
                    ) : null;
                  })()}
                  <Pressable
                    onPress={() => removeRadarReport(r.id)}
                    className="mt-3 active:opacity-70"
                  >
                    <Text className="text-neg text-[12px] font-sansBold">Remove from thesis</Text>
                  </Pressable>
                </Card>
              );
            })}
          </View>
        </>
      )}

      {thesisChangelog.length > 0 && (
        <>
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2 px-1">
            Thesis changelog
          </Text>
          <Card pad={14} className="mb-4">
            {thesisChangelog.slice(0, 3).map((e) => (
              <View key={e.id} className="mb-3 last:mb-0 pb-3 border-b border-line last:border-b-0">
                <Text className="text-ink text-[13px] font-sansBold">{e.summary}</Text>
                <Text className="text-ink-3 text-[10px] font-sansMd mt-1">
                  {new Date(e.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {convictionNotes.length > 0 && (
        <>
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2 px-1">
            Conviction journal
          </Text>
          <Card pad={14} className="mb-4">
            {convictionNotes.slice(0, 4).map((n) => (
              <View key={n.id} className="mb-3 last:mb-0">
                <Text className="text-brand text-[10px] font-sansX uppercase">{n.source}</Text>
                <Text className="text-ink text-[13px] font-sansMd mt-1">{n.mindChange}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      <Text className="text-ink-3 text-[10px] text-center font-sansMd mb-3 leading-[14px]">
        {EDUCATIONAL_DISCLOSURE}
      </Text>

      <Button
        label="Open model portfolio"
        fullWidth
        variant="secondary"
        onPress={() => pushRoute(router, "/(tabs)/builder/portfolio")}
      />

      {/* Stress test sheet */}
      {stressSheetSymbol && (
        <StressTestSheet
          visible={stressSheetSymbol != null}
          onClose={() => setStressSheetSymbol(null)}
          symbol={stressSheetSymbol}
          onResult={setLastStressResult}
        />
      )}
    </Screen>
  );
}
