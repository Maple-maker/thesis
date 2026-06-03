import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { useStore } from "@/store";
import type { EmotionalState, JournalEntry } from "@/store/types";

// ── Constants ─────────────────────────────────────────────────────────────

const EMOTIONAL_EMOJI: Record<EmotionalState, string> = {
  confident: "😎",
  uncertain: "🤔",
  anxious: "😰",
  excited: "🤩",
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// ── Component ─────────────────────────────────────────────────────────────

/**
 * Monthly review card shown on the home screen.
 * Only renders when the user has >= 3 journal entries in the past 30 days.
 */
export function JournalReviewCard() {
  const router = useRouter();
  const journal = useStore((s) => s.journal);

  const recent = useMemo(() => {
    const cutoff = Date.now() - THIRTY_DAYS_MS;
    return journal
      .filter((j) => j.createdAt >= cutoff)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [journal]);

  if (recent.length < 3) return null;

  const emotionalSummary = useMemo(() => {
    const map = new Map<EmotionalState, number>();
    recent.forEach((j) => {
      if (j.emotionalState) {
        map.set(j.emotionalState, (map.get(j.emotionalState) ?? 0) + 1);
      }
    });
    if (map.size === 0) return null;
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
  }, [recent]);

  return (
    <View className="mb-4">
      <Card pad={18}>
        <View className="flex-row items-start mb-3">
          <View className="bg-brand-bg w-[40px] h-[40px] rounded-[12px] items-center justify-center mr-3">
            <Icon name="book" size={20} color="#0E7A66" sw={2} />
          </View>
          <View className="flex-1">
            <Text
              className="text-ink font-displayX text-[18px]"
              style={{ letterSpacing: -0.2 }}
            >
              This month in review
            </Text>
            <Text className="text-ink-2 text-[13px] font-sansMd mt-1 leading-[19px]">
              You made <Text className="font-sansBold text-ink">{recent.length}</Text>{" "}
              {recent.length === 1 ? "decision" : "decisions"} this month.
              Here&apos;s what you can learn.
            </Text>
          </View>
        </View>

        {/* ── Emotional state summary ── */}
        {emotionalSummary ? (
          <View className="flex-row gap-2 mb-3">
            {emotionalSummary.map(([state, count]) => (
              <View
                key={state}
                className="flex-row items-center bg-bg-surface2 rounded-[10px] px-2.5 py-1.5"
              >
                <Text className="text-[14px] mr-1.5">{EMOTIONAL_EMOJI[state]}</Text>
                <Text className="text-ink-2 text-[12px] font-sansSb">
                  {count}x {state}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Recent entries preview ── */}
        <View className="gap-y-2">
          {recent.slice(0, 4).map((entry) => (
            <EntryPreview key={entry.id} entry={entry} />
          ))}
        </View>

        {/* ── CTA ── */}
        <Pressable
          onPress={() => router.push("/(tabs)/journal")}
          className="flex-row items-center justify-center mt-3 pt-3 border-t border-line active:opacity-70"
        >
          <Text className="text-brand text-[14px] font-sansBold mr-1.5">
            Open full journal
          </Text>
          <Icon name="arrow" size={15} color="#0E7A66" sw={2.2} />
        </Pressable>
      </Card>
    </View>
  );
}

// ── Entry preview row ─────────────────────────────────────────────────────

const ENTRY_TYPE_LABEL: Record<string, string> = {
  duel: "Duel",
  buy: "Buy",
  sell: "Sell",
  "thesis-change": "Thesis",
  "watchlist-add": "Added to watchlist",
  "watchlist-remove": "Removed from watchlist",
  general: "Note",
};

function EntryPreview({ entry }: { entry: JournalEntry }) {
  const label = ENTRY_TYPE_LABEL[entry.type] ?? "Entry";
  const emoji = entry.emotionalState ? EMOTIONAL_EMOJI[entry.emotionalState] : null;

  return (
    <View className="flex-row items-center py-2 px-2.5 bg-bg-surface rounded-[10px]">
      <View className="flex-1">
        <Text className="text-ink text-[13px] font-sansSb">{label}</Text>
        {entry.winner ? (
          <Text className="text-ink-2 text-[12px] font-monoBold mt-0.5">
            {entry.winner}
            {entry.type === "duel" && entry.loser ? ` vs ${entry.loser}` : ""}
          </Text>
        ) : null}
      </View>
      <View className="flex-row items-center gap-2">
        {emoji ? <Text className="text-[16px]">{emoji}</Text> : null}
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider">
          {new Date(entry.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>
    </View>
  );
}
