import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";

type BadgeTone = "brand" | "pos" | "amber";

const BADGE_CLASS: Record<BadgeTone, { bg: string; text: string }> = {
  brand: { bg: "bg-brand-bg", text: "text-brand" },
  pos: { bg: "bg-pos-bg", text: "text-pos-ink" },
  amber: { bg: "bg-amber-bg", text: "text-amber" },
};

type Props = {
  leading: ReactNode;
  badge?: { text: string; tone?: BadgeTone };
  title: string;
  subtitle?: string;
  onPress: () => void;
};

/** Minimal list row — used on Themes tab, concept list, etc. */
export function ListRow({ leading, badge, title, subtitle, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-bg-surface border border-line rounded-[14px] px-4 py-3.5 active:opacity-70"
    >
      {leading}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center gap-x-2">
          <Text
            className="text-ink font-displayX text-[16px] flex-shrink"
            style={{ letterSpacing: -0.2 }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {badge && (
            <View className={`px-2 py-0.5 rounded-[7px] ${BADGE_CLASS[badge.tone ?? "brand"].bg}`}>
              <Text className={`text-[10px] font-sansX uppercase tracking-wider ${BADGE_CLASS[badge.tone ?? "brand"].text}`}>
                {badge.text}
              </Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text className="text-ink-3 text-[12.5px] font-sansMd mt-0.5 leading-[17px]" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      <Icon name="chev" size={16} color="#8C988F" sw={2} />
    </Pressable>
  );
}
