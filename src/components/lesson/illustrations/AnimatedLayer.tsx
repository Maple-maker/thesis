import { useEffect } from "react";
import type { ReactNode } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Props = {
  children: ReactNode;
  /** Vertical bob amplitude (px) */
  bob?: number;
  /** Pulse scale amplitude */
  pulse?: number;
  delayMs?: number;
  durationMs?: number;
};

/** Subtle motion, Robinhood-style “living” graphics without Lottie files. */
export function AnimatedLayer({
  children,
  bob = 0,
  pulse = 0,
  delayMs = 0,
  durationMs = 2200,
}: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1, { duration: durationMs, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: durationMs, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delayMs, durationMs, t]);

  const style = useAnimatedStyle(() => {
    const p = t.value;
    const translateY = bob ? (p - 0.5) * 2 * bob : 0;
    const scale = pulse ? 1 + (p - 0.5) * 2 * pulse : 1;
    return { transform: [{ translateY }, { scale }] };
  });

  return <Animated.View style={style}>{children}</Animated.View>;
}
