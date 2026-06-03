export type LessonQuizRecord = {
  lessonId: string;
  totalQuestions: number;
  correctAnswers: number;
  lastAttemptAt: number;
};

export function quizMasteryPct(record: LessonQuizRecord | undefined): number | null {
  if (!record || record.totalQuestions === 0) return null;
  return Math.round((record.correctAnswers / record.totalQuestions) * 100);
}

export function courseMasteryPct(
  lessonIds: string[],
  quizRecords: Record<string, LessonQuizRecord>
): number | null {
  let correct = 0;
  let total = 0;
  for (const id of lessonIds) {
    const rec = quizRecords[id];
    if (rec) {
      correct += rec.correctAnswers;
      total += rec.totalQuestions;
    }
  }
  if (total === 0) return null;
  return Math.round((correct / total) * 100);
}

export function masteryLabel(pct: number | null): string {
  if (pct === null) return "No quizzes taken";
  if (pct >= 90) return "Mastered";
  if (pct >= 70) return "Strong";
  if (pct >= 50) return "Learning";
  return "Needs review";
}
