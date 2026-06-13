import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { JournalComposer } from "@/components/journal/JournalComposer";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { IconBtn } from "@/components/ui/IconBtn";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tick } from "@/components/ui/Tick";
import { useStore } from "@/store";
import type { EmotionalState, JournalEntry, JournalEntryType, JournalReason } from "@/store/types";

// ── Constants ─────────────────────────────────────────────────────────────

const ENTRY_TYPE_LABEL: Record<JournalEntryType, string> = {
  duel: "Duel",
  buy: "Buy",
  sell: "Sell",
  "thesis-change": "Thesis",
  "watchlist-add": "Watch +",
  "watchlist-remove": "Watch −",
  general: "General",
};

const ENTRY_TYPE_ICON: Record<JournalEntryType, IconName> = {
  duel: "compare",
  buy: "plus",
  sell: "arrow",
  "thesis-change": "sparkle",
  "watchlist-add": "plus",
  "watchlist-remove": "close",
  general: "book",
};

const REASON_LABEL: Record<JournalReason, string> = {
  "better-moat": "Better moat",
  "cheaper-valuation": "Cheaper valuation",
  "stronger-growth": "Stronger growth",
  "more-aligned": "Fits my thesis",
  "better-management": "Better management",
  safer: "Safer",
  gut: "Gut feeling",
  other: "Other",
};

const REASON_ICON: Record<JournalReason, IconName> = {
  "better-moat": "moat",
  "cheaper-valuation": "target",
  "stronger-growth": "trend",
  "more-aligned": "sparkle",
  "better-management": "profile",
  safer: "shield",
  gut: "flame",
  other: "info",
};

const EMOTIONAL_EMOJI: Record<EmotionalState, string> = {
  confident: "😎",
  uncertain: "🤔",
  anxious: "😰",
  excited: "🤩",
};

const EMOTIONAL_LABEL: Record<EmotionalState, string> = {
  confident: "Confident",
  uncertain: "Uncertain",
  anxious: "Anxious",
  excited: "Excited",
};

const ALL_ENTRY_TYPES: ("all" | JournalEntryType)[] = [
  "all",
  "duel",
  "buy",
  "sell",
  "thesis-change",
  "watchlist-add",
  "watchlist-remove",
  "general",
];

// ── Helpers ───────────────────────────────────────────────────────────────

function entryTitle(e: JournalEntry): string {
  switch (e.type) {
    case "duel":
      return `Chose ${e.winner ?? "—"}`;
    case "buy":
      return `Bought ${e.winner ?? "—"}`;
    case "sell":
      return `Sold ${e.winner ?? "—"}`;
    case "thesis-change":
      return `Thesis updated`;
    case "watchlist-add":
      return `Added ${e.winner ?? "—"} to watchlist`;
    case "watchlist-remove":
      return `Removed ${e.winner ?? "—"} from watchlist`;
    case "general":
      return e.note ?? "General note";
  }
}

function entrySubtitle(e: JournalEntry): string | null {
  switch (e.type) {
    case "duel":
      return e.loser ? `vs ${e.loser}` : null;
    case "buy":
    case "sell":
    case "watchlist-add":
    case "watchlist-remove":
      return null;
    case "thesis-change":
    case "general":
      return null;
  }
}

function hasSymbols(e: JournalEntry): boolean {
  return !!(e.winner || e.loser);
}

function showWinnerTick(e: JournalEntry): boolean {
  return e.type === "duel" || e.type === "buy" || e.type === "sell" || e.type === "watchlist-add";
}

function showLoserTick(e: JournalEntry): boolean {
  return e.type === "duel";
}

// ── Component ─────────────────────────────────────────────────────────────

