import { useCallback, useMemo, useState } from "react";

import { courses } from "@/data/courses";
import { checkMilestones, milestoneById, type Milestone, type MilestoneId } from "@/lib/milestones";
import { computeAllStreaks } from "@/lib/streaks";
import { useStore } from "@/store";

export function useMilestoneCheck() {
  const journal = useStore((s) => s.journal);
  const completedLessons = useStore((s) => s.completedLessons);
  const lessonCompletionDates = useStore((s) => s.lessonCompletionDates);
  const lastActiveDate = useStore((s) => s.lastActiveDate);
  const modelThesis = useStore((s) => s.modelThesis);
  const quizScores = useStore((s) => s.quizScores);
  const celebrated = useStore((s) => s.celebratedMilestones);
  const celebrateMilestone = useStore((s) => s.celebrateMilestone);

  const { combined } = useMemo(
    () => computeAllStreaks(lastActiveDate, lessonCompletionDates, journal),
    [lastActiveDate, lessonCompletionDates, journal]
  );

  const perfectLessonIds = useMemo(
    () =>
      Object.entries(quizScores)
        .filter(([, r]) => r.totalQuestions > 0 && r.correctAnswers === r.totalQuestions)
        .map(([id]) => id),
    [quizScores]
  );

  const allCourses = useMemo(() => courses(), []);
  const coursesCompletedCount = useMemo(
    () => allCourses.filter((c) => c.lessons.every((l) => completedLessons.includes(l.id))).length,
    [allCourses, completedLessons]
  );
  const coursesStartedCount = useMemo(
    () => allCourses.filter((c) => c.lessons.some((l) => completedLessons.includes(l.id))).length,
    [allCourses, completedLessons]
  );

  const args = useMemo(
    () => ({
      journalCount: journal.length,
      completedLessons,
      hasModelThesis: !!modelThesis?.holdings.length,
      combinedStreak: combined.current,
      perfectLessonIds,
      coursesStartedCount,
      coursesCompletedCount,
      celebrated,
    }),
    [
      journal.length,
      completedLessons,
      modelThesis,
      combined.current,
      perfectLessonIds,
      coursesStartedCount,
      coursesCompletedCount,
      celebrated,
    ]
  );

  const [pendingQueue, setPendingQueue] = useState<MilestoneId[]>([]);

  const check = useCallback((): MilestoneId[] => {
    const newIds = checkMilestones(args);
    for (const id of newIds) {
      celebrateMilestone(id);
    }
    if (newIds.length > 0) {
      setPendingQueue((prev) => [...prev, ...newIds]);
    }
    return newIds;
  }, [args, celebrateMilestone]);

  const currentMilestone: Milestone | null = useMemo(() => {
    if (pendingQueue.length === 0) return null;
    const m = milestoneById(pendingQueue[0]);
    return m ?? null;
  }, [pendingQueue]);

  const dismissCurrent = useCallback(() => {
    setPendingQueue((prev) => prev.slice(1));
  }, []);

  return { check, currentMilestone, dismissCurrent, hasPending: pendingQueue.length > 0 };
}
