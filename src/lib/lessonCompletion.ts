import type { LessonProgress } from "./types";

/** Anzahl vollständiger Durchläufe (inkl. erstem Abschluss). */
export function getCompletionCount(lp?: LessonProgress | null): number {
  if (!lp) return 0;
  const stored = lp.completionCount ?? 0;
  if (stored > 0) return stored;
  if (lp.lessonCompleted) return 1;
  return 0;
}

export function hasEverCompletedLesson(lp?: LessonProgress | null): boolean {
  return getCompletionCount(lp) > 0;
}

export function normalizeCompletionCount(lp: LessonProgress): void {
  if ((lp.completionCount ?? 0) === 0 && lp.lessonCompleted) {
    lp.completionCount = 1;
  }
}
