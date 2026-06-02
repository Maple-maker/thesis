import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { DuelPickPhase } from "@/components/duel/DuelPickPhase";
import { DuelSymbolSwapSheet } from "@/components/duel/DuelSymbolSwapSheet";
import { PortfolioBacktestCompare } from "@/components/duel/PortfolioBacktestCompare";
import { WhyThesisVsIndex } from "@/components/duel/WhyThesisVsIndex";
import { ExplainSheet } from "@/components/ExplainSheet";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Delta } from "@/components/ui/Delta";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { MetaChip, Tag } from "@/components/ui/Tag";
import { ThesisBadge } from "@/components/ui/ThesisBadge";
import { Tick } from "@/components/ui/Tick";
import { themeById } from "@/data/themes";
import type { ConceptId } from "@/data/concepts";
import { BullBearCaseCard } from "@/components/BullBearCaseCard";
import { casesFor, casesForEtf, takeForUserPick, techWeightFromHoldings } from "@/lib/cases";
import { useExplainSheet } from "@/hooks/useExplainSheet";
import type { CompareMetric } from "@/lib/duel-asset";
import {
  buildCompareMetrics,
  duelVerdict,
  resolveDuelAsset,
  suggestForDuelAssets,
  type DuelAsset,
} from "@/lib/duel-asset";
import { duelDebriefLines, duelPrimerLines } from "@/lib/duel-education";
import { thesisFitForAsset } from "@/lib/thesis-fit";
import type { CategoryBreakdown } from "@/lib/thesis-score";
import { lessonHintFromBreakdown, lessonPath } from "@/lib/lesson-hints";
import { canDuelFromWatchlist, pickWatchlistDuelPair } from "@/lib/watchlist-duel";
import type { ETFSuggestion } from "@/lib/etf-overlap";
import { useStore } from "@/store";
import type { JournalReason, Stock } from "@/store/types";
import { DEFAULT_PIE_CUSTOMIZATION } from "@/types/pie-customization";

const REASONS: { id: JournalReason; label: string; emoji: string }[] = [
  { id: "better-moat", label: "Better moat", emoji: "🏰" },
  { id: "cheaper-valuation", label: "Cheaper", emoji: "💰" },
  { id: "stronger-growth", label: "Stronger growth", emoji: "📈" },
  { id: "more-aligned", label: "Fits my thesis", emoji: "🎯" },
  { id: "better-management", label: "Better mgmt", emoji: "👔" },
  { id: "safer", label: "Safer", emoji: "🛡️" },
  { id: "gut", label: "Gut feeling", emoji: "🫀" },
  { id: "other", label: "Other", emoji: "…" },
];

type Phase = "pick" | "compare" | "reason" | "synthesis";

// Stock-specific accent colors (used for ticker monograms in the duel)
const ACCENT_THIS = "#0E7A66";
const ACCENT_THAT = "#7C3AED";