export default function JournalScreen() {
  const journal = useStore((s) => s.journal);
  const [filter, setFilter] = useState<"all" | JournalEntryType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [composerVisible, setComposerVisible] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return journal;
    return journal.filter((j) => j.type === filter);
  }, [journal, filter]);

  const countsByType = useMemo(() => {
    const map = new Map<string, number>();
    journal.forEach((j) => {
      const key = j.type ?? "duel";
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [journal]);

  const countsByReason = useMemo(() => {
    const map = new Map<JournalReason, number>();
    journal.forEach((j) => {
      if (j.reason) map.set(j.reason, (map.get(j.reason) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [journal]);

  const emotionalCounts = useMemo(() => {
    const map = new Map<EmotionalState, number>();
    journal.forEach((j) => {
      if (j.emotionalState) map.set(j.emotionalState, (map.get(j.emotionalState) ?? 0) + 1);
    });
    return map;
  }, [journal]);

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (journal.length === 0) {
    return (
      <>
        <Screen padded>
          <Header
            title="Journal"
            subtitle="Every decision and the thinking behind it."
            right={
              <IconBtn name="plus" onPress={() => setComposerVisible(true)} tone="brand" />
            }
          />
          <Card pad={28} className="mt-3 items-center">
            <View className="bg-brand-bg w-16 h-16 rounded-[16px] items-center justify-center">
              <Icon name="book" size={28} color="#0E7A66" />
            </View>
            <Text className="text-ink text-[16px] font-sansBold text-center mt-4">
              Your decisions will live here
            </Text>
            <Text className="text-ink-2 text-[13.5px] font-sansMd text-center mt-1 leading-[19px]">
              Log your buys, sells, thesis changes, or anything worth remembering.
            </Text>
          </Card>
        </Screen>
        <JournalComposer visible={composerVisible} onClose={() => setComposerVisible(false)} />
      </>
    );
  }

  return (
    <>
      <Screen padded>
      <Header
        title="Journal"
        subtitle={`${journal.length} ${
          journal.length === 1 ? "decision" : "decisions"
        } recorded.`}
        right={
          <IconBtn name="plus" onPress={() => setComposerVisible(true)} tone="brand" />
        }
      />

      {/* ── Filter chips ── */}
      <View className="flex-row flex-wrap gap-2 mb-5">
        {ALL_ENTRY_TYPES.map((t) => {
          const active = filter === t;
          const count = t === "all" ? journal.length : countsByType.get(t) ?? 0;
          return (
            <Pressable
              key={t}
              onPress={() => setFilter(t)}
              className={`flex-row items-center px-3 py-2 rounded-full border ${
                active
                  ? "bg-brand-bg border-brand"
                  : "bg-bg-surface border-line"
              }`}
            >
              {t !== "all" && (
                <View className="mr-1.5">
                  <Icon
                    name={ENTRY_TYPE_ICON[t]}
                    size={13}
                    color={active ? "#0E7A66" : "#4D5A54"}
                    sw={1.8}
                  />
                </View>
              )}
              <Text
                className={`text-[12.5px] font-sansSb ${
                  active ? "text-brand" : "text-ink-2"
                }`}
              >
                {t === "all" ? "All" : ENTRY_TYPE_LABEL[t]}
              </Text>
              <View
                className={`ml-1.5 px-1.5 py-0.5 rounded-[6px] ${
                  active ? "bg-brand" : "bg-track"
                }`}
              >
                <Text
                  className={`text-[10px] font-monoBold ${
                    active ? "text-white" : "text-ink-3"
                  }`}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* ── Emotional state summary (when at least one entry has it) ── */}
      {emotionalCounts.size > 0 && countsByReason.length === 0 && (
        <SectionTitle>How you've been feeling</SectionTitle>
      )}
      {emotionalCounts.size > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-5">
          {(["confident", "uncertain", "anxious", "excited"] as EmotionalState[]).map(
            (state) => {
              const count = emotionalCounts.get(state) ?? 0;
              if (count === 0) return null;
              const pct = Math.round((count / journal.length) * 100);
              return (
                <View
                  key={state}
                  className="bg-bg-surface border border-line rounded-[12px] px-3 py-2"
                >
                  <Text className="text-[16px]">{EMOTIONAL_EMOJI[state]}</Text>
                  <Text className="text-ink-2 text-[11px] font-sansSb mt-0.5">
                    {EMOTIONAL_LABEL[state]} · {pct}%
                  </Text>
                </View>
              );
            }
          )}
        </View>
      )}

      {/* ── Reason breakdown (only for duel entries) ── */}
      {countsByReason.length > 0 && (
        <>
          <SectionTitle>How you think</SectionTitle>
          <Card pad={16} className="mb-6">
            <View className="gap-y-2.5">
              {countsByReason.slice(0, 5).map(([r, n]) => {
                const pct = Math.round((n / journal.length) * 100);
                return (
                  <View key={r}>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <View className="flex-row items-center">
                        <View className="bg-brand-bg w-7 h-7 rounded-[9px] items-center justify-center mr-2.5">
                          <Icon name={REASON_ICON[r]} size={14} color="#0E7A66" />
                        </View>
                        <Text className="text-ink text-[13.5px] font-sansSb">
                          {REASON_LABEL[r]}
                        </Text>
                      </View>
                      <Text className="text-ink-2 font-monoBold text-[13px]">
                        {n} · {pct}%
                      </Text>
                    </View>
                    <View className="bg-track h-[5px] rounded-full overflow-hidden">
                      <View
                        className="bg-brand h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        </>
      )}

      {/* ── History ── */}
      <SectionTitle>History</SectionTitle>
      <View className="gap-y-2.5">
        {filtered
          .slice()
          .reverse()
          .map((j) => {
            const isExpanded = expandedId === j.id;
            const hasFreeform = !!j.freeformNote;
            return (
              <Pressable
                key={j.id}
                onPress={() => {
                  if (hasFreeform) toggleExpanded(j.id);
                }}
                style={({ pressed }) => ({ opacity: hasFreeform && pressed ? 0.7 : 1 })}
              >
                <Card pad={14}>
                  {/* ── Top row: symbols or type indicator ── */}
                  <View className="flex-row items-center mb-2.5">
                    {showWinnerTick(j) && j.winner ? (
                      <Tick
                        ticker={j.winner}
                        size={36}
                        color={j.type === "sell" ? "#D8472C" : "#0E7A66"}
                      />
                    ) : (
                      <View className="bg-brand-bg w-[36px] h-[36px] rounded-[10px] items-center justify-center">
                        <Icon
                          name={ENTRY_TYPE_ICON[j.type]}
                          size={16}
                          color="#0E7A66"
                        />
                      </View>
                    )}
                    {showLoserTick(j) && j.loser ? (
                      <>
                        <View className="bg-ink mx-2 items-center justify-center" style={{ width: 26, height: 26, borderRadius: 13 }}>
                          <Text className="text-white font-displayX text-[10px] italic">
                            VS
                          </Text>
                        </View>
                        <Tick ticker={j.loser} size={32} />
                      </>
                    ) : null}
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center">
                        <Text className="text-ink-3 text-[10.5px] font-sansX uppercase tracking-wider">
                          {new Date(j.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                        <View className="ml-2 px-1.5 py-0.5 rounded-[4px] bg-bg-surface2">
                          <Text className="text-ink-3 text-[9px] font-sansX uppercase tracking-wider">
                            {ENTRY_TYPE_LABEL[j.type]}
                          </Text>
                        </View>
                      </View>
                      <Text
                        className={`text-[13.5px] font-sansBold mt-0.5 ${
                          j.type === "sell" ? "text-neg" : "text-ink"
                        }`}
                      >
                        {entryTitle(j)}
                      </Text>
                      {entrySubtitle(j) ? (
                        <Text className="text-ink-2 text-[12px] font-sansMd">
                          {entrySubtitle(j)}
                        </Text>
                      ) : null}
                    </View>

                    {/* ── Emotional state badge ── */}
                    {j.emotionalState ? (
                      <View className="ml-1 items-center justify-center w-[34px] h-[34px] rounded-[10px] bg-bg-surface2">
                        <Text className="text-[16px]">
                          {EMOTIONAL_EMOJI[j.emotionalState]}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* ── Reason row (duel entries) ── */}
                  {j.reason ? (
                    <View className="flex-row items-center bg-bg-surface2 rounded-[10px] px-2.5 py-2">
                      <Icon
                        name={REASON_ICON[j.reason]}
                        size={14}
                        color="#4D5A54"
                        sw={1.8}
                      />
                      <Text className="text-ink-2 text-[12.5px] font-sansSb ml-2">
                        {REASON_LABEL[j.reason]}
                      </Text>
                    </View>
                  ) : null}

                  {/* ── Short note ── */}
                  {j.note && !j.freeformNote ? (
                    <Text className="text-ink-2 text-[13px] font-sansMd italic mt-2.5 leading-[19px]">
                      "{j.note}"
                    </Text>
                  ) : null}

                  {/* ── Tags ── */}
                  {j.tags && j.tags.length > 0 ? (
                    <View className="flex-row flex-wrap gap-1.5 mt-2.5">
                      {j.tags.map((tag) => (
                        <View
                          key={tag}
                          className="bg-track px-2 py-0.5 rounded-[6px]"
                        >
                          <Text className="text-ink-3 text-[10px] font-sansSb">
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {/* ── Expandable freeform note ── */}
                  {hasFreeform ? (
                    <>
                      <Pressable
                        onPress={() => toggleExpanded(j.id)}
                        className="flex-row items-center mt-2"
                      >
                        <Text className="text-brand text-[12px] font-sansSb">
                          {isExpanded ? "Hide reflection" : "Read reflection"}
                        </Text>
                        <Icon
                          name={isExpanded ? "chevDown" : "chev"}
                          size={14}
                          color="#0E7A66"
                          sw={2}
                        />
                      </Pressable>
                      {isExpanded ? (
                        <View className="mt-2 bg-bg-surface2 rounded-[12px] px-3 py-3">
                          <Text className="text-ink-2 text-[13px] font-sansMd leading-[20px]">
                            {j.freeformNote}
                          </Text>
                        </View>
                      ) : null}
                    </>
                  ) : null}
                </Card>
              </Pressable>
            );
          })}
      </View>

      {/* ── Empty state for filter with no results ── */}
      {filtered.length === 0 && (
        <View className="items-center py-10">
          <Text className="text-ink-3 text-[14px] font-sansSb">
            No entries of this type yet
          </Text>
        </View>
      )}
      <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-4 mb-2">
        Educational only · not investment advice
      </Text>
    </Screen>
      <JournalComposer visible={composerVisible} onClose={() => setComposerVisible(false)} />
    </>
  );
}
