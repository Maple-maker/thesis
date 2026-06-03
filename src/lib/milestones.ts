import type { IconName } from "@/components/Icon";

export type MilestoneId =
  | "first-duel"
  | "first-course"
  | "first-thesis"
  | "tenth-journal"
  | "fifth-duel"
  | "three-courses"
  | "seven-day-streak"
  | "thirty-day-streak"
  | "perfect-lesson"
  | "all-courses-started";

export type Milestone = {
  id: MilestoneId;
  icon: IconName;
  title: string;
  description: string;
  priority: number;
};

export const ALL_MILESTONES: Milestone[] = [
  { id: "first-duel", icon: "compare", title: "First duel", description: "You ran your first stock duel — forcing a choice builds conviction.", priority: 1 },
  { id: "first-course", icon: "cap", title: "Course complete", description: "You finished an entire course. Knowledge is the foundation of alpha.", priority: 2 },
  { id: "first-thesis", icon: "sparkle", title: "First thesis", description: "You built and saved your first investment thesis. This is where conviction starts.", priority: 3 },
  { id: "tenth-journal", icon: "book", title: "10 entries", description: "Ten journal entries — you're building a real decision history.", priority: 4 },
  { id: "fifth-duel", icon: "compare", title: "5 duels", description: "Five duels deep. You're sharpening your process with every comparison.", priority: 5 },
  { id: "three-courses", icon: "cap", title: "3 courses done", description: "Three courses completed — building real financial literacy.", priority: 6 },
  { id: "seven-day-streak", icon: "flame", title: "7-day streak", description: "A full week of engagement. Consistency compounds.", priority: 7 },
  { id: "thirty-day-streak", icon: "flame", title: "30-day streak", description: "An entire month of active investing education. Incredible discipline.", priority: 8 },
  { id: "perfect-lesson", icon: "sparkle", title: "Perfect score", description: "You answered every quiz question correctly in a lesson. Mastery.", priority: 9 },
  { id: "all-courses-started", icon: "discover", title: "Explorer", description: "You've peeked into every course. Curiosity drives conviction.", priority: 10 },
];

const MILESTONE_BY_ID = Object.fromEntries(
  ALL_MILESTONES.map((m) => [m.id, m])
) as Record<MilestoneId, Milestone>;

export function milestoneById(id: MilestoneId): Milestone | undefined {
  return MILESTONE_BY_ID[id];
}

export function checkMilestones(args: {
  journalCount: number;
  completedLessons: string[];
  hasModelThesis: boolean;
  combinedStreak: number;
  perfectLessonIds: string[];
  coursesStartedCount: number;
  coursesCompletedCount: number;
  celebrated: string[];
}): MilestoneId[] {
  const newly: MilestoneId[] = [];
  const done = new Set(args.celebrated);

  if (args.journalCount >= 1 && !done.has("first-duel")) {
    const hasDuel = args.journalCount >= 1;
    if (hasDuel) newly.push("first-duel");
  }

  if (args.coursesCompletedCount >= 1 && !done.has("first-course")) {
    newly.push("first-course");
  }

  if (args.hasModelThesis && !done.has("first-thesis")) {
    newly.push("first-thesis");
  }

  if (args.journalCount >= 10 && !done.has("tenth-journal")) {
    newly.push("tenth-journal");
  }

  if (args.journalCount >= 5 && !done.has("fifth-duel")) {
    newly.push("fifth-duel");
  }

  if (args.coursesCompletedCount >= 3 && !done.has("three-courses")) {
    newly.push("three-courses");
  }

  if (args.combinedStreak >= 7 && !done.has("seven-day-streak")) {
    newly.push("seven-day-streak");
  }

  if (args.combinedStreak >= 30 && !done.has("thirty-day-streak")) {
    newly.push("thirty-day-streak");
  }

  if (args.perfectLessonIds.length >= 1 && !done.has("perfect-lesson")) {
    newly.push("perfect-lesson");
  }

  if (args.coursesStartedCount >= 14 && !done.has("all-courses-started")) {
    newly.push("all-courses-started");
  }

  return newly;
}
