import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Share, Text, View } from "react-native";

import { BuilderPieCustomizer } from "@/components/builder/BuilderPieCustomizer";
import { BrokerageOffersCard } from "@/components/builder/BrokerageOffersCard";
import { ThesisPerformancePreview } from "@/components/thesis/ThesisPerformancePreview";
import { WhyThesisVsIndex } from "@/components/duel/WhyThesisVsIndex";
import { StressTestSheet } from "@/components/thesis/StressTestSheet";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { Tag } from "@/components/ui/Tag";
import { themeById } from "@/data/themes";
import { builderThesisConvictionDefault } from "@/lib/builder-profile-summary";
import { backtestPlainEnglish } from "@/lib/backtest-narrative";
import {
  candidatesToPieRows,
  composePieRows,
  finalizePieRows,
  pieRowsToHoldings,
  weightOverridesFromRows,
} from "@/lib/pie-customization";
import { backtestPortfolio } from "@/lib/portfolio-backtest";
import { buildThesisPortfolio } from "@/lib/thesis-portfolio-builder";
import { EDUCATIONAL_DISCLOSURE } from "@/data/educational-disclosures";
import {
  CASH_SLICE_SYMBOL,
  DEFAULT_PIE_CUSTOMIZATION,
  type PieAllocationRow,
  type PieCustomization,
} from "@/types/pie-customization";
import { useMilestoneCheck } from "@/lib/use-milestone-check";
import { MilestoneCelebration } from "@/components/engagement/MilestoneCelebration";
import { useStore } from "@/store";

