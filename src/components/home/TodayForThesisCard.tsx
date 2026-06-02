import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { pickTodayForThesis } from "@/lib/today-for-thesis";
import type { ModelThesis } from "@/store/index";
import type { CfoProfile } from "@/types/cfo-profile";
import type { ThemeId } from "@/store/types";

const KIND_ICON: Record<string, IconName> = {
  lesson: "cap",
  duel: "compare",
  scenario: "shield",
  "radar-revisit": "bell",
  builder: "sparkle",
  watchlist: "search",
  pie: "grid",
  "thesis-model": "sparkle",
};

type Props = {
  profile: CfoProfile;
  themeIds: ThemeId[];
  watchlist: string[];
  modelThesis: ModelThesis | null;
  completedLessons: string[];
  journalCount: number;
};

export function TodayForThesisCard({
  profile,
  themeIds,
  watchlist,
  modelThesis,
  completedLessons,
  journalCount,
}: Props) {
  const router = useRouter();
  const action = pickTodayForThesis({
    profile,
    themeIds,
    watchlist,
    modelThesis,
    completedLessons,
    journalCount,
  });
  if (!action) return null;

  const icon = KIND_ICON[action.kind] ?? "sparkle";

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: action.route as never,
          params: action.params,
        })
      }
      className="mb-4 active:opacity-90"
    >
      <Card pad={16} className="border-brand/30 bg-brand-bg/20">
        <Text className="text-brand text-[10px] font-sansX uppercase tracking-widest mb-1">
          Today for your thesis
        </Text>
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-[12px] bg-brand items-center justify-center mr-3">
            <Icon name={icon} size={18} color="#FFFFFF" sw={2} />
          </View>
          <View className="flex-1">
            <Text className="text-ink font-sansBold text-[15px]">{action.title}</Text>
            <Text className="text-ink-2 text-[12px] font-sansMd mt-0.5 leading-[17px]">
              {action.subtitle}
            </Text>
          </View>
          <Icon name="chev" size={16} color="#0E7A66" sw={2} />
        </View>
      </Card>
    </Pressable>
  );
}
