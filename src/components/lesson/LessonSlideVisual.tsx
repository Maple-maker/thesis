import { useWindowDimensions } from "react-native";
import { Text, View } from "react-native";

import { Icon, type IconName } from "@/components/Icon";
import { IllustrationScene } from "@/components/lesson/illustrations/IllustrationScene";
import type { LessonImage } from "@/data/lesson-images";

type Props = {
  image: LessonImage;
  iconName?: IconName;
  iconColor?: string;
  iconBgClass?: string;
  caption?: string;
};

const ART_HEIGHT = 156;

export function LessonSlideVisual({
  image,
  iconName = "book",
  iconColor = "#0E7A66",
  iconBgClass = "bg-brand-bg",
  caption,
}: Props) {
  const { width: screenW } = useWindowDimensions();
  const artWidth = Math.max(260, Math.min((screenW || 360) - 48, 340));

  return (
    <View style={{ height: 200, backgroundColor: "#F7F9F5" }}>
      <View
        style={{
          height: ART_HEIGHT,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F7F9F5",
        }}
      >
        <IllustrationScene
          variant={image.key}
          width={artWidth}
          height={ART_HEIGHT}
          animate
        />
      </View>
      <View className="px-3 py-2.5 flex-row items-center border-t border-line bg-bg-surface">
        <View className={`w-[28px] h-[28px] rounded-[8px] items-center justify-center mr-2 ${iconBgClass}`}>
          <Icon name={iconName} size={14} color={iconColor} sw={2} />
        </View>
        <Text className="flex-1 text-ink-2 text-[11px] font-sansMd" numberOfLines={2}>
          {caption ?? image.alt}
        </Text>
      </View>
    </View>
  );
}