export default function BuilderPortfolioScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const customThesis = useStore((s) => s.customThesis);
  const modelThesis = useStore((s) => s.modelThesis);
  const setModelThesis = useStore((s) => s.setModelThesis);
  const setCustomThesis = useStore((s) => s.setCustomThesis);
  const appendThesisChangelog = useStore((s) => s.appendThesisChangelog);
  const setWatchlistPipeline = useStore((s) => s.setWatchlistPipeline);
  const trackActiveToday = useStore((s) => s.trackActiveToday);
  const { check, currentMilestone, dismissCurrent } = useMilestoneCheck();

  const built = useMemo(() => {
    // Use model holdings directly if they exist (from lens adoption or save)
    if (modelThesis?.holdings.length) {
      return {
        name: modelThesis.name,
        conviction: modelThesis.conviction,
        climateId: modelThesis.climateId,
        themeIds: modelThesis.themeIds,
        holdings: modelThesis.holdings,
        candidates: modelThesis.holdings.map((h) => ({
          symbol: h.symbol,
          kind: h.kind,
          name: h.symbol,
          weightPct: h.weightPct,
          score: 0,
          role: "",
        })),
        avoidSymbols: [] as string[],
        rationale: [] as string[],
        backtest: backtestPortfolio(modelThesis.holdings),
      };
    }
    if (themeIds.length === 0) return null;
    return buildThesisPortfolio({
      name: customThesis?.name || modelThesis?.name || "My thesis portfolio",
      conviction:
        customThesis?.note ||
        modelThesis?.conviction ||
        builderThesisConvictionDefault(profile, themeIds),
      profile,
      themeIds,
      climateId: modelThesis?.climateId ?? null,
    });
  }, [profile, themeIds, customThesis, modelThesis, modelThesis?.holdings]);

  const thesisBaseline = useMemo(
    () => (built ? candidatesToPieRows(built.candidates) : []),
    [built]
  );

  const [draftRows, setDraftRows] = useState<PieAllocationRow[]>([]);
  const [pieCustomization, setPieCustomization] = useState<PieCustomization>(
    modelThesis?.pieCustomization ?? DEFAULT_PIE_CUSTOMIZATION
  );
  const [stressSheetSymbol, setStressSheetSymbol] = useState<string | null>(null);

  useEffect(() => {
    if (!built) return;
    const custom = modelThesis?.pieCustomization ?? DEFAULT_PIE_CUSTOMIZATION;
    setDraftRows(composePieRows(built.candidates, custom));
    setPieCustomization(custom);
  }, [built, modelThesis?.updatedAt, themeIds.join(",")]);

  const handleRowsChange = (rows: PieAllocationRow[]) => {
    const finalized = finalizePieRows(rows);
    setDraftRows(finalized);
    const cashRow = finalized.find((r) => r.symbol === CASH_SLICE_SYMBOL);
    setPieCustomization({
      cashReservePct: cashRow?.weightPct ?? 0,
      weightOverrides: weightOverridesFromRows(thesisBaseline, finalized),
      preferenceNote: pieCustomization.preferenceNote,
    });
  };

  const investedBacktest = useMemo(() => {
    const holdings = pieRowsToHoldings(draftRows);
    if (!holdings.length) return built?.backtest ?? null;
    return backtestPortfolio(holdings);
  }, [draftRows, built?.backtest]);

  const handleShare = async () => {
    const model = modelThesis ?? built;
    if (!model) return;
    const themes = model.themeIds
      .map((id) => themeById(id)?.title)
      .filter(Boolean)
      .join(", ");
    const holdings = (model.holdings || [])
      .slice(0, 6)
      .map((h: { symbol: string; weightPct: number }) => `${h.symbol} ${h.weightPct}%`)
      .join(", ");
    const vsSpy = investedBacktest
      ? `${investedBacktest.alpha.trailing1y > 0 ? "+" : ""}${investedBacktest.alpha.trailing1y.toFixed(1)} pts vs SPY`
      : "";

    const shareText = [
      `My thesis: ${model.name}`,
      model.conviction ? `"${model.conviction.slice(0, 200)}"` : "",
      themes ? `Themes: ${themes}` : "",
      holdings ? `Holdings: ${holdings}` : "",
      vsSpy,
      "",
      "Built with Thesis — learn before you trade.",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await Share.share({ message: shareText });
    } catch {
      // user cancelled
    }
  };

  const handleSave = () => {
    if (!built) return;
    const holdings = pieRowsToHoldings(draftRows);
    const cashRow = draftRows.find((r) => r.symbol === CASH_SLICE_SYMBOL);
    const customization: PieCustomization = {
      cashReservePct: cashRow?.weightPct ?? 0,
      weightOverrides: weightOverridesFromRows(thesisBaseline, draftRows),
      preferenceNote: pieCustomization.preferenceNote,
    };
    const before = modelThesis?.holdings ?? [];
    const cashNote =
      customization.cashReservePct > 0
        ? ` · ${customization.cashReservePct}% dry powder`
        : "";
    setCustomThesis(built.name, built.conviction);
    setModelThesis({
      name: built.name,
      conviction: built.conviction,
      climateId: built.climateId,
      themeIds: built.themeIds,
      holdings,
      appliedLifeScenarios: modelThesis?.appliedLifeScenarios ?? [],
      stressSummaries: modelThesis?.stressSummaries ?? [],
      radarReports: modelThesis?.radarReports ?? [],
      pieCustomization: customization,
    });
    trackActiveToday();
    check();
    appendThesisChangelog({
      trigger: "portfolio-save",
      summary: `Saved model book: ${holdings.map((h) => `${h.symbol} ${h.weightPct}%`).join(", ")}${cashNote}`,
      beforeHoldings: before,
      afterHoldings: holdings,
    });
    for (const h of holdings) {
      setWatchlistPipeline(h.symbol, "in-model");
    }

    const holdingSummary = holdings.map((h) => `${h.symbol} ${h.weightPct}%`).join(", ");
    Alert.alert(
      "Model saved",
      customization.cashReservePct > 0
        ? `${holdingSummary}\n\n${customization.cashReservePct}% dry powder (cash) saved alongside your book.`
        : holdingSummary,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  if (themeIds.length === 0) {
    return (
      <Screen padded>
        <Header back title="Model portfolio" />
        <Card pad={16} className="mb-4">
          <Text className="text-ink font-sansBold text-[15px]">Pick thesis interests first</Text>
          <Text className="text-ink-2 text-[13px] font-sansMd mt-2 leading-[19px]">
            We need at least one theme from your questionnaire or the thesis library to suggest weights.
          </Text>
        </Card>
        <Button
          label="Back to Builder"
          fullWidth
          size="lg"
          variant="primary"
          onPress={() => router.back()}
        />
      </Screen>
    );
  }

  if (!built) {
    return (
      <Screen padded>
        <Header back title="Model portfolio" />
        <Text className="text-ink-2 text-[14px] font-sansMd">Could not build a portfolio from your themes.</Text>
      </Screen>
    );
  }

  const backtest = investedBacktest ?? built.backtest;

  return (
    <Screen padded scroll>
      <Header
        back
        title="Your model portfolio"
        subtitle="Customize pie · dry powder · rebalance"
      />

      <Card pad={16} className="mb-4">
        <Text className="text-ink font-displayX text-[20px]" style={{ letterSpacing: -0.4 }}>
          {built.name}
        </Text>
        <Text className="text-ink-2 text-[13px] font-sansMd mt-2 leading-[19px]">
          {built.conviction}
        </Text>
        <View className="flex-row flex-wrap gap-1.5 mt-3">
          {built.themeIds.map((tid) => {
            const t = themeById(tid);
            return t ? <Tag key={tid} label={t.title} tone="brand" /> : null;
          })}
        </View>
        <View className="mt-5 pt-4 border-t border-line">
          <BuilderPieCustomizer
            rows={draftRows}
            thesisBaseline={thesisBaseline}
            profile={profile}
            themeIds={themeIds}
            preferenceNote={pieCustomization.preferenceNote}
            onRowsChange={handleRowsChange}
            onPreferenceNoteChange={(note) =>
              setPieCustomization((c) => ({ ...c, preferenceNote: note }))
            }
          />
        </View>
      </Card>

      <ThesisPerformancePreview name={built.name} backtest={backtest} />
      <Card pad={14} className="mb-4">
        <Text className="text-ink-2 text-[13px] font-sansMd leading-[20px]">
          {backtestPlainEnglish(backtest)}
        </Text>
        {(pieCustomization.cashReservePct ?? 0) > 0 && (
          <Text className="text-ink-3 text-[11px] font-sansMd mt-2 leading-[16px]">
            Backtest uses invested sleeves only; {pieCustomization.cashReservePct}% cash is
            modeled as dry powder (not in historical returns).
          </Text>
        )}
      </Card>
      <WhyThesisVsIndex compact />
      <Text className="text-ink-3 text-[10px] font-sansMd text-center mb-4 leading-[14px]">
        {EDUCATIONAL_DISCLOSURE}
      </Text>

      <BrokerageOffersCard />

      <Button label="Save model portfolio" fullWidth size="lg" variant="primary" onPress={handleSave} />
      <View className="mt-3 gap-2">
        <Button
          label="Share your thesis"
          fullWidth
          size="md"
          variant="secondary"
          onPress={handleShare}
        />
      </View>
      <View className="mt-3 gap-2">
        <Button
          label="Stress test this thesis"
          fullWidth
          size="md"
          variant="secondary"
          onPress={() => {
            const symbol = built?.holdings?.[0]?.symbol ?? "AAPL";
            setStressSheetSymbol(symbol);
          }}
        />
      </View>
      <View className="mt-3 gap-2 mb-6">
        <Button
          label="Life scenarios & radar research"
          fullWidth
          size="md"
          variant="secondary"
          onPress={() => router.push("/thesis-model" as never)}
        />
        <Button
          label="Explore investing climates"
          fullWidth
          size="md"
          variant="secondary"
          onPress={() => router.push("/thesis-studio" as never)}
        />
      </View>

      {/* Stress test sheet */}
      {stressSheetSymbol && (
        <StressTestSheet
          visible={stressSheetSymbol != null}
          onClose={() => setStressSheetSymbol(null)}
          symbol={stressSheetSymbol}
        />
      )}

      {currentMilestone && (
        <MilestoneCelebration milestone={currentMilestone} onDismiss={dismissCurrent} />
      )}
    </Screen>
  );
}
