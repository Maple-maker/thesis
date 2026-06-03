import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { CourseThumbnail } from "@/components/lesson/CourseThumbnail";
import { Bar } from "@/components/ui/Progress";
import { ListRow } from "@/components/ui/ListRow";
import { courses } from "@/data/courses";
import { courseProgressLabel, courseProgressPercent } from "@/lib/course-progress";
import { courseMasteryPct, masteryLabel } from "@/lib/quiz-mastery";
import { recommendedCourseIds } from "@/lib/course-recommendations";
import { useStore } from "@/store";

export default function CoursesIndex() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const completedLessons = useStore((s) => s.completedLessons);

  const quizScores = useStore((s) => s.quizScores);

  const courseList = useMemo(() => {
    const all = courses();
    const order = recommendedCourseIds(profile);
    return [...all].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }, [profile]);

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70"
          >
            <Icon name="back" size={16} color="#16201C" sw={2} />
          </Pressable>
          <View>
            <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
              Learn
            </Text>
            <Text
              className="text-ink font-displayX text-[28px] mt-0.5"
              style={{ letterSpacing: -0.6, lineHeight: 31 }}
            >
              Courses
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-ink-2 text-[14.5px] font-sansMd leading-[21px] mb-5">
          14 courses with illustrated lessons, minimal visuals, core ideas at your pace.
        </Text>

        <View className="gap-y-2.5">
          {courseList.map((course, idx) => {
            const totalMin = course.lessons.reduce((sum, l) => sum + l.estimatedMin, 0);
            const pct = courseProgressPercent(course, completedLessons);
            const progressLine = courseProgressLabel(course, completedLessons);
            const mPct = courseMasteryPct(course.lessons.map((l) => l.id), quizScores);

            return (
              <View key={course.id}>
                {idx === 0 && pct < 100 && (
                  <Text className="text-brand text-[10px] font-sansX uppercase tracking-widest mb-1.5 ml-1">
                    Recommended for you
                  </Text>
                )}
                <ListRow
                  leading={<CourseThumbnail courseId={course.id} size={48} rounded={12} />}
                  title={course.title}
                  subtitle={`${course.lessons.length} lessons · ~${totalMin} min · ${progressLine}${mPct != null ? ` · ${masteryLabel(mPct)}` : ""}`}
                  onPress={() => router.push(`/courses/${course.id}` as any)}
                />
                {pct > 0 && pct < 100 && (
                  <View className="mt-1.5 mb-1 px-1">
                    <Bar pct={pct / 100} height={4} />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View className="mt-6 mb-4">
          <Text className="text-ink-3 text-[11px] text-center font-sansMd leading-[16px]">
            Educational tool, not investment advice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
