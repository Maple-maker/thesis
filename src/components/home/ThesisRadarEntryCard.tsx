import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import type { ThemeId } from "@/store/types";

type Props = {
  themeCount: number;
};

export function ThesisRadarEntryCard({ themeCount }: Props) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/watchlist" as never)}
      className="mb-4 active:opacity-90"
      accessibilityRole="button"
      accessibilityLabel="Open Thesis Radar"
    >
      <Card pad={16} className="border-brand/35 bg-brand-bg/25">
        <View className="flex-row items-start">
          <View className="w-11 h-11 rounded-[12px] bg-brand items-center justify-center mr-3">
            <Icon name="pulse" size={20} color="#FFFFFF" sw={2} />
          </View>
          <View className="flex-1">
            <Text className="text-brand text-[10px] font-sansX uppercase tracking-widest">
              Conviction
            </Text>
            <Text className="text-ink font-sansBold text-[16px] mt-0.5">Thesis Radar</Text>
            <Text className="text-ink-2 text-[12px] font-sansMd mt-1.5 leading-[17px]">
              {themeCount > 0
                ? "On Watchlist, passive picks to add based on your themes and goals."
                : "Pick themes in Builder, Radar will suggest stocks on Watchlist."}
            </Text>
          </View>
          <Icon name="chev" size={18} color="#0E7A66" sw={2} />
        </View>
      </Card>
    </Pressable>
  );
}
