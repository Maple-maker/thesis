import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { KeepLearningSection } from "@/components/KeepLearningSection";
import { ExplainSheet } from "@/components/ExplainSheet";
import { Icon } from "@/components/Icon";
import { MilestoneCelebration } from "@/components/engagement/MilestoneCelebration";
import { LessonPlayerLayout } from "@/components/lesson/LessonPlayerLayout";
import { LessonSlideVisual } from "@/components/lesson/LessonSlideVisual";
import { conceptById, type ConceptId } from "@/data/concepts";
import {
  courseById,
  lessonById,
  type CourseId,
  type LessonStep,
} from "@/data/courses";
import { COURSE_ICON_BG, COURSE_ICON_COLOR, COURSE_ICONS } from "@/lib/course-meta";
import { keepLearningForLesson } from "@/lib/lesson-keep-learning";
import { visualForStep } from "@/lib/lesson-visuals";
import { useMilestoneCheck } from "@/lib/use-milestone-check";
import { useStore } from "@/store";

export default function LessonPlayer() {
  const router = useRouter();
  const { courseId, lessonId } = useLocalSearchParams<{
    courseId: CourseId;
    lessonId: string;
  }>();

  const profile = useStore((s) => s.profile);
  const markComplete = useStore((s) => s.markLessonComplete);
  const recordQuizAnswer = useStore((s) => s.recordQuizAnswer);
  const trackActiveToday = useStore((s) => s.trackActiveToday);
  const { check, currentMilestone, dismissCurrent } = useMilestoneCheck();

  const course = courseId ? courseById(courseId) : undefined;
  const lesson = lessonId ? lessonById(lessonId) : undefined;

  const [screenIndex, setScreenIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [explainId, setExplainId] = useState<ConceptId | null>(null);

  const steps = lesson?.steps ?? [];
  const totalScreens = steps.length + 1;
  const onTakeaways = screenIndex >= steps.length;
  const currentStep: LessonStep | undefined = !onTakeaways ? steps[screenIndex] : undefined;

  // Track quiz results across the whole lesson
  const quizResults = useRef<{ total: number; correct: number }>({ total: 0, correct: 0 });
  const handleQuizAnswer = useCallback((idx: number, correctIndex: number) => {
    setQuizSelected(idx);
    setQuizAnswered(true);
    quizResults.current.total += 1;
    if (idx === correctIndex) {
      quizResults.current.correct += 1;
    }
  }, []);

  const keepLearning = useMemo(
    () => (lesson ? keepLearningForLesson(lesson) : []),
    [lesson]
  );

  const visual = useMemo(() => {
    if (!course) return null;
    const icon = COURSE_ICONS[course.id];
    const color = COURSE_ICON_COLOR[course.id];
    const bg = COURSE_ICON_BG[course.id];

    if (onTakeaways) {
      return (
        <View className={`flex-1 items-center justify-center ${bg} py-8`}>
          <Icon name="check" size={64} color={color} sw={1.5} />
          <Text className="text-ink-2 text-[13px] font-sansMd mt-3 px-6 text-center">
            Lesson complete, keep exploring below
          </Text>
        </View>
      );
    }

    if (currentStep) {
      const img = visualForStep(currentStep, course.id);
      return (
        <LessonSlideVisual
          image={img}
          iconName={icon}
          iconColor={color}
          iconBgClass={bg}
          caption={currentStep.kind === "content" ? currentStep.title : "Knowledge check"}
        />
      );
    }

    return null;
  }, [course, currentStep, onTakeaways, screenIndex]);

  if (!course || !lesson || lesson.courseId !== course.id) {
    return (
      <View className="flex-1 bg-bg items-center justify-center px-5">
        <Text className="text-ink-2 text-[15px] font-sansMd">Lesson not found.</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 px-5 py-3 rounded-[14px] bg-brand active:opacity-70"
        >
          <Text className="text-white font-sansX text-[14px]">Go back</Text>
        </Pressable>
      </View>
    );
  }

  const exitToSyllabus = () => {
    router.replace(`/courses/${course.id}` as any);
  };

  const advance = () => {
    if (onTakeaways) {
      markComplete(lesson.id);
      if (quizResults.current.total > 0) {
        recordQuizAnswer(lesson.id, quizResults.current.total, quizResults.current.correct);
      }
      trackActiveToday();
      check();
      exitToSyllabus();
      return;
    }
    if (screenIndex < steps.length) {
      setScreenIndex((i) => i + 1);
      setQuizSelected(null);
      setQuizAnswered(false);
    }
  };

  const continueDisabled =
    !onTakeaways && currentStep?.kind === "quiz" && !quizAnswered;

  return (
    <>
      <LessonPlayerLayout
        totalScreens={totalScreens}
        screenIndex={screenIndex}
        estimatedMin={lesson.estimatedMin}
        showTimePill={screenIndex === 0 && !onTakeaways}
        visual={visual}
        onClose={exitToSyllabus}
        onContinue={advance}
        continueLabel={onTakeaways ? "Mark complete & finish" : "Continue"}
        continueDisabled={continueDisabled}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
          {onTakeaways ? (
            <TakeawaysView
              title={lesson.title}
              takeaways={lesson.keyTakeaways}
              keepLearning={keepLearning}
            />
          ) : currentStep?.kind === "content" ? (
            <ContentStepView
              step={currentStep}
              lessonTitle={lesson.title}
              isIntro={screenIndex === 0}
              profile={profile}
              onConceptPress={setExplainId}
            />
          ) : currentStep?.kind === "quiz" ? (
            <QuizStepView
              step={currentStep}
              selected={quizSelected}
              answered={quizAnswered}
              onSelect={(idx) => handleQuizAnswer(idx, currentStep.correctIndex)}
            />
          ) : null}
        </ScrollView>
      </LessonPlayerLayout>

      <ExplainSheet
        conceptId={explainId}
        visible={explainId != null}
        onClose={() => setExplainId(null)}
        onSelectRelated={setExplainId}
      />

      {currentMilestone && (
        <MilestoneCelebration milestone={currentMilestone} onDismiss={dismissCurrent} />
      )}
    </>
  );
}

function ContentStepView({
  step,
  lessonTitle,
  isIntro,
  profile,
  onConceptPress,
}: {
  step: Extract<LessonStep, { kind: "content" }>;
  lessonTitle: string;
  isIntro: boolean;
  profile: ReturnType<typeof useStore.getState>["profile"];
  onConceptPress: (id: ConceptId) => void;
}) {
  const aside = step.profileAside?.(profile) ?? null;

  return (
    <>
      {isIntro && (
        <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-1">
          {lessonTitle}
        </Text>
      )}
      <Text
        className="text-ink font-displayX text-[24px] mb-3"
        style={{ letterSpacing: -0.4, lineHeight: 28 }}
      >
        {step.title}
      </Text>
      {step.paragraphs.map((p, i) => (
        <Text key={i} className="text-ink-2 text-[15px] font-sansMd leading-[23px] mb-3">
          {p}
        </Text>
      ))}
      {step.didYouKnow && (
        <View className="mb-3 px-3.5 py-3 rounded-[12px] bg-bg-surface2 border border-line">
          <Text className="text-ink-3 text-[10px] font-sansX uppercase tracking-wider mb-1">
            Did you know?
          </Text>
          <Text className="text-ink-2 text-[13.5px] font-sansMd leading-[20px]">{step.didYouKnow}</Text>
        </View>
      )}
      {aside && (
        <View className="mb-3 px-3.5 py-3 rounded-[12px] bg-brand-bg border border-brand/20">
          <Text className="text-brand text-[10px] font-sansX uppercase tracking-wider mb-1">
            For your profile
          </Text>
          <Text className="text-ink text-[13.5px] font-sansMd leading-[20px]">{aside}</Text>
        </View>
      )}
      {step.conceptLinks && step.conceptLinks.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-1">
          {step.conceptLinks.map((id) => {
            const c = conceptById(id);
            if (!c) return null;
            return (
              <Pressable
                key={id}
                onPress={() => onConceptPress(id)}
                className="px-3 py-1.5 rounded-full bg-brand-bg border border-brand/25 active:opacity-70"
              >
                <Text className="text-brand text-[12px] font-sansBold">{c.term}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </>
  );
}

function QuizStepView({
  step,
  selected,
  answered,
  onSelect,
}: {
  step: Extract<LessonStep, { kind: "quiz" }>;
  selected: number | null;
  answered: boolean;
  onSelect: (idx: number) => void;
}) {
  const correct = selected === step.correctIndex;

  return (
    <>
      <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-2">
        Check your understanding
      </Text>
      <Text
        className="text-ink font-displayX text-[22px] mb-4"
        style={{ letterSpacing: -0.3, lineHeight: 26 }}
      >
        {step.question}
      </Text>
      <View className="gap-y-2 mb-4">
        {step.options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = answered && i === step.correctIndex;
          const showWrong = answered && isSelected && !correct;
          return (
            <Pressable
              key={i}
              onPress={() => !answered && onSelect(i)}
              disabled={answered}
              className={`px-4 py-3.5 rounded-[14px] border active:opacity-80 ${
                showCorrect
                  ? "bg-brand-bg border-brand"
                  : showWrong
                    ? "bg-neg-bg border-neg"
                    : isSelected
                      ? "bg-bg-surface2 border-ink-3"
                      : "bg-bg-surface border-line"
              }`}
            >
              <Text
                className={`text-[14.5px] font-sansBold ${
                  showCorrect ? "text-brand" : showWrong ? "text-neg" : "text-ink"
                }`}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {answered && selected != null && (
        <View
          className={`px-3.5 py-3 rounded-[12px] ${correct ? "bg-brand-bg" : "bg-amber-bg"}`}
        >
          <Text className={`text-[14px] font-sansMd leading-[21px] ${correct ? "text-brand" : "text-amber"}`}>
            {correct ? step.correctFeedback : step.incorrectFeedback}
          </Text>
        </View>
      )}
    </>
  );
}

function TakeawaysView({
  title,
  takeaways,
  keepLearning,
}: {
  title: string;
  takeaways: string[];
  keepLearning: ReturnType<typeof keepLearningForLesson>;
}) {
  return (
    <>
      <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest mb-1">
        Key takeaways
      </Text>
      <Text
        className="text-ink font-displayX text-[24px] mb-4"
        style={{ letterSpacing: -0.4, lineHeight: 28 }}
      >
        {title}
      </Text>
      <Text className="text-ink-2 text-[14px] font-sansMd mb-3">
        At the end of this lesson, remember:
      </Text>
      {takeaways.map((t, i) => (
        <View key={i} className="flex-row mb-3">
          <View className="w-[22px] h-[22px] rounded-full bg-brand items-center justify-center mr-2.5 mt-0.5">
            <Icon name="check" size={12} color="#FFFFFF" sw={2.5} />
          </View>
          <Text className="flex-1 text-ink text-[14.5px] font-sansMd leading-[21px]">{t}</Text>
        </View>
      ))}
      <KeepLearningSection resources={keepLearning} />
    </>
  );
}
