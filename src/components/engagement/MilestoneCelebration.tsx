import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import type { Milestone } from "@/lib/milestones";

function Sparkle({ delay, color }: { delay: number; color: string }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const seq = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 600, delay: 800, useNativeDriver: true }),
    ]);
    seq.start();
  }, [delay, opacity]);

  const size = 6 + Math.random() * 8;
  const x = Math.random() * 260 - 130;
  const y = Math.random() * 260 - 130;

  return (
    <Animated.View
      style={{
        position: "absolute",
        opacity,
        transform: [{ translateX: x }, { translateY: y }],
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </Animated.View>
  );
}

export function MilestoneCelebration({
  milestone,
  onDismiss,
}: {
  milestone: Milestone;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0.3)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [scale, fadeIn]);

  const sparkleColors = ["#0E7A66", "#D98512", "#7C3AED", "#3B82F6", "#D32F2F"];

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onDismiss}>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <Animated.View
          style={{
            transform: [{ scale }],
            opacity: fadeIn,
            width: "100%",
            maxWidth: 320,
          }}
          className="bg-bg-surface rounded-[24px] items-center px-6 pt-10 pb-6"
        >
          <View className="items-center justify-center mb-2 relative">
            {sparkleColors.map((c, i) => (
              <Sparkle key={i} delay={i * 120} color={c} />
            ))}
            <View className="w-[72px] h-[72px] rounded-[20px] bg-brand-bg items-center justify-center">
              <Icon name={milestone.icon} size={34} color="#0E7A66" sw={2} />
            </View>
          </View>

          <Text
            className="text-ink font-displayX text-[24px] mt-4 text-center"
            style={{ letterSpacing: -0.4, lineHeight: 28 }}
          >
            {milestone.title}
          </Text>

          <Text className="text-ink-2 text-[14px] font-sansMd leading-[21px] mt-2 text-center px-2">
            {milestone.description}
          </Text>

          <View className="mt-6 w-full" style={{ paddingBottom: insets.bottom }}>
            <Button label="Nice!" fullWidth size="md" variant="primary" onPress={onDismiss} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
