import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { RadarReport } from "@/data/radar-reports";

type Props = {
  reports: RadarReport[];
};

export function RadarFeed({ reports }: Props) {
  const router = useRouter();

  if (!reports.length) return null;

  return (
    <View className="mb-6">
      <SectionTitle action="Watchlist →" onAction={() => router.push("/(tabs)/watchlist" as never)}>
        Thesis Radar
      </SectionTitle>
      <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px] mb-3 -mt-2">
        Discover thesis-fit names and pressure-test conviction, open Radar for the full flow.
      </Text>
      <View className="gap-y-2.5">
        {reports.slice(0, 2).map((r) => (
          <Card key={r.id} pad={14}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-wider flex-1 pr-2">
                {r.ago}
              </Text>
              <Icon name="pulse" size={16} color="#0E7A66" />
            </View>
            <Text className="text-ink font-sansBold text-[15px] leading-[20px] mb-2">
              {r.title}
            </Text>
            {r.bullets.slice(0, 3).map((b, i) => (
              <View key={i} className="flex-row mb-1.5">
                <Text className="text-brand mr-2">•</Text>
                <Text className="text-ink-2 text-[13px] font-sansMd flex-1 leading-[18px]">
                  {b}
                </Text>
              </View>
            ))}
            {r.learnLink && (
              <Pressable
                onPress={() => router.push("/(tabs)/education")}
                className="mt-2 active:opacity-70"
              >
                <Text className="text-brand text-[13px] font-sansBold">
                  Learn related concept →
                </Text>
              </Pressable>
            )}
          </Card>
        ))}
      </View>
    </View>
  );
}
