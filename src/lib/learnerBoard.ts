import type { LessonProgress } from "./types";

export interface LessonMeta {
  id: string;
  order: number;
  title: string;
  cardCount: number;
  exerciseCount: number;
}

export interface StoredLearner {
  id: string;
  displayName: string;
  lessonProgress: LessonProgress[];
  updatedAt: string;
}

export interface LearnerBoardEntry {
  id: string;
  displayName: string;
  lessonNumber: number;
  lessonTitle: string;
  percentComplete: number;
  label: string;
  isCurrentUser?: boolean;
}

export function lessonPercent(
  lesson: LessonMeta,
  progress: LessonProgress[],
): number {
  const lp = progress.find((p) => p.lessonId === lesson.id);
  const cardsDone = lp?.completedCardIds.length ?? 0;
  const exercisesDone = lp?.completedExerciseIds?.length ?? 0;
  const total = lesson.cardCount + lesson.exerciseCount;
  if (total === 0) return 100;
  return Math.round(((cardsDone + exercisesDone) / total) * 100);
}

export function formatLearnerStatus(
  id: string,
  displayName: string,
  lessonProgress: LessonProgress[],
  lessons: LessonMeta[],
): LearnerBoardEntry | null {
  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) return null;

  const activeLesson =
    sorted.find((lesson) => lessonPercent(lesson, lessonProgress) < 100) ??
    sorted[sorted.length - 1];

  const lessonNumber =
    sorted.findIndex((lesson) => lesson.id === activeLesson.id) + 1;
  const percentComplete = lessonPercent(activeLesson, lessonProgress);

  return {
    id,
    displayName,
    lessonNumber,
    lessonTitle: activeLesson.title,
    percentComplete,
    label: `${displayName} – Lektion ${lessonNumber} Fragen + Übungen ${percentComplete}% abgeschlossen.`,
  };
}

export function buildLearnerBoard(
  learners: StoredLearner[],
  lessons: LessonMeta[],
  currentVisitorId?: string,
): LearnerBoardEntry[] {
  return learners
    .map((learner) =>
      formatLearnerStatus(
        learner.id,
        learner.displayName,
        learner.lessonProgress,
        lessons,
      ),
    )
    .filter((entry): entry is LearnerBoardEntry => entry !== null)
    .map((entry) => ({
      ...entry,
      isCurrentUser: currentVisitorId ? entry.id === currentVisitorId : false,
    }))
    .sort((a, b) => {
      if (b.percentComplete !== a.percentComplete) {
        return b.percentComplete - a.percentComplete;
      }
      return a.displayName.localeCompare(b.displayName, "de");
    });
}
