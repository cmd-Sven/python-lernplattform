"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Exercise, Flashcard } from "@/lib/types";
import {
  CARDS_PER_BLOCK,
  getExerciseIndexAfterCard,
  getInitialLessonState,
} from "@/lib/lessonFlow";
import {
  restartLessonProgress,
  getLessonProgress,
  markCardComplete,
  toggleExerciseComplete,
  toggleSavedCard,
  getSavedCardIds,
} from "@/lib/visitorProgress";
import { isMultipleChoiceCard } from "@/lib/cardFormat";
import ExerciseGate from "./ExerciseGate";
import FlipCard from "./FlipCard";
import MultipleChoiceCard from "./MultipleChoiceCard";
import LessonCompleteModal from "./LessonCompleteModal";
import LessonPyto from "./LessonPyto";
import PytoStickyAside from "./PytoStickyAside";
import PytoTipBuddy, { type PytoAnswerFeedback } from "./PytoTipBuddy";
import ProgressBar from "./ProgressBar";

interface FlashcardDeckProps {
  lessonId: string;
  lessonTitle: string;
  lessonNumber: number;
  totalLessons: number;
  nextLesson?: { title: string; published: boolean };
  cards: Flashcard[];
  exercises: Exercise[];
}

type ViewMode = "card" | "exercise" | "done";

function BookmarkIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? "0" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function FlashcardDeck({
  lessonId,
  lessonTitle,
  lessonNumber,
  totalLessons,
  nextLesson,
  cards,
  exercises,
}: FlashcardDeckProps) {
  const [ready, setReady] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [mode, setMode] = useState<ViewMode>("card");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(
    null,
  );
  const [flipped, setFlipped] = useState(false);
  const [hasViewedBack, setHasViewedBack] = useState(false);
  const [savingExercise, setSavingExercise] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [pytoAnswerFeedback, setPytoAnswerFeedback] =
    useState<PytoAnswerFeedback>(null);

  useEffect(() => {
    setPytoAnswerFeedback(null);
  }, [currentIndex, mode, activeExerciseIndex]);

  const [savedCardIds, setSavedCardIds] = useState<string[]>([]);
  const [onlySaved, setOnlySaved] = useState(false);
  const [savedIndex, setSavedIndex] = useState(0);

  useEffect(() => {
    const lp = getLessonProgress(lessonId);
    const initial = getInitialLessonState(
      cards,
      exercises,
      lp?.completedCardIds ?? [],
      lp?.completedExerciseIds ?? [],
      lp?.lessonCompleted ?? false,
    );

    setCompletedIds(lp?.completedCardIds ?? []);
    setCompletedExerciseIds(lp?.completedExerciseIds ?? []);
    setMode(initial.mode);
    setCurrentIndex(initial.cardIndex);
    setActiveExerciseIndex(initial.exerciseIndex);
    setSavedCardIds(getSavedCardIds(lessonId));
    setReady(true);
  }, [lessonId, cards, exercises]);

  const savedCards = useMemo(
    () => cards.filter((c) => savedCardIds.includes(c.id)),
    [cards, savedCardIds],
  );

  const activeCard = onlySaved ? savedCards[savedIndex] : cards[currentIndex];
  const activeIndex = onlySaved ? savedIndex : currentIndex;
  const activeMax = onlySaved ? savedCards.length : cards.length;

  const currentExercise =
    activeExerciseIndex !== null ? exercises[activeExerciseIndex] : null;
  const isMcCard = activeCard ? isMultipleChoiceCard(activeCard) : false;
  const canProceed = hasViewedBack;

  const saveCardProgress = useCallback(
    (cardId: string) => {
      const lp = markCardComplete(lessonId, cardId, cards, exercises);
      setCompletedIds(lp.completedCardIds);
    },
    [lessonId, cards, exercises],
  );

  const handleToggleSaved = useCallback(() => {
    if (!activeCard) return;
    toggleSavedCard(lessonId, activeCard.id);
    const newIds = getSavedCardIds(lessonId);
    setSavedCardIds(newIds);

    if (onlySaved && !newIds.includes(activeCard.id)) {
      const remaining = cards.filter((c) => newIds.includes(c.id));
      if (remaining.length === 0) {
        setOnlySaved(false);
        setFlipped(false);
        setHasViewedBack(false);
      } else {
        setSavedIndex((prev) => Math.min(prev, remaining.length - 1));
      }
    }
  }, [lessonId, activeCard, onlySaved, cards]);

  const toggleSavedMode = useCallback(() => {
    if (!onlySaved) {
      setSavedIndex(0);
      setFlipped(false);
      setHasViewedBack(false);
      setOnlySaved(true);
    } else {
      setOnlySaved(false);
      setFlipped(false);
      setHasViewedBack(false);
    }
  }, [onlySaved]);

  const handleToggleExerciseComplete = useCallback(() => {
    if (!currentExercise) return;
    setSavingExercise(true);
    const ids = toggleExerciseComplete(
      lessonId,
      currentExercise.id,
      cards,
      exercises,
    );
    setCompletedExerciseIds(ids);
    setSavingExercise(false);
  }, [lessonId, currentExercise, cards, exercises]);

  const handleFlip = useCallback(() => {
    setFlipped((prev) => {
      if (!prev) setHasViewedBack(true);
      return !prev;
    });
  }, []);

  const finishLesson = useCallback(() => {
    setMode("done");
    setCelebrationOpen(true);
  }, []);

  const continueFromExercise = useCallback(() => {
    if (activeExerciseIndex === null) return;

    const nextCardIndex = (activeExerciseIndex + 1) * CARDS_PER_BLOCK;
    if (nextCardIndex >= cards.length) {
      finishLesson();
      return;
    }

    setCurrentIndex(nextCardIndex);
    setMode("card");
    setActiveExerciseIndex(null);
    setFlipped(false);
    setHasViewedBack(false);
  }, [activeExerciseIndex, cards.length, finishLesson]);

  const goNextCard = useCallback(() => {
    if (!activeCard) return;

    if (onlySaved) {
      const nextSavedIdx = savedIndex + 1 < savedCards.length ? savedIndex + 1 : 0;
      setSavedIndex(nextSavedIdx);
      setFlipped(false);
      setHasViewedBack(false);
      return;
    }

    if (!completedIds.includes(activeCard.id)) {
      saveCardProgress(activeCard.id);
    }

    const exerciseIdx = getExerciseIndexAfterCard(currentIndex, cards.length);
    if (exerciseIdx !== null && exercises[exerciseIdx]) {
      setActiveExerciseIndex(exerciseIdx);
      setMode("exercise");
      setFlipped(false);
      setHasViewedBack(false);
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) {
      finishLesson();
      return;
    }

    setCurrentIndex(nextIndex);
    setFlipped(false);
    setHasViewedBack(false);
  }, [
    activeCard,
    onlySaved,
    savedIndex,
    savedCards.length,
    completedIds,
    currentIndex,
    cards.length,
    exercises,
    saveCardProgress,
    finishLesson,
  ]);

  const goPrevCard = useCallback(() => {
    if (onlySaved) {
      if (savedIndex > 0) {
        setSavedIndex(savedIndex - 1);
        setFlipped(false);
        setHasViewedBack(false);
      }
      return;
    }

    if (currentIndex === 0) return;

    if (currentIndex % CARDS_PER_BLOCK === 0) {
      const exerciseIdx = currentIndex / CARDS_PER_BLOCK - 1;
      if (exercises[exerciseIdx]) {
        setActiveExerciseIndex(exerciseIdx);
        setMode("exercise");
        setFlipped(false);
        setHasViewedBack(false);
        return;
      }
    }

    setCurrentIndex(currentIndex - 1);
    setFlipped(false);
    setHasViewedBack(false);
  }, [onlySaved, savedIndex, currentIndex, exercises]);

  const restartLesson = useCallback(() => {
    restartLessonProgress(lessonId);
    const reset = getInitialLessonState(cards, exercises, [], [], false);
    setCompletedIds([]);
    setCompletedExerciseIds([]);
    setMode(reset.mode === "done" ? "card" : reset.mode);
    setCurrentIndex(0);
    setActiveExerciseIndex(null);
    setFlipped(false);
    setHasViewedBack(false);
    setCelebrationOpen(false);
    setOnlySaved(false);
  }, [lessonId, cards, exercises]);

  const completedCount = useMemo(
    () => cards.filter((c) => completedIds.includes(c.id)).length,
    [cards, completedIds],
  );

  const exerciseCompletedCount = useMemo(
    () => exercises.filter((e) => completedExerciseIds.includes(e.id)).length,
    [exercises, completedExerciseIds],
  );

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="alert alert-info">
        <span>Noch keine Lernkarten in dieser Lektion.</span>
      </div>
    );
  }

  const pytoSection = (
    <LessonPyto
      completedCards={completedCount}
      totalCards={cards.length}
      onExercise={mode === "exercise"}
      lessonComplete={mode === "done"}
      lessonNumber={lessonNumber}
      totalLessons={totalLessons}
      nextLesson={nextLesson}
    />
  );

  if (mode === "done") {
    return (
      <>
        <LessonCompleteModal
          open={celebrationOpen}
          lessonNumber={lessonNumber}
          lessonTitle={lessonTitle}
          onClose={() => setCelebrationOpen(false)}
        />
        <div className="flex flex-col gap-6 py-8">
        {pytoSection}
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-2xl font-bold text-center">
            {lessonTitle} abgeschlossen!
          </h2>
          <p className="text-center opacity-70 max-w-md">
            Du hast alle {cards.length} Lernkarten und {exercises.length}{" "}
            Übungen durchgearbeitet.
          </p>
          <ProgressBar value={cards.length} max={cards.length} label="Lernkarten" />
          <ProgressBar
            value={exerciseCompletedCount}
            max={exercises.length}
            label="Übungen"
          />
          <div className="flex flex-wrap gap-3 justify-center">
            <button type="button" className="btn btn-primary" onClick={restartLesson}>
              Von vorne wiederholen
            </button>
            {savedCards.length > 0 && (
              <button
                type="button"
                className="btn btn-warning gap-2"
                onClick={() => {
                  setCelebrationOpen(false);
                  setMode("card");
                  setOnlySaved(true);
                  setSavedIndex(0);
                  setFlipped(false);
                  setHasViewedBack(false);
                }}
              >
                <BookmarkIcon filled className="w-4 h-4" />
                Gemerkte üben ({savedCards.length})
              </button>
            )}
            <a href="/" className="btn btn-ghost">
              Zur Übersicht
            </a>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (mode === "exercise" && currentExercise && activeExerciseIndex !== null) {
    const isExerciseDone = completedExerciseIds.includes(currentExercise.id);
    const isGapFillExercise =
      currentExercise.exerciseType === "gap_fill" || Boolean(currentExercise.gapFill);

    return (
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
        <ProgressBar
          value={completedCount}
          max={cards.length}
          label={`${completedCount} von ${cards.length} Fragen · Übung ${activeExerciseIndex + 1} von ${exercises.length}`}
        />

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <ExerciseGate
              exercise={currentExercise}
              index={activeExerciseIndex}
              isCompleted={isExerciseDone}
              saving={savingExercise}
              onToggleComplete={handleToggleExerciseComplete}
            />

            <div className="flex justify-end">
              <button
                type="button"
                className="btn btn-primary"
                onClick={continueFromExercise}
                disabled={!isExerciseDone}
                title={
                  isExerciseDone
                    ? undefined
                    : isGapFillExercise
                      ? "Prüfe die Übung erfolgreich, um fortzufahren"
                      : "Hake die Übung ab, um mit den nächsten Fragen fortzufahren"
                }
              >
                {activeExerciseIndex + 1 >= exercises.length &&
                (activeExerciseIndex + 1) * CARDS_PER_BLOCK >= cards.length
                  ? "Lektion abschließen"
                  : "Weiter zu den nächsten Fragen"}
              </button>
            </div>
          </div>

          {!isGapFillExercise && (
            <PytoStickyAside>
              {pytoSection}
            </PytoStickyAside>
          )}
        </div>
      </div>
    );
  }

  const progressLabel = onlySaved
    ? `Gemerkte Karte ${savedIndex + 1} von ${savedCards.length}`
    : `Frage ${currentIndex + 1} von ${cards.length}`;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar
            value={onlySaved ? savedIndex + 1 : completedCount}
            max={activeMax}
            label={progressLabel}
          />
        </div>
        {savedCards.length > 0 && (
          <button
            type="button"
            className={`btn btn-sm gap-1.5 shrink-0 ${onlySaved ? "btn-warning" : "btn-outline"}`}
            onClick={toggleSavedMode}
            title={onlySaved ? "Zurück zu allen Karten" : "Nur gemerkte Karten wiederholen"}
          >
            <BookmarkIcon filled={onlySaved} className="w-4 h-4" />
            {onlySaved ? "Alle Karten" : `Gemerkte (${savedCards.length})`}
          </button>
        )}
      </div>

      {onlySaved && (
        <div className="alert alert-warning py-2">
          <BookmarkIcon filled className="w-4 h-4 shrink-0" />
          <span className="text-sm">
            Gemerkte-Karten-Modus – du übst nur die {savedCards.length} markierten Karten.
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0">
          {activeCard && (
            isMcCard ? (
              <MultipleChoiceCard
                key={activeCard.id}
                card={activeCard}
                onAnsweredCorrectly={() => setHasViewedBack(true)}
                onAnswerFeedbackChange={setPytoAnswerFeedback}
              />
            ) : (
              <FlipCard
                key={`${activeCard.id}-${onlySaved ? "saved" : "normal"}`}
                card={activeCard}
                flipped={flipped}
                onFlip={handleFlip}
                saved={savedCardIds.includes(activeCard.id)}
                onToggleSaved={handleToggleSaved}
              />
            )
          )}
        </div>
        <PytoStickyAside>
          {activeCard && (
            <PytoTipBuddy
              key={activeCard.id}
              card={activeCard}
              disabled={!isMcCard && !hasViewedBack}
              answerFeedback={isMcCard ? pytoAnswerFeedback : null}
              solutionViewed={!isMcCard && hasViewedBack}
            />
          )}
        </PytoStickyAside>
      </div>

      <div className="flex justify-between gap-3">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={goPrevCard}
          disabled={onlySaved ? savedIndex === 0 : currentIndex === 0}
        >
          Zurück
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={goNextCard}
          disabled={!canProceed}
          title={
            canProceed
              ? undefined
              : isMcCard
                ? "Beantworte die Frage richtig, um fortzufahren"
                : "Drehe die Karte mit der Glühbirne um, um fortzufahren"
          }
        >
          {onlySaved && savedIndex + 1 >= savedCards.length ? "Von vorne" : "Weiter"}
        </button>
      </div>
    </div>
  );
}
