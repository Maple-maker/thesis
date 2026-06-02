import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import type { YoutubeVideo } from "@/data/youtube-resources";
import { openYoutubeVideo } from "@/lib/youtube";

type Props = {
  videos: YoutubeVideo[];
  title?: string;
  compact?: boolean;
};

export function GoDeeperVideos({ videos, title = "Watch on YouTube", compact }: Props) {
  if (!videos.length) return null;

  return (
    <View className={compact ? "mt-3" : "mt-4"}>
      <View className="flex-row items-center mb-2.5">
        <View className="w-[26px] h-[26px] rounded-[8px] bg-neg/10 items-center justify-center mr-2">
          <Icon name="play" size={12} color="#C43B3B" sw={2.2} />
        </View>
        <Text className="text-ink text-[12px] font-sansX uppercase tracking-wider">
          {title}
        </Text>
      </View>
      <View className="gap-y-2">
        {videos.map((v) => (
          <Pressable
            key={v.videoId}
            onPress={() => openYoutubeVideo(v)}
            className="flex-row items-start px-3 py-3 rounded-card bg-bg-surface border border-line active:opacity-70"
          >
            <View className="w-[40px] h-[40px] rounded-[10px] bg-neg/10 items-center justify-center mr-3">
              <Icon name="play" size={16} color="#C43B3B" sw={2.2} />
            </View>
            <View className="flex-1">
              <Text className="text-ink text-[13.5px] font-sansSb leading-[18px]">
                {v.title}
              </Text>
              <Text className="text-ink-3 text-[11.5px] font-sansMd mt-0.5">
                {v.channel}
                {v.duration ? ` · ${v.duration}` : ""}
              </Text>
            </View>
            <Icon name="arrow" size={14} color="#8C988F" sw={2} />
          </Pressable>
        ))}
      </View>
      <Text className="text-ink-3 text-[10.5px] font-sansMd mt-2 leading-[15px]">
        Opens in YouTube. Third-party content, not affiliated with Thesis.
      </Text>
    </View>
  );
}
