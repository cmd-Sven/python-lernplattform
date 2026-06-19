import type { Exercise, Flashcard } from "./types";

export const CARDS_PER_BLOCK = 6;

export function getCardBlockCount(cardCount: number): number {
  return Math.ceil(cardCount / CARDS_PER_BLOCK);
}

/** Übungen nach dem letzten Kartenblock (ohne eigene 6 Karten davor). */
export function getTrailingExerciseStartIndex(
  cardCount: number,
  exerciseCount: number,
): number {
  const blockCount = getCardBlockCount(cardCount);
  return exerciseCount > blockCount ? blockCount : exerciseCount;
}

export function hasMoreLessonContent(
  cardCount: number,
  exerciseCount: number,
  activeExerciseIndex: number,
): boolean {
  const nextCardIndex = (activeExerciseIndex + 1) * CARDS_PER_BLOCK;
  if (nextCardIndex < cardCount) return true;
  return activeExerciseIndex + 1 < exerciseCount;
}

export function isLastFlowStep(
  cardCount: number,
  exerciseCount: number,
  activeExerciseIndex: number,
): boolean {
  return !hasMoreLessonContent(cardCount, exerciseCount, activeExerciseIndex);
}

export function getExerciseIndexAfterCard(
  cardIndex: number,
  totalCards?: number,
): number | null {
  if ((cardIndex + 1) % CARDS_PER_BLOCK === 0) {
    return (cardIndex + 1) / CARDS_PER_BLOCK - 1;
  }

  // Letzte Karte eines unvollständigen Blocks (z. B. Karte 20 nach 18 Karten + Übung)
  if (totalCards !== undefined && cardIndex === totalCards - 1) {
    return Math.floor(cardIndex / CARDS_PER_BLOCK);
  }

  return null;
}

export function getInitialLessonState(
  cards: Flashcard[],
  exercises: Exercise[],
  completedCardIds: string[],
  completedExerciseIds: string[],
  lessonCompleted: boolean
): {
  mode: "card" | "exercise" | "done";
  cardIndex: number;
  exerciseIndex: number | null;
} {
  if (lessonCompleted) {
    return { mode: "done", cardIndex: 0, exerciseIndex: null };
  }

  const blockCount = getCardBlockCount(cards.length);

  for (let block = 0; block < blockCount; block++) {
    const start = block * CARDS_PER_BLOCK;
    const blockCards = cards.slice(start, start + CARDS_PER_BLOCK);
    const exercise = exercises[block];

    const allCardsDone = blockCards.every((c) => completedCardIds.includes(c.id));

    if (!allCardsDone) {
      const firstInBlock = blockCards.findIndex(
        (c) => !completedCardIds.includes(c.id)
      );
      return {
        mode: "card",
        cardIndex: start + firstInBlock,
        exerciseIndex: null,
      };
    }

    if (exercise && !completedExerciseIds.includes(exercise.id)) {
      return { mode: "exercise", cardIndex: start, exerciseIndex: block };
    }
  }

  const trailingStart = getTrailingExerciseStartIndex(cards.length, exercises.length);
  for (let exerciseIndex = trailingStart; exerciseIndex < exercises.length; exerciseIndex++) {
    const exercise = exercises[exerciseIndex];
    if (!completedExerciseIds.includes(exercise.id)) {
      return {
        mode: "exercise",
        cardIndex: Math.max(0, (blockCount - 1) * CARDS_PER_BLOCK),
        exerciseIndex,
      };
    }
  }

  const allCardsDone = cards.every((c) => completedCardIds.includes(c.id));
  const allExercisesDone =
    exercises.length === 0 ||
    exercises.every((e) => completedExerciseIds.includes(e.id));

  if (allCardsDone && allExercisesDone) {
    return { mode: "done", cardIndex: 0, exerciseIndex: null };
  }

  return { mode: "card", cardIndex: 0, exerciseIndex: null };
}
