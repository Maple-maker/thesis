import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
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

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Delta } from "@/components/ui/Delta";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { MetaChip, Tag } from "@/components/ui/Tag";
import { ThesisBadge } from "@/components/ui/ThesisBadge";
import { Tick } from "@/components/ui/Tick";
import { stockBySymbol } from "@/data/stocks";
import { themeById } from "@/data/themes";
import { casesFor, takeFor } from "@/lib/cases";
import { suggestForSymbols, type ETFSuggestion } from "@/lib/etf-overlap";
import { useStore } from "@/store";
import type { JournalReason, Stock } from "@/store/types";

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

type Phase = "compare" | "reason" | "synthesis";

// Stock-specific accent colors (used for ticker monograms in the duel)
const ACCENT_THIS = "#0E7A66";
const ACCENT_THAT = "#7C3AED";

export default function DuelScreen() {
  const router = useRouter();
  const watchlist = useStore((s) => s.watchlist);
  const profile = useStore((s) => s.profile);
  const recordDuel = useStore((s) => s.recordDuel);

  const [pair, setPair] = useState<[Stock, Stock] | null>(null);
  const [phase, setPhase] = useState<Phase>("compare");
  const [winnerSym, setWinnerSym] = useState<string | null>(null);
  const [reason, setReason] = useState<JournalReason | null>(null);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    setPair(pickPair(watchlist));
  }, []);

  const newDuel = useCallback(() => {
    setPair(pickPair(watchlist));
    setPhase("compare");
    setWinnerSym(null);
    setReason(null);
    setNote("");
  }, [watchlist]);

  if (!pair) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
        <Text className="text-ink text-[18px] font-sansBold text-center">
          Need at least 2 stocks on your watchlist
        </Text>
        <View className="mt-6 w-full">
          <Button label="Close" fullWidth onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const [a, b] = pair;
  const winner = winnerSym === a.symbol ? a : b;
  const loser = winnerSym === a.symbol ? b : a;

  const onPick = (which: "a" | "b") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWinnerSym(which === "a" ? a.symbol : b.symbol);
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
      loser: winnerSym === a.symbol ? b.symbol : a.symbol,
      reason,
      note: note.trim() || undefined,
    });
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
        <Pressable
          onPress={newDuel}
          className="bg-bg-surface border border-line px-3 h-9 items-center justify-center rounded-[12px]"
        >
          <Text className="text-ink-2 text-[13px] font-sansBold">↻ New</Text>
        </Pressable>
      </View>

      {phase === "compare" && (
        <ComparePhase a={a} b={b} profile={profile} onPick={onPick} />
      )}

      {phase === "reason" && winner && loser && (
        <ReasonPhase
          winner={winner}
          loser={loser}
          reason={reason}
          note={note}
          setNote={setNote}
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
  onPick,
}: {
  a: Stock;
  b: Stock;
  profile: ReturnType<typeof useStore.getState>["profile"];
  onPick: (which: "a" | "b") => void;
}) {
  const [tab, setTab] = useState<"a" | "b">("a");
  const sharedTheme = a.themes.find((t) => b.themes.includes(t));
  const themeMeta = sharedTheme ? themeById(sharedTheme) : undefined;

  const aCases = useMemo(() => casesFor(a), [a]);
  const bCases = useMemo(() => casesFor(b), [b]);
  const active = tab === "a" ? a : b;
  const activeCases = tab === "a" ? aCases : bCases;
  const activeColor = tab === "a" ? ACCENT_THIS : ACCENT_THAT;

  const metrics = useMemo(() => buildMetrics(a, b), [a, b]);

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 17, paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mt-1 mb-4">
        <Text
          className="text-ink text-[28px] font-displayX"
          style={{ letterSpacing: -0.6, lineHeight: 32 }}
        >
          This <Text className="text-brand">or</Text>{" "}
          <Text style={{ color: ACCENT_THAT }}>That</Text>?
        </Text>
        {themeMeta && (
          <View className="self-start mt-2">
            <Tag label={`${themeMeta.kicker} · ${themeMeta.heat}`} tone="brand" />
          </View>
        )}
      </View>

      {/* VS row */}
      <View className="flex-row items-stretch mb-5">
        <PickCard stock={a} accent={ACCENT_THIS} />
        <View className="w-9 items-center justify-center">
          <View
            className="bg-ink items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: 16 }}
          >
            <Text
              className="text-white font-displayX text-[11px] italic"
              style={{ letterSpacing: -0.3 }}
            >
              VS
            </Text>
          </View>
        </View>
        <PickCard stock={b} accent={ACCENT_THAT} />
      </View>

      {/* Metrics table */}
      <SectionTitle>Head to head</SectionTitle>
      <Card pad={0} className="overflow-hidden mb-6">
        {metrics.map((m, i) => (
          <View
            key={m.label}
            className={`flex-row items-center ${
              i < metrics.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <View
              className={`flex-1 items-center py-3.5 px-2`}
              style={{
                backgroundColor: m.better === "a" ? "#0E7A6614" : "transparent",
              }}
            >
              <Text
                className={`font-monoBold text-[14.5px] ${
                  m.better === "a" ? "text-ink" : "text-ink-3"
                }`}
              >
                {m.a}
              </Text>
            </View>
            <View className="flex-[1.1] items-center py-3.5">
              <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider">
                {m.label}
              </Text>
            </View>
            <View
              className={`flex-1 items-center py-3.5 px-2`}
              style={{
                backgroundColor: m.better === "b" ? "#7C3AED14" : "transparent",
              }}
            >
              <Text
                className={`font-monoBold text-[14.5px] ${
                  m.better === "b" ? "text-ink" : "text-ink-3"
                }`}
              >
                {m.b}
              </Text>
            </View>
          </View>
        ))}
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
        <CaseCard type="bull" ticker={active.symbol} items={activeCases.bull} />
        <CaseCard type="bear" ticker={active.symbol} items={activeCases.bear} />
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

function PickCard({ stock, accent }: { stock: Stock; accent: string }) {
  return (
    <View
      className="flex-1 bg-bg-surface items-center"
      style={{
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: accent,
        padding: 14,
        shadowColor: accent,
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      <Tick ticker={stock.symbol} size={44} color={accent} />
      <Text className="text-ink font-monoBold text-[15px] mt-2.5">{stock.symbol}</Text>
      <Text className="text-ink-3 text-[11px] font-sansSb mt-0.5" numberOfLines={1}>
        {stock.name}
      </Text>
      <Text className="text-ink font-monoBold text-[16px] mt-2">
        ${stock.marketCap}B
      </Text>
      <Text className="text-ink-3 text-[10px] font-sansX uppercase mt-0.5 tracking-wider">
        Market Cap
      </Text>
    </View>
  );
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

function CaseCard({
  type,
  ticker,
  items,
}: {
  type: "bull" | "bear";
  ticker: string;
  items: string[];
}) {
  const [open, setOpen] = useState(true);
  const bull = type === "bull";
  return (
    <View
      className="bg-bg-surface overflow-hidden"
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: bull ? "#BDE6CE" : "#F2C9BE",
      }}
    >
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center px-3.5 py-3"
        style={{ backgroundColor: bull ? "#E5F5EC" : "#FBEAE5" }}
      >
        <View
          className="items-center justify-center mr-2.5"
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            backgroundColor: bull ? "#149059" : "#D8472C",
          }}
        >
          <Icon name={bull ? "trend" : "shield"} size={16} color="#FFFFFF" sw={2} />
        </View>
        <Text
          className="flex-1 font-displayX text-[15.5px]"
          style={{
            color: bull ? "#0C5836" : "#8F2A18",
            letterSpacing: -0.2,
          }}
        >
          {bull ? "Bull case" : "Bear case"} for {ticker}
        </Text>
        <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
          <Icon
            name="chevDown"
            size={18}
            color={bull ? "#149059" : "#D8472C"}
            sw={2}
          />
        </View>
      </Pressable>
      {open && (
        <View className="px-4 py-3.5 gap-y-2.5">
          {items.map((item, i) => (
            <View key={i} className="flex-row items-start">
              <Text
                className="font-sansX text-[16px] mr-2.5"
                style={{ color: bull ? "#149059" : "#D8472C", marginTop: -1 }}
              >
                {bull ? "+" : "–"}
              </Text>
              <Text className="text-ink text-[13.5px] font-sansSb flex-1 leading-[20px]">
                {item}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
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
  onSelect,
  onConfirm,
}: {
  winner: Stock;
  loser: Stock;
  reason: JournalReason | null;
  note: string;
  setNote: (s: string) => void;
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
          over {loser.symbol} — {loser.name}
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
          Optional note
        </Text>
        <View className="bg-bg-surface border border-line rounded-[14px] px-4 py-3">
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="One sentence — what's your edge here?"
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
  winner: Stock;
  loser: Stock;
  onAnother: () => void;
  onDone: () => void;
}) {
  const profile = useStore((s) => s.profile);
  const take = useMemo(() => takeFor(winner, loser, profile), [winner, loser, profile]);
  const suggestions = useMemo<ETFSuggestion[]>(
    () => suggestForSymbols(winner.symbol, loser.symbol, profile, 3),
    [winner.symbol, loser.symbol, profile]
  );
  const pickColor = take.pick === winner.symbol ? ACCENT_THIS : ACCENT_THAT;

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
          The personalized take
        </Text>
        <Text className="text-ink-2 text-[14.5px] font-sansMd mt-2 leading-[21px]">
          You leaned {winner.symbol}. Here's how that reads against your
          profile, and what an ETF synthesis would look like.
        </Text>
      </Animated.View>

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
          <View className="bg-violet-bg rounded-[14px] p-3.5 flex-row items-start">
            <View
              className="items-center justify-center mr-3"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: "#7C3AED",
              }}
            >
              <Text className="text-white font-monoBold text-[11px]">
                {suggestions[0].etf.symbol.slice(0, 4)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-violet text-[11.5px] font-sansX uppercase tracking-wider mb-1">
                Suggested alternative
              </Text>
              <Text className="text-ink-2 text-[13.5px] font-sansSb leading-[19px]">
                {suggestions[0].why}
              </Text>
            </View>
          </View>
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

      <View className="mt-7 gap-y-2.5">
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

// ════════════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════════════
function pickPair(watchlist: string[]): [Stock, Stock] | null {
  if (watchlist.length < 2) return null;
  const stocks = watchlist.map(stockBySymbol).filter(Boolean) as Stock[];
  if (stocks.length < 2) return null;

  // Prefer pairs sharing a theme
  const candidatePairs: [Stock, Stock][] = [];
  for (let i = 0; i < stocks.length; i++) {
    for (let j = i + 1; j < stocks.length; j++) {
      const a = stocks[i];
      const b = stocks[j];
      if (a.themes.some((t) => b.themes.includes(t))) {
        candidatePairs.push([a, b]);
      }
    }
  }
  if (candidatePairs.length > 0) {
    return candidatePairs[Math.floor(Math.random() * candidatePairs.length)];
  }
  const i = Math.floor(Math.random() * stocks.length);
  let j = Math.floor(Math.random() * stocks.length);
  while (j === i) j = Math.floor(Math.random() * stocks.length);
  return [stocks[i], stocks[j]];
}

type Metric = { label: string; a: string; b: string; better: "a" | "b" | "tie" };

function buildMetrics(a: Stock, b: Stock): Metric[] {
  const m: Metric[] = [];
  m.push({
    label: "Market Cap",
    a: fmtCap(a.marketCap),
    b: fmtCap(b.marketCap),
    better: a.marketCap > b.marketCap ? "a" : "b",
  });
  m.push({
    label: "P/E",
    a: a.peRatio ? String(a.peRatio) : "—",
    b: b.peRatio ? String(b.peRatio) : "—",
    better: betterLower(a.peRatio, b.peRatio),
  });
  m.push({
    label: "Div Yield",
    a: a.divYield > 0 ? `${a.divYield}%` : "—",
    b: b.divYield > 0 ? `${b.divYield}%` : "—",
    better: a.divYield > b.divYield ? "a" : a.divYield < b.divYield ? "b" : "tie",
  });
  m.push({
    label: "Volatility",
    a: a.volatility,
    b: b.volatility,
    better: volBetter(a.volatility, b.volatility),
  });
  return m;
}

function fmtCap(b: number): string {
  if (b >= 1000) return `$${(b / 1000).toFixed(1)}T`;
  return `$${b}B`;
}

function betterLower(a: number | null, b: number | null): "a" | "b" | "tie" {
  if (a == null && b == null) return "tie";
  if (a == null) return "b";
  if (b == null) return "a";
  if (a < b) return "a";
  if (b < a) return "b";
  return "tie";
}

function volBetter(av: string, bv: string): "a" | "b" | "tie" {
  const rank: Record<string, number> = { low: 0, med: 1, high: 2 };
  if (rank[av] < rank[bv]) return "a";
  if (rank[bv] < rank[av]) return "b";
  return "tie";
}
