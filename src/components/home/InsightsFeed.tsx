import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Tag } from "@/components/ui/Tag";
import type { InsightItem } from "@/data/insights-feed";

type Props = {
  items: InsightItem[];
};

export function InsightsFeed({ items }: Props) {
  const router = useRouter();
  if (!items.length) return null;

  return (
    <View className="mb-6">
      <SectionTitle action="Watchlist →" onAction={() => router.push("/(tabs)/watchlist" as never)}>
        Insights & briefs
      </SectionTitle>
      <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px] mb-3 -mt-2">
        Event briefs + thesis checks, or open Thesis Radar for stock discovery.
      </Text>
      <View className="gap-y-2.5">
        {items.map((item) => {
          if (item.kind === "event") {
            const b = item.brief;
            return (
              <Pressable
                key={b.id}
                onPress={() =>
                  router.push({ pathname: "/brief/[id]", params: { id: b.id } } as never)
                }
                className="active:opacity-85"
              >
                <Card pad={14} className="border-brand/15">
                  <View className="flex-row items-center justify-between mb-2">
                    <Tag label="Event brief" tone="brand" />
                    <Text className="text-ink-3 text-[11px] font-sansX">{b.ago}</Text>
                  </View>
                  <Text className="text-ink font-sansBold text-[15px] leading-[20px] mb-2">
                    {b.headline}
                  </Text>
                  <Text className="text-ink-2 text-[13px] font-sansMd leading-[18px]" numberOfLines={2}>
                    {b.context}
                  </Text>
                  <Text className="text-brand text-[13px] font-sansBold mt-2">Read brief →</Text>
                </Card>
              </Pressable>
            );
          }
          const r = item.report;
          return (
            <Card key={r.id} pad={14}>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider flex-1">
                  {r.ago} · Radar
                </Text>
                <Icon name="pulse" size={16} color="#0E7A66" />
              </View>
              <Text className="text-ink font-sansBold text-[15px] leading-[20px] mb-2">
                {r.title}
              </Text>
              {r.bullets.slice(0, 2).map((line, i) => (
                <View key={i} className="flex-row mb-1">
                  <Text className="text-brand mr-2">•</Text>
                  <Text className="text-ink-2 text-[13px] font-sansMd flex-1 leading-[18px]">
                    {line}
                  </Text>
                </View>
              ))}
            </Card>
          );
        })}
      </View>
    </View>
  );
}
