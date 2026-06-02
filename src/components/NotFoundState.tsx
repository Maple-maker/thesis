import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { GoDeeperVideos } from "@/components/GoDeeperVideos";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { YoutubeVideo } from "@/data/youtube-resources";

type Props = {
  title: string;
  message: string;
  query?: string;
  videos: YoutubeVideo[];
  primaryLabel?: string;
  onPrimary?: () => void;
};

export function NotFoundState({
  title,
  message,
  query,
  videos,
  primaryLabel = "Browse Thesis Library",
  onPrimary,
}: Props) {
  const router = useRouter();

  return (
    <View className="pb-8">
      <View className="items-center py-6">
        <View className="w-[64px] h-[64px] rounded-[18px] bg-bg-surface border border-line items-center justify-center mb-4">
          <Icon name="search" size={28} color="#8C988F" sw={1.8} />
        </View>
        <Text
          className="text-ink font-displayX text-[22px] text-center"
          style={{ letterSpacing: -0.4 }}
        >
          {title}
        </Text>
        {query ? (
          <Text className="text-ink-3 font-monoBold text-[13px] mt-2 uppercase">
            {query}
          </Text>
        ) : null}
        <Text className="text-ink-2 text-[14.5px] font-sansMd leading-[21px] text-center mt-3 px-2">
          {message}
        </Text>
      </View>

      <View className="flex-row gap-x-2.5 mb-5">
        <View className="flex-1">
          <Button
            label={primaryLabel}
            fullWidth
            size="md"
            variant="primary"
            onPress={onPrimary ?? (() => router.push("/(tabs)/themes"))}
          />
        </View>
        <View className="flex-1">
          <Button
            label="Open Learn"
            fullWidth
            size="md"
            variant="secondary"
            onPress={() => router.push("/(tabs)/education")}
          />
        </View>
      </View>

      <Card pad={14}>
        <Text className="text-ink font-sansBold text-[15px] mb-1">
          Build literacy first
        </Text>
        <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px]">
          Thesis links to long-form explainers so you understand the idea before picking
          names, not book lists you will never open on mobile.
        </Text>
        <GoDeeperVideos videos={videos} title="Suggested videos" compact />
      </Card>
    </View>
  );
}
