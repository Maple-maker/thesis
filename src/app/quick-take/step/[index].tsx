import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { IconBtn } from "@/components/ui/IconBtn";
import { Bar } from "@/components/ui/Progress";
import { Screen } from "@/components/ui/Screen";
import { QUICK_TAKE_STEPS } from "@/data/quick-take-questions";
import type { UserProfile } from "@/store/types";
import { useStore } from "@/store";

/** Quick Take step renderer — choice questions only, one per screen. */
export default function QuickTakeStep() {
  const router = useRouter();
  const params = useLocalSearchParams<{ index: string }>();
  const idx = Math.max(
    0,
    Math.min(QUICK_TAKE_STEPS.length - 1, parseInt(params.index ?? "0", 10) || 0)
  );
  const step = QUICK_TAKE_STEPS[idx]!;
  const question = step.questions[0]!;

  const profile = useStore((s) => s.profile);
  const setProfileField = useStore((s) => s.setProfileField);

  const value = profile[question.id as keyof UserProfile];
  const isLast = idx === QUICK_TAKE_STEPS.length - 1;

  const onNext = () => {
    if (isLast) {
      router.push("/quick-take/result");
      return;
    }
    router.push(`/quick-take/step/${idx + 1}`);
  };

  return (
    <Screen padded>
      <View className="flex-row items-center justify-between pt-1 pb-4">
        <IconBtn name="back" onPress={() => router.back()} sw={2.2} />
        <Text className="text-ink-2 text-[13px] font-sansBold">
          {idx + 1} of {QUICK_TAKE_STEPS.length}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <Bar pct={(idx + 1) / QUICK_TAKE_STEPS.length} color="brand" height={5} />

      <View className="mt-7 mb-5">
        <Text
          className="text-ink text-[28px] font-displayX"
          style={{ letterSpacing: -0.6, lineHeight: 32 }}
        >
          {step.title}
        </Text>
        {step.subtitle ? (
          <Text className="text-ink-2 text-[15px] font-sansMd mt-2 leading-[22px]">
            {step.subtitle}
          </Text>
        ) : null}
      </View>

      {question.kind === "choice" && (
        <View className="gap-y-2.5">
          {question.options.map((opt, i) => {
            const on = value === opt.value;
            return (
              <Animated.View
                key={String(opt.value)}
                entering={FadeInDown.delay(60 + i * 50).duration(300)}
              >
                <Pressable
                  onPress={() =>
                    setProfileField(
                      question.id as keyof UserProfile,
                      opt.value as never
                    )
                  }
                  className={`px-4 py-3.5 rounded-[14px] border ${
                    on ? "bg-brand-bg border-brand" : "bg-bg-surface border-line"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`text-[15px] flex-1 pr-3 ${
                        on ? "text-ink font-sansBold" : "text-ink font-sansSb"
                      }`}
                    >
                      {opt.label}
                    </Text>
                    <View
                      className={`h-6 w-6 rounded-full items-center justify-center border-2 ${
                        on ? "bg-brand border-brand" : "border-line-strong"
                      }`}
                    >
                      {on ? (
                        <Icon name="check" size={14} sw={2.6} color="#FFFFFF" />
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      )}

      <View className="mt-10 mb-2">
        <Button
          label={isLast ? "See my thesis" : "Continue"}
          fullWidth
          size="lg"
          disabled={value === undefined || value === null}
          onPress={onNext}
        />
      </View>
    </Screen>
  );
}
