import { Alert, Linking, Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import type { LearningResource } from "@/data/learning-resources";

const PROVIDER_META: Record<
  LearningResource["provider"],
  { label: string; color: string; bg: string }
> = {
  youtube: { label: "YouTube", color: "#C43B3B", bg: "bg-neg/10" },
  khan: { label: "Khan Academy", color: "#0E7A66", bg: "bg-brand-bg" },
  other: { label: "Learn more", color: "#5C6B62", bg: "bg-bg-surface2" },
};

async function openResource(resource: LearningResource) {
  try {
    const can = await Linking.canOpenURL(resource.url);
    if (!can) {
      Alert.alert("Cannot open link", "Try opening this resource in your browser.");
      return;
    }
    await Linking.openURL(resource.url);
  } catch {
    Alert.alert("Cannot open link", resource.url);
  }
}

type Props = {
  resources: LearningResource[];
  title?: string;
};

export function KeepLearningSection({
  resources,
  title = "Keep learning",
}: Props) {
  if (!resources.length) return null;

  return (
    <View className="mt-4 pt-4 border-t border-line">
      <View className="flex-row items-center mb-2.5">
        <View className="w-[26px] h-[26px] rounded-[8px] bg-brand-bg items-center justify-center mr-2">
          <Icon name="play" size={12} color="#0E7A66" sw={2.2} />
        </View>
        <Text className="text-ink text-[12px] font-sansX uppercase tracking-wider">
          {title}
        </Text>
      </View>
      <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px] mb-3">
        Go deeper with trusted videos, opens in YouTube or your browser.
      </Text>
      <View className="gap-y-2">
        {resources.map((r) => {
          const meta = PROVIDER_META[r.provider];
          return (
            <Pressable
              key={r.id}
              onPress={() => openResource(r)}
              className="flex-row items-start px-3 py-3 rounded-card bg-bg-surface border border-line active:opacity-70"
            >
              <View
                className={`w-[40px] h-[40px] rounded-[10px] items-center justify-center mr-3 ${meta.bg}`}
              >
                <Icon
                  name={r.provider === "youtube" ? "play" : "cap"}
                  size={16}
                  color={meta.color}
                  sw={2.2}
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-0.5">
                  <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mr-2">
                    {meta.label}
                  </Text>
                  {r.duration ? (
                    <Text className="text-ink-3 text-[10px] font-sansMd">{r.duration}</Text>
                  ) : null}
                </View>
                <Text className="text-ink text-[13.5px] font-sansSb leading-[18px]">
                  {r.title}
                </Text>
                <Text className="text-ink-3 text-[11.5px] font-sansMd mt-0.5">{r.channel}</Text>
              </View>
              <Icon name="arrow" size={14} color="#8C988F" sw={2} />
            </Pressable>
          );
        })}
      </View>
      <Text className="text-ink-3 text-[10.5px] font-sansMd mt-2 leading-[15px]">
        Third-party content, not affiliated with Thesis. Educational only.
      </Text>
    </View>
  );
}
