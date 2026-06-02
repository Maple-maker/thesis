import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { getEventBriefById } from "@/data/insights-feed";
import { pushAppRoute } from "@/lib/app-route";
import { useStore } from "@/store";

function normalizeParamId(raw: string | string[] | undefined): string {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && raw[0]) return raw[0];
  return "";
}

export default function EventBriefScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const id = normalizeParamId(rawId);
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const themeIds = useStore((s) => s.themeIds);
  const holdings = useStore((s) => s.holdings);
  const watchlist = useStore((s) => s.watchlist);

  const brief = useMemo(
    () => getEventBriefById(id ?? "", profile, themeIds, holdings, watchlist),
    [id, profile, themeIds, holdings, watchlist]
  );

  if (!brief) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
        <Text className="text-ink font-sansBold text-center">Brief not found or expired</Text>
        <View className="mt-4 w-full">
          <Button label="Back to Watchlist" fullWidth onPress={() => router.replace("/(tabs)/watchlist" as never)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
            Phase 3 · Event brief
          </Text>
          <Text className="text-ink font-displayX text-[22px]" style={{ letterSpacing: -0.4 }}>
            Tailored context
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex-row flex-wrap gap-2 mb-3">
          <Tag label="Event brief" tone="brand" />
          {brief.tags?.map((t) => (
            <Tag key={t} label={t} tone="meta" />
          ))}
          <Text className="text-ink-3 text-[12px] font-sansMd ml-auto">{brief.ago}</Text>
        </View>

        <Text className="text-ink font-displayX text-[26px] leading-[30px] mb-4" style={{ letterSpacing: -0.5 }}>
          {brief.headline}
        </Text>

        <Card pad={16} className="mb-5 bg-brand-bg/25 border-brand/20">
          <Text className="text-ink text-[15px] font-sansMd leading-[22px]">{brief.context}</Text>
        </Card>

        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-3">
          What to consider
        </Text>
        {brief.bullets.map((line, i) => (
          <View key={i} className="flex-row mb-3">
            <Text className="text-brand font-sansBold text-[16px] mr-3">{i + 1}</Text>
            <Text className="text-ink-2 text-[14.5px] font-sansMd flex-1 leading-[21px]">{line}</Text>
          </View>
        ))}

        <View className="mt-6 gap-y-2.5">
          {brief.actionLabel && brief.actionRoute && (
            <Button
              label={brief.actionLabel}
              fullWidth
              size="lg"
              onPress={() => pushAppRoute(router, brief.actionRoute!)}
            />
          )}
          {brief.secondaryActionLabel && brief.secondaryActionRoute && (
            <Button
              label={brief.secondaryActionLabel}
              fullWidth
              variant="secondary"
              onPress={() => pushAppRoute(router, brief.secondaryActionRoute!)}
            />
          )}
        </View>

        <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-8 leading-[16px]">
          Illustrative event layer, not investment advice. Live news monitors ship later.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