export default function DuelScreen() {
  const router = useRouter();
  const { openConcept, sheetProps: explainSheetProps } = useExplainSheet();
  const params = useLocalSearchParams<{ a?: string; b?: string }>();
  const watchlist = useStore((s) => s.watchlist);
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const holdings = useStore((s) => s.holdings);
  const recordDuel = useStore((s) => s.recordDuel);
  const connectDemoAccounts = useStore((s) => s.connectDemoAccounts);

  const [pair, setPair] = useState<[DuelAsset, DuelAsset] | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [winnerSym, setWinnerSym] = useState<string | null>(null);
  const [reason, setReason] = useState<JournalReason | null>(null);
  const [note, setNote] = useState<string>("");
  const [mindChange, setMindChange] = useState("");
  const [swapSide, setSwapSide] = useState<"a" | "b" | null>(null);
  const addConvictionNote = useStore((s) => s.addConvictionNote);

  useEffect(() => {
    const pa = params.a ? resolveDuelAsset(String(params.a), holdings) : null;
    const pb = params.b ? resolveDuelAsset(String(params.b), holdings) : null;
    if (pa && pb) {
      setPair([pa, pb]);
      setPhase("compare");
      return;
    }
    if (pa) {
      setPhase("pick");
      return;
    }
    const fromWatch = pickWatchlistDuelPair(watchlist, holdings);
    if (fromWatch) {
      setPair(fromWatch);
      setPhase("compare");
    }
  }, [params.a, params.b, holdings]);

  const replaceAsset = useCallback(
    (which: "a" | "b", symbol: string) => {
      if (!pair) return;
      const asset = resolveDuelAsset(symbol, holdings);
      if (!asset) return;
      const other = which === "a" ? pair[1].duelRef : pair[0].duelRef;
      if (asset.duelRef === other) return;
      setPair(which === "a" ? [asset, pair[1]] : [pair[0], asset]);
      setSwapSide(null);
      setWinnerSym(null);
      setReason(null);
      setNote("");
      if (phase !== "compare") setPhase("compare");
    },
    [pair, phase, holdings]
  );

  const flipSides = useCallback(() => {
    if (!pair) return;
    setPair([pair[1], pair[0]]);
    setWinnerSym(null);
    setReason(null);
    setNote("");
  }, [pair]);

  const newDuel = useCallback(() => {
    const p = pickWatchlistDuelPair(watchlist, holdings);
    if (p) {
      setPair(p);
      setPhase("compare");
    } else {
      setPair(null);
      setPhase("pick");
    }
    setWinnerSym(null);
    setReason(null);
    setNote("");
  }, [watchlist, holdings]);

  if (phase === "pick" || !pair) {
    return (
      <DuelPickPhase
        holdings={holdings}
        onClose={() => router.back()}
        onStart={(p) => {
          setPair(p);
          setPhase("compare");
        }}
        onQuick={() => {
          const p = pickWatchlistDuelPair(watchlist, holdings);
          if (p) {
            setPair(p);
            setPhase("compare");
          }
        }}
        canQuick={canDuelFromWatchlist(watchlist, holdings)}
      />
    );
  }

  const [a, b] = pair;
  const isPortfolioDuel = a.kind === "portfolio" || b.kind === "portfolio";
  const winner = winnerSym === a.duelRef ? a : b;
  const loser = winnerSym === a.duelRef ? b : a;

  const onPick = (which: "a" | "b") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWinnerSym(which === "a" ? a.duelRef : b.duelRef);
    setPhase("reason");
  };

  const onSelectReason = (r: JournalReason) => {
    Haptics.selectionAsync();
    setReason(r);
  };

  const onConfirmReason = () => {
    if (!winnerSym || !reason) return;
    recordDuel({
      winner: winnerSym,
      loser: winnerSym === a.duelRef ? b.duelRef : a.duelRef,
      reason,
      note: note.trim() || undefined,
    });
    if (mindChange.trim()) {
      addConvictionNote({
        source: "duel",
        symbol: winnerSym,
        mindChange: mindChange.trim(),
        takeaway: note.trim() || undefined,
      });
    }
    setPhase("synthesis");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right", "bottom"]}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <Pressable
          onPress={() => router.back()}
          className="bg-bg-surface border border-line px-3 h-9 items-center justify-center rounded-[12px]"
        >
          <Text className="text-ink-2 text-[13px] font-sansBold">Close</Text>
        </Pressable>
        <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest">
          The Duel
        </Text>
        <View className="flex-row gap-2">
          {!isPortfolioDuel && (
            <Pressable
              onPress={() => setSwapSide("a")}
              className="bg-bg-surface border border-line px-3 h-9 items-center justify-center rounded-[12px]"
            >
              <Text className="text-ink-2 text-[13px] font-sansBold">Swap</Text>
            </Pressable>
          )}
          <Pressable
            onPress={newDuel}
            className="bg-bg-surface border border-line px-3 h-9 items-center justify-center rounded-[12px]"
          >
            <Text className="text-ink-2 text-[13px] font-sansBold">↻ New</Text>
          </Pressable>
        </View>
      </View>

      {phase === "compare" && (
        <ComparePhase
          a={a}
          b={b}
          profile={profile}
          themeIds={themeIds}
          holdings={holdings}
          onPick={onPick}
          onLearnMetric={openConcept}
          onSwapSide={setSwapSide}
          onFlipSides={flipSides}
        />
      )}

      <DuelSymbolSwapSheet
        visible={!isPortfolioDuel && swapSide != null && phase === "compare"}
        side={swapSide}
        currentSymbol={swapSide === "a" ? a.symbol : swapSide === "b" ? b.symbol : undefined}
        otherSymbol={swapSide === "a" ? b.symbol : swapSide === "b" ? b.symbol : undefined}
        onClose={() => setSwapSide(null)}
        onSelect={(sym) => swapSide && replaceAsset(swapSide, sym)}
      />

      <ExplainSheet {...explainSheetProps} onSelectRelated={(id) => openConcept(id)} />

      {phase === "reason" && winner && loser && (
        <ReasonPhase
          winner={winner}
          loser={loser}
          reason={reason}
          note={note}
          setNote={setNote}
          mindChange={mindChange}
          setMindChange={setMindChange}
          onSelect={onSelectReason}
          onConfirm={onConfirmReason}
        />
      )}

      {phase === "synthesis" && winner && loser && (
        <SynthesisPhase
          winner={winner}
          loser={loser}
          onAnother={newDuel}
          onDone={() => router.back()}
        />
      )}
    </SafeAreaView>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Phase: Compare
// ════════════════════════════════════════════════════════════════════════════
function ComparePhase({
  a,
  b,
  profile,
  themeIds,
  holdings,
  onPick,
  onLearnMetric,
  onSwapSide,
  onFlipSides,
}: {
  a: DuelAsset;
  b: DuelAsset;
  profile: ReturnType<typeof useStore.getState>["profile"];
  themeIds: ReturnType<typeof useStore.getState>["themeIds"];
  holdings: ReturnType<typeof useStore.getState>["holdings"];
  onPick: (which: "a" | "b") => void;
  onLearnMetric: (id: ConceptId) => void;
  onSwapSide: (side: "a" | "b") => void;
  onFlipSides: () => void;
}) {
  const [tab, setTab] = useState<"a" | "b">("a");
  const sharedTheme = a.themes.find((t) => b.themes.includes(t));
  const themeMeta = sharedTheme ? themeById(sharedTheme) : undefined;

  const verdict = useMemo(
    () => duelVerdict(a, b, themeIds, profile, holdings),
    [a, b, themeIds, profile, holdings]
  );

  const active = tab === "a" ? a : b;
  const activeCases = useMemo(() => {
    if (active.stock) return casesFor(active.stock);
    if (active.etf) return casesForEtf(active.etf);
    if (active.portfolio) {
      const top = active.portfolio.holdings
        .slice(0, 4)
        .map((h) => `${h.symbol} ${h.weightPct}%`)
        .join(" · ");
      return {
        bull: [active.thesis, top ? `Top weights: ${top}` : ""].filter(Boolean),
        bear: [
          "Concentration risk if a few names dominate the book.",
          "Illustrative model, not a live copy of any investor's filings.",
        ],
      };
    }
    return { bull: [active.thesis], bear: ["Review overlap with your existing book."] };
  }, [active]);
  const activeColor = tab === "a" ? ACCENT_THIS : ACCENT_THAT;

  const metrics = useMemo(() => buildCompareMetrics(a, b), [a, b]);
  const isPortfolioDuel = a.kind === "portfolio" && b.kind === "portfolio";
  const showBacktest =
    isPortfolioDuel && a.portfolio?.backtest && b.portfolio?.backtest;

  const primer = useMemo(
    () => duelPrimerLines(a, b, themeIds, profile),
    [a, b, themeIds, profile]
  );

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 17, paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}
    >
      <Card pad={14} className="mt-1 mb-4 bg-brand-bg/25 border-brand/20">
        <Text className="text-brand text-[10px] font-sansX uppercase tracking-widest mb-2">
          Pre-duel primer
        </Text>
        {primer.map((line, i) => (
          <Text key={i} className="text-ink-2 text-[13px] font-sansMd leading-[19px] mb-1.5">
            {line}
          </Text>
        ))}
      </Card>

      <View className="mb-5">
        <Text
          className="text-ink text-[28px] font-displayX"
          style={{ letterSpacing: -0.6, lineHeight: 32 }}
        >
          {isPortfolioDuel ? "Thesis A vs Thesis B" : "Compare"}
        </Text>
        <Text className="text-ink-2 text-[14px] font-sansMd mt-1 leading-[20px]">
          {isPortfolioDuel
            ? "Real backtested returns vs SPY, then allocation, overlap, and thesis fit."
            : "Tap a card to swap symbols, head to head, then our take for you."}
        </Text>
        {themeMeta && (
          <View className="self-start mt-2">
            <Tag label={`${themeMeta.kicker} · ${themeMeta.heat}`} tone="brand" />
          </View>
        )}
      </View>

      {showBacktest && (
        <>
          <PortfolioBacktestCompare
            nameA={a.name}
            nameB={b.name}
            backtestA={a.portfolio!.backtest}
            backtestB={b.portfolio!.backtest}
          />
          <WhyThesisVsIndex compact />
        </>
      )}

      <View className="flex-row items-stretch mb-6">
        <CompareCard
          asset={a}
          accent={ACCENT_THIS}
          holdings={holdings}
          onSwap={a.kind === "portfolio" ? undefined : () => onSwapSide("a")}
        />
        <View className="w-9 items-center justify-center">
          <Pressable onPress={onFlipSides} className="active:opacity-70">
            <View
              className="bg-ink items-center justify-center"
              style={{ width: 32, height: 32, borderRadius: 16 }}
            >
              <Text
                className="text-white font-displayX text-[11px] italic"
                style={{ letterSpacing: -0.3 }}
              >
                vs
              </Text>
            </View>
            <Text className="text-ink-3 text-[9px] font-sansMd mt-1 text-center">Flip</Text>
          </Pressable>
        </View>
        <CompareCard
          asset={b}
          accent={ACCENT_THAT}
          holdings={holdings}
          onSwap={b.kind === "portfolio" ? undefined : () => onSwapSide("b")}
        />
      </View>

      {(a.portfolio || b.portfolio) && (
        <PortfolioHoldingsPanel a={a} b={b} />
      )}

      <SectionTitle>Head to head</SectionTitle>
      <Card pad={0} className="overflow-hidden mb-5">
        {metrics.map((m, i) => (
          <MetricRow
            key={m.label}
            metric={m}
            isLast={i === metrics.length - 1}
            onLearn={m.conceptId ? () => onLearnMetric(m.conceptId!) : undefined}
          />
        ))}
      </Card>

      <Card pad={14} className="mb-6 border-brand/20 bg-brand-bg/15">
        <Text className="text-brand text-[11px] font-sansX uppercase tracking-wider mb-2">
          Thesis match · overlap preview
        </Text>
        <Text className="text-ink-3 text-[11px] font-sansMd mb-2">
          Same scoring engine as Builder, profile + your themes.
        </Text>
        <View className="flex-row justify-between mb-2">
          <View className="flex-1 items-center">
            <Text className="text-ink font-sansBold text-[13px] text-center" numberOfLines={2}>
              {a.name}
            </Text>
            <Text className="text-ink-2 text-[12px] font-sansMd">{verdict.fitA.label}</Text>
            <Text className="text-brand font-monoBold text-[18px] mt-0.5">{verdict.fitA.score}</Text>
            {verdict.fitA.source === "full" && (
              <Text className="text-ink-3 text-[10px] font-sansMd mt-0.5">7-factor</Text>
            )}
          </View>
          <View className="flex-1 items-center">
            <Text className="text-ink font-sansBold text-[13px] text-center" numberOfLines={2}>
              {b.name}
            </Text>
            <Text className="text-ink-2 text-[12px] font-sansMd">{verdict.fitB.label}</Text>
            <Text className="text-brand font-monoBold text-[18px] mt-0.5">{verdict.fitB.score}</Text>
            {verdict.fitB.source === "full" && (
              <Text className="text-ink-3 text-[10px] font-sansMd mt-0.5">7-factor</Text>
            )}
          </View>
        </View>
        {(verdict.fitA.breakdown?.length || verdict.fitB.breakdown?.length) ? (
          <View className="mt-3 pt-3 border-t border-line gap-y-2">
            <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider">
              Conviction breakdown · {tab === "a" ? a.symbol : b.symbol}
            </Text>
            {(tab === "a" ? verdict.fitA.breakdown : verdict.fitB.breakdown)
              ?.slice(0, 4)
              .map((row: CategoryBreakdown) => (
                <View key={row.category} className="flex-row justify-between">
                  <Text className="text-ink-2 text-[11.5px] font-sansMd flex-1 pr-2">{row.label}</Text>
                  <Text
                    className={`text-[11px] font-monoBold ${
                      row.tone === "pos" ? "text-pos" : row.tone === "neg" ? "text-neg" : "text-amber"
                    }`}
                  >
                    {row.score}
                  </Text>
                </View>
              ))}
          </View>
        ) : null}
        {verdict.overlapPct != null && (
          <Text className="text-ink-2 text-[12px] font-sansMd mb-1">
            Holdings overlap: ~{verdict.overlapPct}%
          </Text>
        )}
        {verdict.overlapNote && (
          <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px]">{verdict.overlapNote}</Text>
        )}
        {(verdict.lackingA.length > 0 || verdict.lackingB.length > 0) && (
          <View className="mt-3 gap-y-2">
            <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider">
              What each lacks for your thesis
            </Text>
            {verdict.lackingA.slice(0, 2).map((line) => (
              <Text key={`a-${line}`} className="text-ink-2 text-[12.5px] font-sansMd">
                <Text className="font-monoBold text-ink">{a.symbol}</Text>: {line.replace(/^Missing your theme: /, "")}
              </Text>
            ))}
            {verdict.lackingB.slice(0, 2).map((line) => (
              <Text key={`b-${line}`} className="text-ink-2 text-[12.5px] font-sansMd">
                <Text className="font-monoBold text-ink">{b.symbol}</Text>: {line.replace(/^Missing your theme: /, "")}
              </Text>
            ))}
          </View>
        )}
        <Text className="text-ink-3 text-[12px] font-sansMd mt-2 leading-[17px]">
          {verdict.recommendation}
        </Text>
      </Card>

      {/* Bull / Bear segmented */}
      <SectionTitle>The Thesis engine</SectionTitle>
      <View className="flex-row gap-1.5 p-1 bg-track rounded-[14px] mb-3">
        {[
          { id: "a" as const, sym: a.symbol, color: ACCENT_THIS },
          { id: "b" as const, sym: b.symbol, color: ACCENT_THAT },
        ].map((t) => {
          const on = tab === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-[11px] items-center ${
                on ? "bg-bg-surface" : ""
              }`}
              style={
                on
                  ? {
                      shadowColor: "#142F22",
                      shadowOpacity: 0.06,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 2 },
                    }
                  : undefined
              }
            >
              <Text
                className="font-monoBold text-[14px]"
                style={{ color: on ? t.color : "#8C988F" }}
              >
                {t.sym}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="gap-y-2.5 mb-6">
        <BullBearCaseCard type="bull" ticker={active.symbol} items={activeCases.bull} />
        <BullBearCaseCard type="bear" ticker={active.symbol} items={activeCases.bear} />
      </View>

      {/* Pick prompt */}
      <SectionTitle>Make your call</SectionTitle>
      <Text className="text-ink-2 text-[14px] font-sansMd mb-3 leading-[20px]">
        You've seen the bull and bear for each side. Which gets the pick?
      </Text>

      <View className="flex-row gap-x-2.5 mb-2">
        <PickButton
          accent={ACCENT_THIS}
          label="THIS"
          subtitle={a.symbol}
          onPress={() => onPick("a")}
        />
        <PickButton
          accent={ACCENT_THAT}
          label="THAT"
          subtitle={b.symbol}
          onPress={() => onPick("b")}
        />
      </View>
    </ScrollView>
  );
}

function PortfolioHoldingsPanel({ a, b }: { a: DuelAsset; b: DuelAsset }) {
  const renderSide = (asset: DuelAsset, accent: string) => {
    if (!asset.portfolio) return null;
    return (
      <View className="flex-1 min-w-0">
        <Text className="text-ink font-sansBold text-[12px] mb-2" numberOfLines={1}>
          {asset.name}
        </Text>
        {asset.portfolio.holdings.slice(0, 6).map((h) => (
          <View key={h.symbol} className="flex-row items-center justify-between mb-1.5">
            <Text className="text-ink font-monoBold text-[11px]">{h.symbol}</Text>
            <View className="flex-1 mx-2 h-1.5 bg-track rounded-full overflow-hidden">
              <View
                style={{
                  width: `${Math.min(100, h.weightPct)}%`,
                  backgroundColor: accent,
                  height: "100%",
                }}
              />
            </View>
            <Text className="text-ink-3 text-[10px] font-sansMd">{h.weightPct}%</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Card pad={14} className="mb-5">
      <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider mb-3">
        Top allocations
      </Text>
      <View className="flex-row gap-4">
        {renderSide(a, ACCENT_THIS)}
        {renderSide(b, ACCENT_THAT)}
      </View>
    </Card>
  );
}

function CompareCard({
  asset,
  accent,
  holdings,
  onSwap,
}: {
  asset: DuelAsset;
  accent: string;
  holdings: ReturnType<typeof useStore.getState>["holdings"];
  onSwap?: () => void;
}) {
  const held =
    asset.kind !== "portfolio" ? holdings.find((h) => h.symbol === asset.symbol) : undefined;
  const shortName = asset.name.split(" ")[0];
  const statMain =
    asset.kind === "portfolio" && asset.portfolio
      ? `${asset.portfolio.stats.holdingsCount} names`
      : held != null
        ? `$${held.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
        : asset.kind === "etf" && asset.expense != null
          ? `${asset.expense}% exp`
          : asset.stock
            ? fmtCapDisplay(asset.stock.marketCap)
            : "-";
  const statLabel =
    asset.kind === "portfolio"
      ? asset.portfolio?.stats.risk ?? "Portfolio"
      : held
        ? "Your book"
        : asset.kind === "etf"
          ? "Expense"
          : "Market cap";

  const Wrapper = onSwap ? Pressable : View;

  return (
    <Wrapper
      onPress={onSwap}
      className="flex-1 bg-bg-surface active:opacity-85"
      style={{
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: accent,
        padding: 14,
        shadowColor: accent,
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <View className="flex-row items-center justify-between">
        {asset.kind === "portfolio" ? (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="grid" size={20} color="#FFFFFF" sw={2} />
          </View>
        ) : (
          <Tick ticker={asset.symbol} size={40} color={accent} />
        )}
        {onSwap && (
          <View className="flex-row items-center px-2 py-1 rounded-full bg-bg-surface2 border border-line">
            <Icon name="chevDown" size={12} color="#8C988F" sw={2} />
            <Text className="text-ink-3 text-[10px] font-sansBold ml-1">Swap</Text>
          </View>
        )}
      </View>
      <Text className="text-ink font-monoBold text-[16px] mt-3">
        {asset.symbol}
      </Text>
      <Text className="text-ink-2 text-[13px] font-sansMd mt-0.5">{shortName}</Text>
      <Text className="text-ink font-monoBold text-[17px] mt-3">{statMain}</Text>
      {held && held.changePct3m !== 0 ? (
        <View className="flex-row items-center mt-1">
          <Delta value={held.changePct3m} />
          <Text className="text-ink-3 text-[11px] font-sansMd ml-1">3mo</Text>
        </View>
      ) : (
        <Text className="text-ink-3 text-[10px] font-sansX uppercase mt-1 tracking-wider">
          {statLabel}
        </Text>
      )}
    </Wrapper>
  );
}

function MetricRow({
  metric: m,
  isLast,
  onLearn,
}: {
  metric: CompareMetric;
  isLast: boolean;
  onLearn?: () => void;
}) {
  return (
    <View
      className={`flex-row items-center ${isLast ? "" : "border-b border-line"}`}
    >
      <View
        className="flex-1 items-center py-3.5 px-2"
        style={{
          backgroundColor: m.better === "a" ? "#0E7A6618" : "transparent",
          borderRadius: m.better === "a" ? 8 : 0,
          margin: m.better === "a" ? 4 : 0,
        }}
      >
        <Text className={`font-monoBold text-[14px] ${m.better === "a" ? "text-ink" : "text-ink-3"}`}>
          {m.a}
        </Text>
      </View>
      <View className="flex-[1.15] items-center py-3.5 px-1">
        <View className="flex-row items-center">
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider">
            {m.label}
          </Text>
          {onLearn && (
            <Pressable
              onPress={onLearn}
              hitSlop={10}
              className="ml-1 w-[18px] h-[18px] rounded-full bg-track items-center justify-center active:opacity-70"
            >
              <Icon name="info" size={11} color="#4D5A54" sw={2} />
            </Pressable>
          )}
        </View>
      </View>
      <View
        className="flex-1 items-center py-3.5 px-2"
        style={{
          backgroundColor: m.better === "b" ? "#7C3AED18" : "transparent",
          borderRadius: m.better === "b" ? 8 : 0,
          margin: m.better === "b" ? 4 : 0,
        }}
      >
        <Text className={`font-monoBold text-[14px] ${m.better === "b" ? "text-ink" : "text-ink-3"}`}>
          {m.b}
        </Text>
      </View>
    </View>
  );
}

function fmtCapDisplay(b: number): string {
  if (b >= 1000) return `$${(b / 1000).toFixed(2)}T`;
  return `$${b}B`;
}

function PickButton({
  accent,
  label,
  subtitle,
  onPress,
}: {
  accent: string;
  label: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center"
      style={{
        backgroundColor: accent,
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: accent,
        shadowOpacity: 0.28,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      }}
    >
      <Text className="text-white font-sansX text-[14px] tracking-widest">
        {label}
      </Text>
      <Text className="text-white font-monoBold text-[19px] mt-0.5">{subtitle}</Text>
    </Pressable>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Phase: Reason
// ════════════════════════════════════════════════════════════════════════════
function ReasonPhase({
  winner,
  loser,
  reason,
  note,
  setNote,
  mindChange,
  setMindChange,
  onSelect,
  onConfirm,
}: {
  winner: DuelAsset;
  loser: DuelAsset;
  reason: JournalReason | null;
  note: string;
  setNote: (s: string) => void;
  mindChange: string;
  setMindChange: (s: string) => void;
  onSelect: (r: JournalReason) => void;
  onConfirm: () => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 17, paddingBottom: 36 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(280)} className="mt-2">
        <Text
          className="text-ink text-[26px] font-displayX"
          style={{ letterSpacing: -0.5, lineHeight: 30 }}
        >
          You picked <Text className="text-brand">{winner.symbol}</Text>
        </Text>
        <Text className="text-ink-2 text-[14px] font-sansMd mt-1.5">
          over {loser.symbol}, {loser.name}
        </Text>
        <Text className="text-ink text-[15px] font-sansBold mt-6">
          Why? Pick the closest reason.
        </Text>
        <Text className="text-ink-3 text-[12.5px] font-sansMd mt-1 leading-[18px]">
          Six months from now, you'll thank yourself for writing this down.
        </Text>
      </Animated.View>

      <View className="flex-row flex-wrap gap-2 mt-5">
        {REASONS.map((r) => {
          const on = reason === r.id;
          return (
            <Pressable
              key={r.id}
              onPress={() => onSelect(r.id)}
              className={`flex-row items-center px-3.5 py-2.5 rounded-full border ${
                on ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
              }`}
            >
              <Text className="mr-1.5">{r.emoji}</Text>
              <Text
                className={`text-[13.5px] ${
                  on ? "text-brand font-sansBold" : "text-ink font-sansSb"
                }`}
              >
                {r.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-6">
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
          What would change your mind?
        </Text>
        <View className="bg-bg-surface border border-line rounded-[14px] px-4 py-3 mb-4">
          <TextInput
            value={mindChange}
            onChangeText={setMindChange}
            placeholder="e.g. If margins compress two quarters in a row…"
            placeholderTextColor="#8C988F"
            multiline
            className="text-ink text-[15px] font-sansSb"
            style={{ minHeight: 48 }}
          />
        </View>
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
          Optional note
        </Text>
        <View className="bg-bg-surface border border-line rounded-[14px] px-4 py-3">
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="One sentence, what's your edge here?"
            placeholderTextColor="#8C988F"
            multiline
            className="text-ink text-[15px] font-sansSb"
            style={{ minHeight: 60 }}
          />
        </View>
      </View>

      <View className="mt-7">
        <Button
          label="Save & see the take"
          fullWidth
          size="lg"
          disabled={!reason}
          onPress={onConfirm}
        />
      </View>
    </ScrollView>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Phase: Synthesis
// ════════════════════════════════════════════════════════════════════════════
function SynthesisPhase({
  winner,
  loser,
  onAnother,
  onDone,
}: {
  winner: DuelAsset;
  loser: DuelAsset;
  onAnother: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const holdings = useStore((s) => s.holdings);
  const modelThesis = useStore((s) => s.modelThesis);
  const setModelThesis = useStore((s) => s.setModelThesis);
  const appendThesisChangelog = useStore((s) => s.appendThesisChangelog);
  const [addedToThesis, setAddedToThesis] = useState(false);
  const techPct = useMemo(() => techWeightFromHoldings(holdings), [holdings]);
  const take = useMemo(() => {
    if (winner.stock && loser.stock) {
      return takeForUserPick(winner.stock, loser.stock, profile, { techWeightPct: techPct });
    }
    const v = duelVerdict(winner, loser, themeIds, profile, holdings);
    const chips = [
      profile.risk.replace("-", " ") + " risk",
      techPct > 20 ? `${Math.round(techPct)}% tech-weighted` : `${profile.horizon} horizon`,
      v.overlapPct != null ? `${v.overlapPct}% fund overlap` : "ETF · stock mix",
    ];
    return {
      pick: winner.symbol,
      body: `You chose ${winner.symbol}. ${v.recommendation}`,
      chips,
    };
  }, [winner, loser, profile, themeIds, holdings, techPct]);
  const suggestions = useMemo<ETFSuggestion[]>(
    () => suggestForDuelAssets(winner, loser, profile, 3),
    [winner, loser, profile]
  );
  const pickColor = take.pick === winner.symbol ? ACCENT_THIS : ACCENT_THAT;
  const debrief = useMemo(
    () => duelDebriefLines(winner, loser, profile, themeIds),
    [winner, loser, profile, themeIds]
  );
  const fitW = useMemo(
    () =>
      thesisFitForAsset(
        {
          kind: winner.kind,
          themes: winner.themes,
          stock: winner.stock,
          etf: winner.etf,
        },
        profile,
        themeIds
      ),
    [winner, profile, themeIds]
  );
  const hint = useMemo(() => lessonHintFromBreakdown(fitW.breakdown), [fitW.breakdown]);

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 17, paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(350)} className="mt-2 mb-5">
        <Text
          className="text-ink text-[26px] font-displayX"
          style={{ letterSpacing: -0.6, lineHeight: 30 }}
        >
          Your CFO take
        </Text>
        <Text className="text-ink-2 text-[14.5px] font-sansMd mt-2 leading-[21px]">
          How your pick reads against your profile, plus a lower-risk way to express the same theme.
        </Text>
      </Animated.View>

      <Card pad={14} className="mb-4 border-line">
        <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-widest mb-2">
          Post-duel debrief
        </Text>
        <Text className="text-ink text-[14px] font-sansBold leading-[20px] mb-3">
          {debrief.headline}
        </Text>
        {debrief.dimensions.map((d) => (
          <View key={d.label} className="mb-2">
            <Text className="text-ink font-sansBold text-[12px]">{d.label}</Text>
            <Text className="text-ink-2 text-[12.5px] font-sansMd leading-[18px]">{d.detail}</Text>
          </View>
        ))}
        {hint && (
          <Pressable
            onPress={() => router.push(lessonPath(hint) as never)}
            className="mt-2 active:opacity-70"
          >
            <Text className="text-brand text-[12px] font-sansBold">
              Learn: {hint.title} →
            </Text>
          </Pressable>
        )}
      </Card>

      <ThesisBadge label="Thesis's personalized take">
        <View className="flex-row items-center mb-3">
          <Text className="text-ink-2 text-[14px] font-sansSb mr-2">
            For your profile, lean
          </Text>
          <View
            className="rounded-[9px] px-2.5 py-1"
            style={{ backgroundColor: pickColor }}
          >
            <Text className="text-white font-monoBold text-[14px]">
              {take.pick}
            </Text>
          </View>
        </View>
        <Text className="text-ink text-[14.5px] font-sansSb leading-[22px] mb-4">
          {take.body}
        </Text>
        <View className="flex-row flex-wrap gap-1.5 mb-4">
          {take.chips.map((c) => (
            <MetaChip key={c} label={c} />
          ))}
        </View>

        {suggestions[0] && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(tabs)/etf/[symbol]",
                params: { symbol: suggestions[0].etf.symbol },
              } as never)
            }
            className="active:opacity-85"
          >
            <View className="bg-violet-bg rounded-[14px] p-3.5 flex-row items-start border border-violet/20">
              <View
                className="items-center justify-center mr-3"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: "#7C3AED",
                }}
              >
                <Text className="text-white font-monoBold text-[12px]">
                  {suggestions[0].etf.symbol}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-violet text-[11px] font-sansX uppercase tracking-wider mb-1">
                  Suggested alternative
                </Text>
                <Text className="text-ink-2 text-[13.5px] font-sansSb leading-[20px]">
                  {suggestions[0].why}
                </Text>
                <Text className="text-brand text-[12px] font-sansBold mt-2">
                  View {suggestions[0].etf.symbol} →
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      </ThesisBadge>

      {suggestions.length > 1 && (
        <View className="mt-6">
          <SectionTitle>Other ETF baskets</SectionTitle>
          <View className="gap-y-2.5">
            {suggestions.slice(1).map((s, i) => (
              <Animated.View
                key={s.etf.symbol}
                entering={FadeInDown.delay(80 + i * 70).duration(280)}
              >
                <Card pad={14}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="text-ink font-monoBold text-[15px]">
                        {s.etf.symbol}
                      </Text>
                      <View className="ml-2">
                        {s.containsBoth ? (
                          <Tag label="Holds both" tone="brand" />
                        ) : (
                          <Tag label="Themed match" />
                        )}
                      </View>
                    </View>
                    <Text className="text-ink-3 text-[11.5px] font-sansSb">
                      {s.etf.expense}% fee
                    </Text>
                  </View>
                  <Text className="text-ink-2 text-[13px] font-sansSb mt-1">
                    {s.etf.name}
                  </Text>
                  <Text className="text-ink text-[13px] font-sansSb mt-2.5 leading-[20px]">
                    {s.why}
                  </Text>
                </Card>
              </Animated.View>
            ))}
          </View>
        </View>
      )}

      {/* Add winner to thesis model */}
      {!addedToThesis && winner.kind !== "portfolio" && (
        <Card pad={16} className="mt-7 border-brand/25 bg-brand-bg/15">
          <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest mb-2">
            Conviction loop
          </Text>
          <Text className="text-ink text-[14px] font-sansBold leading-[20px] mb-1">
            Add {winner.symbol} to your thesis model?
          </Text>
          <Text className="text-ink-2 text-[12.5px] font-sansMd leading-[18px] mb-4">
            Your thesis model drives the Builder, Radar, and your personal scorecard.
            Adding {winner.symbol} logs this conviction so you can revisit it.
          </Text>
          <View className="flex-row gap-2">
            <Button
              label={`Add ${winner.symbol}`}
              size="md"
              onPress={() => {
                const existing = modelThesis?.holdings ?? [];
                const already = existing.some(
                  (h) => h.symbol === winner.symbol
                );
                const newHolding = {
                  symbol: winner.symbol,
                  weightPct: 5,
                  kind: winner.kind as "stock" | "etf",
                };
                const nextHoldings = already
                  ? existing
                  : [...existing, newHolding];
                setModelThesis({
                  name: modelThesis?.name ?? "My thesis portfolio",
                  conviction: modelThesis?.conviction ?? `Built from duel: ${winner.symbol} over ${loser.symbol}`,
                  climateId: modelThesis?.climateId ?? null,
                  themeIds: modelThesis?.themeIds ?? themeIds,
                  holdings: nextHoldings,
                  appliedLifeScenarios: modelThesis?.appliedLifeScenarios ?? [],
                  stressSummaries: modelThesis?.stressSummaries ?? [],
                  radarReports: modelThesis?.radarReports ?? [],
                  pieCustomization: modelThesis?.pieCustomization ?? DEFAULT_PIE_CUSTOMIZATION,
                });
                appendThesisChangelog({
                  trigger: "portfolio-save",
                  summary: `Added ${winner.symbol} from duel (picked over ${loser.symbol})`,
                  beforeHoldings: existing,
                  afterHoldings: nextHoldings,
                });
                setAddedToThesis(true);
              }}
            />
            <Button
              label="Skip"
              size="md"
              variant="ghost"
              onPress={() => setAddedToThesis(true)}
            />
          </View>
        </Card>
      )}
      {addedToThesis && winner.kind !== "portfolio" && (
        <View className="mt-7 rounded-[14px] border border-brand/30 bg-brand-bg/20 px-4 py-3.5">
          <View className="flex-row items-center">
            <Icon name="sparkle" size={16} color="#0E7A66" sw={2} />
            <Text className="text-brand text-[13px] font-sansBold ml-2">
              {winner.symbol} added to your thesis model
            </Text>
          </View>
        </View>
      )}

      <View className="mt-5 gap-y-2.5">
        <Button label="Another duel" fullWidth size="lg" onPress={onAnother} />
        <Button label="Done for now" fullWidth variant="ghost" onPress={onDone} />
      </View>

      <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-6 leading-[17px]">
        Educational tool. Not investment advice. Do your own research before
        buying anything.
      </Text>
    </ScrollView>
  );
}
