import { NextResponse } from "next/server";
import {
  getCardsByLesson,
  getLessonById,
  getProgress,
} from "@/lib/data";
import { hasEverCompletedLesson } from "@/lib/lessonCompletion";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lesson = await getLessonById(id);

  if (!lesson || !lesson.published) {
    return NextResponse.json({ error: "Lektion nicht gefunden" }, { status: 404 });
  }

  const [cards, progress] = await Promise.all([
    getCardsByLesson(id),
    getProgress(),
  ]);

  const lessonProgress = progress.lessonProgress.find((p) => p.lessonId === id);

  return NextResponse.json({
    lesson,
    cards,
    completedCardIds: lessonProgress?.completedCardIds ?? [],
    lessonCompleted: hasEverCompletedLesson(lessonProgress),
    completionCount: lessonProgress?.completionCount ?? 0,
  });
}
