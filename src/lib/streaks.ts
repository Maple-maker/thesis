type StreakResult = {
  current: number;
  longest: number;
};

function toDateKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function consecutiveDays(dates: string[]): StreakResult {
  if (dates.length === 0) return { current: 0, longest: 0 };
  const unique = [...new Set(dates)].sort().reverse();
  let longest = 1;
  let current = 1;
  let run = 1;

  const today = toDateKey(Date.now());
  const yesterday = toDateKey(Date.now() - 86400000);
  if (unique[0] !== today && unique[0] !== yesterday) {
    current = 0;
  }

  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff <= 1) {
      run++;
      if (i <= 1 && current > 0) current = run;
    } else {
      if (i <= 1) current = 0;
      run = 1;
    }
    if (run > longest) longest = run;
  }

  if (unique.length === 1 && current > 0) {
    current = 1;
    longest = 1;
  }

  return { current, longest };
}

export function computeLoginStreak(lastActiveDate: string): StreakResult {
  if (!lastActiveDate) return { current: 0, longest: 0 };
  return consecutiveDays([lastActiveDate]);
}

export function computeLessonStreak(
  lessonCompletionDates: Record<string, number>
): StreakResult {
  const days = Object.values(lessonCompletionDates).map(toDateKey);
  return consecutiveDays(days);
}

export function computeDuelStreak(
  journal: { createdAt: number; type: string }[]
): StreakResult {
  const duelDays = journal
    .filter((j) => j.type === "duel")
    .map((j) => toDateKey(j.createdAt));
  return consecutiveDays(duelDays);
}

export function computeAllStreaks(
  lastActiveDate: string,
  lessonCompletionDates: Record<string, number>,
  journal: { createdAt: number; type: string }[]
): {
  login: StreakResult;
  lessons: StreakResult;
  duels: StreakResult;
  combined: StreakResult;
} {
  const login = computeLoginStreak(lastActiveDate);
  const lessons = computeLessonStreak(lessonCompletionDates);
  const duels = computeDuelStreak(journal);

  const allDays = new Set<string>();
  if (lastActiveDate) allDays.add(lastActiveDate);
  Object.values(lessonCompletionDates).forEach((ts) => allDays.add(toDateKey(ts)));
  journal.forEach((j) => allDays.add(toDateKey(j.createdAt)));

  const combined = consecutiveDays([...allDays]);

  return { login, lessons, duels, combined };
}
