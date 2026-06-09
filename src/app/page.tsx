import { getCards, getProgress, getPublishedLessons } from "@/lib/data";
import HomeClient from "@/components/HomeClient";
import type { LessonWithStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [lessons, cards, progress] = await Promise.all([
    getPublishedLessons(),
    getCards(),
    getProgress(),
  ]);

  const enriched: LessonWithStats[] = lessons.map((lesson) => {
    const lessonCards = cards.filter((c) => c.lessonId === lesson.id);
    const lp = progress.lessonProgress.find((p) => p.lessonId === lesson.id);
    return {
      ...lesson,
      cardCount: lessonCards.length,
      completedCards: lp?.completedCardIds.length ?? 0,
      lessonCompleted: lp?.lessonCompleted ?? false,
    };
  });

  const totalCards = enriched.reduce((sum, l) => sum + l.cardCount, 0);
  const totalCompleted = enriched.reduce((sum, l) => sum + l.completedCards, 0);
  const lessonsDone = enriched.filter((l) => l.lessonCompleted).length;

  return (
    <HomeClient
      lessons={enriched}
      totalCards={totalCards}
      totalCompleted={totalCompleted}
      lessonsDone={lessonsDone}
      initialName={progress.learnerName}
      initialOnboarded={progress.onboarded}
    />
  );
}
