import { NextResponse } from "next/server";
import {
  getCards,
  getLessons,
  getProgress,
  getPublishedLessons,
} from "@/lib/data";
import {
  getCompletionCount,
  hasEverCompletedLesson,
} from "@/lib/lessonCompletion";
import type { LessonWithStats } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "true";

  const [lessons, cards, progress] = await Promise.all([
    admin ? getLessons() : getPublishedLessons(),
    getCards(),
    getProgress(),
  ]);

  const enriched: LessonWithStats[] = lessons.map((lesson) => {
    const lessonCards = cards.filter((c) => c.lessonId === lesson.id);
    const lp = progress.lessonProgress.find((p) => p.lessonId === lesson.id);
    const completedCards = lp?.completedCardIds.length ?? 0;

    return {
      ...lesson,
      cardCount: lessonCards.length,
      completedCards,
      lessonCompleted: hasEverCompletedLesson(lp),
      completionCount: getCompletionCount(lp),
      savedCardCount: lp?.savedCardIds?.length ?? 0,
    };
  });

  return NextResponse.json({ lessons: enriched, progress });
}
