import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { THESIS_BUILDER_CHAPTERS } from "@/data/thesis-builder-chapters";
import { useStore } from "@/store";

const CHAPTER_COUNT = THESIS_BUILDER_CHAPTERS.length;
const QUESTION_COUNT = THESIS_BUILDER_CHAPTERS.reduce((n, s) => n + s.questions.length, 0);

export default function OnboardingIntro() {
  const router = useRouter();
  const setOnboarding = useStore((s) => s.setOnboarding);

  return (
    <Screen padded>
      <View className="flex-1 justify-between pt-6 pb-6" style={{ minHeight: "100%" }}>
        <Animated.View entering={FadeInUp.duration(450)}>
          <View className="flex-row items-center mb-10">
            <LogoMark />
            <Text
              className="text-ink font-displayX ml-2.5 text-[20px]"
              style={{ letterSpacing: -0.5 }}
            >
              thesis
            </Text>
          </View>

          <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest">
            Thesis builder
          </Text>
          <Text
            className="text-ink font-displayX text-[36px] mt-2"
            style={{ letterSpacing: -1, lineHeight: 40 }}
          >
            Your investing frame,{"\n"}
            <Text className="text-brand">built from you.</Text>
          </Text>
          <Text className="text-ink-2 text-[16px] font-sansMd mt-5 leading-[24px]">
            We start with a thorough look at your situation, goals, how you
            behave in markets, and what you care about. That becomes the lens
            for every theme, pick, and duel after.
          </Text>
          <Text className="text-ink-3 text-[13px] font-sansMd mt-3 leading-[19px]">
            {CHAPTER_COUNT} chapters · {QUESTION_COUNT} questions · take your
            time, honest beats optimistic. Tap ? next to any term you do not
            know, education first, conviction second.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(450)}>
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-3">
            What you'll work through
          </Text>
          <View className="gap-y-2.5 mb-6">
            {THESIS_BUILDER_CHAPTERS.map((chapter, i) => (
              <ChapterRow
                key={chapter.id}
                n={String(i + 1)}
                title={chapter.title}
                subtitle={chapter.subtitle}
              />
            ))}
          </View>

          <Button
            label="Make Your Thesis"
            fullWidth
            size="lg"
            onPress={() => {
              setOnboarding("in-progress");
              router.push("/onboarding/step/0");
            }}
          />
          <Text className="text-ink-3 text-[11px] text-center font-sansMd leading-[16px] mt-4 px-6">
            Educational tool, not investment advice. Nothing here is a
            recommendation to buy or sell any security.
          </Text>
        </Animated.View>
      </View>
    </Screen>
  );
}

function ChapterRow({
  n,
  title,
  subtitle,
}: {
  n: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View className="bg-bg-surface border border-line rounded-[14px] px-4 py-3">
      <View className="flex-row items-start">
        <View className="h-8 w-8 rounded-[10px] bg-brand-bg items-center justify-center mr-3 mt-0.5">
          <Text className="text-brand font-sansX">{n}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-ink text-[15px] font-sansSb">{title}</Text>
          <Text className="text-ink-3 text-[12.5px] font-sansMd mt-1 leading-[17px]">
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
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
