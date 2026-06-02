import { useRouter } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CfoScorecard } from "@/components/CfoScorecard";
import { MilitaryResourcesSection } from "@/components/MilitaryResourcesSection";
import { militaryStatusFromProfile } from "@/lib/military-profile";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { THESIS_BUILDER_CHAPTERS } from "@/data/thesis-builder-chapters";
import {
  CFO_SECTION_LABELS,
  type CfoSectionId,
} from "@/types/cfo-profile";
import { useStore } from "@/store";

const ALL_SECTIONS = Object.keys(CFO_SECTION_LABELS) as CfoSectionId[];

export default function ThesisProfileScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const resetOnboarding = useStore((s) => s.resetOnboarding);
  const completed = new Set(profile.meta.completedSections);
  const militaryStatus = militaryStatusFromProfile(profile);
  const showMilitary =
    militaryStatus === "active" ||
    militaryStatus === "veteran" ||
    militaryStatus === "reserve";

  const restartOnboarding = () => {
    Alert.alert(
      "Restart thesis builder?",
      "This clears your questionnaire answers and themes so you can walk through onboarding again from the intro video and chapters.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restart",
          style: "destructive",
          onPress: () => {
            resetOnboarding();
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  const chapterForSection = (sectionId: CfoSectionId) =>
    THESIS_BUILDER_CHAPTERS.find((c) => c.sectionIds.includes(sectionId));

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center px-5 pt-3 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70"
        >
          <Icon name="back" size={16} color="#16201C" sw={2} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
            Thesis builder
          </Text>
          <Text className="text-ink font-displayX text-[26px]" style={{ letterSpacing: -0.5 }}>
            Your CFO profile
          </Text>
        </View>
      </View>

      <View className="flex-1 px-5">
        <CfoScorecard
          derived={profile.derived}
          completedSections={completed.size}
          totalSections={ALL_SECTIONS.length}
        />

        <Text className="text-ink-2 text-[13.5px] font-sansMd leading-[20px] my-4">
          Each section powers personalized research, radar, and analysis, not generic tips.
        </Text>

        {showMilitary && <MilitaryResourcesSection status={militaryStatus} />}

        <View className="mb-4">
          <Button
            label="Restart onboarding from scratch"
            variant="secondary"
            fullWidth
            onPress={restartOnboarding}
          />
          <Text className="text-ink-3 text-[11px] font-sansMd text-center mt-2 leading-[16px] px-2">
            Resets your builder answers and themes, use to demo the mobile flow or retake
            the questionnaire.
          </Text>
        </View>

        <View className="gap-y-2 pb-8">
          {ALL_SECTIONS.map((id) => {
            const meta = CFO_SECTION_LABELS[id];
            const done = completed.has(id);
            const chapter = chapterForSection(id);
            return (
              <Card key={id} pad={14}>
                <View className="flex-row items-start">
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5 ${
                      done ? "bg-pos" : "border-2 border-line-strong"
                    }`}
                  >
                    {done ? <Icon name="check" size={12} sw={2.6} color="#FFFFFF" /> : null}
                  </View>
                  <View className="flex-1">
                    <Text className="text-ink font-sansBold text-[15px]">{meta.title}</Text>
                    <Text className="text-ink-3 text-[12px] font-sansMd mt-1 leading-[17px]">
                      {meta.subtitle}
                    </Text>
                  </View>
                </View>
                {chapter && !done && (
                  <View className="mt-3">
                    <Button
                      label="Add in builder"
                      size="sm"
                      variant="secondary"
                      onPress={() =>
                        router.push(
                          `/onboarding/step/${THESIS_BUILDER_CHAPTERS.indexOf(chapter)}` as `/onboarding/step/0`
                        )
                      }
                    />
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}
