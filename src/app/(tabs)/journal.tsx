import { useMemo } from "react";
import { Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tick } from "@/components/ui/Tick";
import { useStore } from "@/store";
import type { JournalReason } from "@/store/types";

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

export default function JournalScreen() {
  const journal = useStore((s) => s.journal);

  const counts = useMemo(() => {
    const map = new Map<JournalReason, number>();
    journal.forEach((j) => {
      map.set(j.reason, (map.get(j.reason) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [journal]);

  if (journal.length === 0) {
    return (
      <Screen padded>
        <Header
          title="Journal"
          subtitle="Every duel and the reason behind it."
        />
        <Card pad={28} className="mt-3 items-center">
          <View className="bg-brand-bg w-16 h-16 rounded-[16px] items-center justify-center">
            <Icon name="book" size={28} color="#0E7A66" />
          </View>
          <Text className="text-ink text-[16px] font-sansBold text-center mt-4">
            Your decisions will live here
          </Text>
          <Text className="text-ink-2 text-[13.5px] font-sansMd text-center mt-1 leading-[19px]">
            Run your first duel, log a reason — and start building an honest
            record of how you think.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen padded>
      <Header
        title="Journal"
        subtitle={`${journal.length} ${
          journal.length === 1 ? "decision" : "decisions"
        } recorded.`}
      />

      <SectionTitle>How you think</SectionTitle>
      <Card pad={16} className="mb-6">
        <View className="gap-y-2.5">
          {counts.slice(0, 5).map(([r, n]) => {
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

      <SectionTitle>History</SectionTitle>
      <View className="gap-y-2.5">
        {journal
          .slice()
          .reverse()
          .map((j) => (
            <Card key={j.id} pad={14}>
              <View className="flex-row items-center mb-2.5">
                <Tick ticker={j.winner} size={36} color="#0E7A66" />
                <View
                  className="bg-ink mx-2 items-center justify-center"
                  style={{ width: 26, height: 26, borderRadius: 13 }}
                >
                  <Text className="text-white font-displayX text-[10px] italic">
                    VS
                  </Text>
                </View>
                <Tick ticker={j.loser} size={32} />
                <View className="flex-1 ml-3">
                  <Text className="text-ink-3 text-[10.5px] font-sansX uppercase tracking-wider">
                    {new Date(j.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <Text className="text-ink text-[13.5px] font-sansBold mt-0.5">
                    Chose <Text className="text-brand">{j.winner}</Text>
                  </Text>
                </View>
              </View>
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
              {j.note ? (
                <Text className="text-ink-2 text-[13px] font-sansMd italic mt-2.5 leading-[19px]">
                  "{j.note}"
                </Text>
              ) : null}
            </Card>
          ))}
      </View>
    </Screen>
  );
}
