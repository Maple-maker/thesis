import type { Course, CourseId } from "@/data/courses";

export function courseProgressPercent(
  course: Course,
  completedLessons: string[]
): number {
  if (course.lessons.length === 0) return 0;
  const done = course.lessons.filter((l) => completedLessons.includes(l.id)).length;
  return Math.round((done / course.lessons.length) * 100);
}

export function courseProgressLabel(course: Course, completedLessons: string[]): string {
  const pct = courseProgressPercent(course, completedLessons);
  if (pct === 0) return "Not started";
  if (pct === 100) return "Complete";
  return `${pct}% complete`;
}

export function nextLessonInCourse(
  course: Course,
  completedLessons: string[]
): { lessonId: string; title: string } | null {
  const next = course.lessons.find((l) => !completedLessons.includes(l.id));
  return next ? { lessonId: next.id, title: next.title } : null;
}

export function hasStartedCourse(courseId: CourseId, completedLessons: string[], course: Course): boolean {
  return course.lessons.some((l) => completedLessons.includes(l.id));
}
