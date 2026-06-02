import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { builderGapsForProfile } from "@/lib/builder-gaps";
import type { CfoProfile } from "@/types/cfo-profile";
import type { ThemeId } from "@/store/types";

type Props = {
  profile: CfoProfile;
  themeIds: ThemeId[];
  hasModel: boolean;
};

export function BuilderGapCards({ profile, themeIds, hasModel }: Props) {
  const router = useRouter();
  const gaps = builderGapsForProfile(profile, themeIds, hasModel);
  if (!gaps.length) return null;

  return (
    <View className="mb-5">
      <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2 px-1">
        Fix first
      </Text>
      <View className="gap-2">
        {gaps.map((g) => (
          <Pressable key={g.id} onPress={() => router.push(g.route as never)} className="active:opacity-85">
            <Card pad={14} className="border-amber/25 bg-amber-bg/20">
              <View className="flex-row items-start">
                <View className="w-8 h-8 rounded-[10px] bg-amber-bg items-center justify-center mr-3">
                  <Icon name="shield" size={16} color="#D98512" sw={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-ink font-sansBold text-[14px]">{g.title}</Text>
                  <Text className="text-ink-2 text-[12px] font-sansMd mt-1 leading-[17px]">
                    {g.body}
                  </Text>
                  <Text className="text-brand text-[12px] font-sansBold mt-2">{g.cta} →</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
