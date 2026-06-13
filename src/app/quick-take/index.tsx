import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";

/** Pre-signup entry — one screen, one promise, one button. */
export default function QuickTakeIntro() {
  const router = useRouter();

  return (
    <Screen padded scroll={false}>
      <View className="flex-1 justify-between pt-6 pb-6">
        <Animated.View entering={FadeInUp.duration(450)}>
          <View className="flex-row items-center mb-12">
            <LogoMark />
            <Text
              className="text-ink font-displayX ml-2.5 text-[20px]"
              style={{ letterSpacing: -0.5 }}
            >
              thesis
            </Text>
          </View>

          <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest">
            Quick take
          </Text>
          <Text
            className="text-ink font-displayX text-[40px] mt-2"
            style={{ letterSpacing: -1, lineHeight: 44 }}
          >
            Your investing lens,{"\n"}
            <Text className="text-brand">in 2 minutes.</Text>
          </Text>
          <Text className="text-ink-2 text-[16px] font-sansMd mt-5 leading-[24px]">
            5 questions. A theme that fits. No account needed.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(450)}>
          <Button
            label="Begin →"
            fullWidth
            size="lg"
            onPress={() => router.push("/quick-take/step/0")}
          />
          <Pressable
            onPress={() => router.push("/onboarding")}
            className="items-center mt-4 active:opacity-70"
          >
            <Text className="text-ink-3 text-[13px] font-sansMd">
              Prefer the full thesis builder? Start there →
            </Text>
          </Pressable>
          <Text className="text-ink-3 text-[11px] text-center font-sansMd leading-[16px] mt-5 px-6">
            Not investment advice. Educational tool.
          </Text>
        </Animated.View>
      </View>
    </Screen>
  );
}

function LogoMark() {
  return (
    <LinearGradient
      colors={["#0E7A66", "#06483C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path
          d="M5 18c5-1.5 7.5-7.8 11-15 2.5 6.5 5 10 8 9"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={16.5} cy={3} r={2.5} fill="#FFFFFF" />
      </Svg>
    </LinearGradient>
  );
}
