import { getCompletionCount } from "./lessonCompletion";
import type { LessonProgress } from "./types";
import type { LearnerBoardEntry, StoredLearner } from "./learnerBoard";

export function normalizeLearnerName(name: string): string {
  return name.trim().toLowerCase();
}

/** Fortschritts-Score zum Vergleichen von Lernmonitor-Einträgen. */
export function learnerProgressScore(lessonProgress: LessonProgress[]): number {
  return lessonProgress.reduce((sum, lp) => {
    const cards = lp.completedCardIds?.length ?? 0;
    const exercises = lp.completedExerciseIds?.length ?? 0;
    const completions = getCompletionCount(lp);
    return sum + cards + exercises + completions * 10_000;
  }, 0);
}

export function isStaleLearnerDuplicate(
  other: StoredLearner,
  currentId: string,
  currentName: string,
  currentProgress: LessonProgress[],
): boolean {
  if (other.id === currentId) return false;

  if (normalizeLearnerName(other.displayName) !== normalizeLearnerName(currentName)) {
    return false;
  }

  const otherScore = learnerProgressScore(other.lessonProgress);
  const currentScore = learnerProgressScore(currentProgress);

  if (currentScore === 0) return false;
  return otherScore === 0;
}

export function dedupeLearnerBoardEntries(
  entries: LearnerBoardEntry[],
): LearnerBoardEntry[] {
  const byName = new Map<string, LearnerBoardEntry>();

  for (const entry of entries) {
    const key = normalizeLearnerName(entry.displayName);
    const existing = byName.get(key);

    if (!existing) {
      byName.set(key, entry);
      continue;
    }

    const entryMedalScore =
      entry.lessonMedals.length +
      entry.mazeMedals.length +
      entry.expertMedals.length +
      (entry.pcepChallengeMedal ? 1 : 0);
    const existingMedalScore =
      existing.lessonMedals.length +
      existing.mazeMedals.length +
      existing.expertMedals.length +
      (existing.pcepChallengeMedal ? 1 : 0);

    const keepCurrent =
      entryMedalScore > existingMedalScore ||
      (entryMedalScore === existingMedalScore &&
        entry.percentComplete > existing.percentComplete) ||
      (entryMedalScore === existingMedalScore &&
        entry.percentComplete === existing.percentComplete &&
        entry.isCurrentUser &&
        !existing.isCurrentUser) ||
      (entryMedalScore === existingMedalScore &&
        existing.percentComplete === 0 &&
        entry.percentComplete > 0);

    if (keepCurrent) {
      byName.set(key, entry);
    }
  }

  return [...byName.values()].sort((a, b) => {
    const aMedals =
      a.lessonMedals.length + a.mazeMedals.length + a.expertMedals.length;
    const bMedals =
      b.lessonMedals.length + b.mazeMedals.length + b.expertMedals.length;
    if (bMedals !== aMedals) return bMedals - aMedals;
    if (b.percentComplete !== a.percentComplete) {
      return b.percentComplete - a.percentComplete;
    }
    return a.displayName.localeCompare(b.displayName, "de");
  });
}

export function dedupeStoredLearnersByName(
  learners: StoredLearner[],
): StoredLearner[] {
  const byName = new Map<string, StoredLearner>();

  for (const learner of learners) {
    const key = normalizeLearnerName(learner.displayName);
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, learner);
      continue;
    }

    const existingScore = learnerProgressScore(existing.lessonProgress);
    const currentScore = learnerProgressScore(learner.lessonProgress);
    const pickCurrent =
      currentScore > existingScore ||
      (currentScore === existingScore &&
        new Date(learner.updatedAt).getTime() >
          new Date(existing.updatedAt).getTime());

    const winner = pickCurrent ? learner : existing;
    const loser = pickCurrent ? existing : learner;

    byName.set(key, {
      ...winner,
      mazeCompletedLevels: [
        ...new Set([
          ...(winner.mazeCompletedLevels ?? []),
          ...(loser.mazeCompletedLevels ?? []),
        ]),
      ].sort((a, b) => a - b),
      expertCompletedLevels: [
        ...new Set([
          ...(winner.expertCompletedLevels ?? []),
          ...(loser.expertCompletedLevels ?? []),
        ]),
      ].sort((a, b) => a - b),
      pcepChallengeCompleted:
        Boolean(winner.pcepChallengeCompleted) ||
        Boolean(loser.pcepChallengeCompleted),
    });
  }

  return [...byName.values()];
}

export function mergeLearnerUpsertPayload(
  existing: StoredLearner,
  incoming: {
    lessonProgress: LessonProgress[];
    mazeCompletedLevels: number[];
    expertCompletedLevels: number[];
    pcepChallengeCompleted: boolean;
  },
): {
  lessonProgress: LessonProgress[];
  mazeCompletedLevels: number[];
  expertCompletedLevels: number[];
  pcepChallengeCompleted: boolean;
} {
  const existingScore = learnerProgressScore(existing.lessonProgress);
  const incomingScore = learnerProgressScore(incoming.lessonProgress);

  return {
    lessonProgress:
      incomingScore >= existingScore
        ? incoming.lessonProgress
        : existing.lessonProgress,
    mazeCompletedLevels: [
      ...new Set([
        ...(existing.mazeCompletedLevels ?? []),
        ...incoming.mazeCompletedLevels,
      ]),
    ].sort((a, b) => a - b),
    expertCompletedLevels: [
      ...new Set([
        ...(existing.expertCompletedLevels ?? []),
        ...incoming.expertCompletedLevels,
      ]),
    ].sort((a, b) => a - b),
    pcepChallengeCompleted:
      existing.pcepChallengeCompleted || incoming.pcepChallengeCompleted,
  };
}
