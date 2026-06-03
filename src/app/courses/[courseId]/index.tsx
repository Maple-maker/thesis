import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { CourseThumbnail } from "@/components/lesson/CourseThumbnail";
import { Card } from "@/components/ui/Card";
import { Bar } from "@/components/ui/Progress";
import { courseById, lessonsForCourse, type CourseId, type Lesson } from "@/data/courses";
import { COURSE_DEFAULT_IMAGE } from "@/data/lesson-images";
import { courseProgressPercent } from "@/lib/course-progress";
import { courseMasteryPct, masteryLabel } from "@/lib/quiz-mastery";
import { imageKeyForStep } from "@/lib/lesson-visuals";
import { useStore } from "@/store";

function lessonThumbKey(lesson: Lesson, courseId: CourseId) {
  const first = lesson.steps.find((s) => s.kind === "content");
  return first ? imageKeyForStep(first, courseId) : COURSE_DEFAULT_IMAGE[courseId];
}

function LessonRow({
  courseId,
  lesson,
  complete,
  quizPct,
  onPress,
}: {
  courseId: CourseId;
  lesson: Lesson;
  complete: boolean;
  quizPct: number | null;
  onPress: () => void;
}) {
  const thumbKey = useMemo(() => lessonThumbKey(lesson, courseId), [lesson, courseId]);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-bg-surface border border-line rounded-[14px] px-4 py-3.5 active:opacity-70"
    >
      <View className="mr-3 relative">
        <CourseThumbnail courseId={courseId} imageKey={thumbKey} size={44} rounded={10} />
        <View
          className={`absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full items-center justify-center border border-line ${
            complete ? "bg-brand" : "bg-bg-surface"
          }`}
        >
          {complete ? (
            <Icon name="check" size={10} color="#FFFFFF" sw={2.5} />
          ) : (
            <Text className="text-ink-2 text-[9px] font-monoSb">{lesson.order}</Text>
          )}
        </View>
      </View>

      <View className="flex-1">
        <Text className="text-ink text-[14.5px] font-sansBold leading-[19px]">
          {lesson.title}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-ink-3 text-[12px] font-sansMd mt-0.5">
            {lesson.estimatedMin} min · {lesson.steps.length} steps
          </Text>
          {quizPct != null && (
            <Text
              className={`text-[11px] font-sansBold mt-0.5 ${
                quizPct >= 90 ? "text-pos" : quizPct >= 50 ? "text-amber" : "text-ink-3"
              }`}
            >
              · {quizPct}%
            </Text>
          )}
        </View>
      </View>

      <Icon name="chev" size={16} color="#8C988F" sw={2} />
    </Pressable>
  );
}

export default function CourseSyllabus() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: CourseId }>();

  const completedLessons = useStore((s) => s.completedLessons);
  const isComplete = useStore((s) => s.isLessonComplete);
  const quizScores = useStore((s) => s.quizScores);

  const course = courseId ? courseById(courseId) : undefined;
  const lessons = courseId ? lessonsForCourse(courseId) : [];
  const progressPct = course ? courseProgressPercent(course, completedLessons) : 0;
  const courseQuizPct = course ? courseMasteryPct(lessons.map((l) => l.id), quizScores) : null;

  if (!course) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-ink-2 text-[15px] font-sansMd">Course not found.</Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-4 px-5 py-3 rounded-[14px] bg-brand active:opacity-70"
          >
            <Text className="text-white font-sansX text-[14px]">Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          <View className="flex-1">
            <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
              {course.lessons.length} lessons
            </Text>
            <Text
              className="text-ink font-displayX text-[28px] mt-0.5"
              style={{ letterSpacing: -0.6, lineHeight: 31 }}
            >
              {course.title}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <Card pad={0} className="mb-5 overflow-hidden">
          <View className="py-3 bg-bg-surface2 border-b border-line">
            <CourseThumbnail courseId={course.id} fullBleed />
          </View>
          <View className="px-4 pt-4 pb-4">
            {(progressPct > 0 || courseQuizPct != null) && (
              <View className="mb-3">
                <View className="flex-row justify-between mb-1.5">
                  <Text className="text-ink-3 text-[11px] font-sansMd">
                    {progressPct === 100 ? "Completed" : "Your progress"}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    {courseQuizPct != null && (
                      <Text className={`text-[10px] font-sansBold ${courseQuizPct >= 90 ? "text-pos" : "text-ink-3"}`}>
                        {masteryLabel(courseQuizPct)}
                      </Text>
                    )}
                    <Text className="text-brand text-[11px] font-sansBold">{progressPct}%</Text>
                  </View>
                </View>
                <Bar pct={progressPct / 100} height={6} />
              </View>
            )}
            <Text className="text-ink-2 text-[13.5px] font-sansMd leading-[20px]">
              {course.description}
            </Text>
            {course.courseMetaphor && (
              <View className="mt-3 px-3 py-2.5 rounded-[10px] bg-bg-surface2">
                <Text className="text-ink-2 text-[12.5px] font-sansMd leading-[18px] italic">
                  {course.courseMetaphor}
                </Text>
              </View>
            )}
          </View>
        </Card>

        <Text className="text-ink text-[16px] font-displayX mb-3" style={{ letterSpacing: -0.2 }}>
          Lessons
        </Text>

        <View className="gap-y-2">
          {lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              courseId={course.id}
              lesson={lesson}
              complete={isComplete(lesson.id)}
              quizPct={quizScores[lesson.id] ? Math.round((quizScores[lesson.id].correctAnswers / quizScores[lesson.id].totalQuestions) * 100) : null}
              onPress={() => router.push(`/courses/${course.id}/${lesson.id}` as any)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
