import { useEffect } from "react";
import { View, type DimensionValue, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type Props = {
  width?: DimensionValue;
  height?: number;
  rounded?: number;
  className?: string;
  style?: ViewStyle;
};

export function Skeleton({ width = "100%", height = 14, rounded = 8, className, style }: Props) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.85, { duration: 900 }), -1, true);
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ width, height, borderRadius: rounded }, animStyle, style]}>
      <View className={`bg-track flex-1 ${className ?? ""}`} style={{ borderRadius: rounded }} />
    </Animated.View>
  );
}

export function SkeletonCard() {
  return (
    <View className="bg-bg-surface border border-line rounded-[14px] p-4 gap-2">
      <Skeleton height={12} width="40%" />
      <Skeleton height={16} width="85%" />
      <Skeleton height={12} width="70%" />
    </View>
  );
}
