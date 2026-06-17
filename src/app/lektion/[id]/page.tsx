import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminPreviewShell from "@/components/AdminPreviewShell";
import FlashcardDeck from "@/components/FlashcardDeck";
import VisitorLessonGate from "@/components/VisitorLessonGate";
import LessonUnlockGate from "@/components/LessonUnlockGate";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getCardsByLesson,
  getExercisesByLesson,
  getLessonById,
  getLessons,
} from "@/lib/data";
import { findNextLesson, getLessonNumber } from "@/lib/lessonAccess";
import { createPageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lesson = await getLessonById(id);
  if (!lesson || !lesson.published) {
    return createPageMetadata({
      title: "Lektion",
      description: "Python-Lernkarte zur PCEP-Vorbereitung.",
      path: `/lektion/${id}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: lesson.title,
    description: lesson.description,
    path: `/lektion/${lesson.id}`,
    type: "article",
  });
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { id } = await params;
  const { preview } = await searchParams;
  const adminPreview = preview === "1" && (await isAdminAuthenticated());

  const allLessons = await getLessons();
  const lesson = adminPreview
    ? allLessons.find((item) => item.id === id)
    : await getLessonById(id);

  if (!lesson || (!lesson.published && !adminPreview)) {
    notFound();
  }

  const [cards, exercises] = await Promise.all([
    getCardsByLesson(id),
    getExercisesByLesson(id),
  ]);

  const lessonNumber = getLessonNumber(lesson, allLessons);
  const nextLesson = findNextLesson(lesson, allLessons);

  const content = (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="breadcrumbs text-sm mb-4">
        <ul>
          <li>
            {adminPreview ? (
              <Link href="/admin">Admin</Link>
            ) : (
              <Link href="/">Start</Link>
            )}
          </li>
          <li>{lesson.title}</li>
        </ul>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        {lesson.pcepTopic && (
          <p className="text-primary text-sm mt-1">{lesson.pcepTopic}</p>
        )}
        <p className="opacity-70 mt-2">{lesson.description}</p>
        <p className="text-sm mt-2 opacity-60">
          {cards.length} Fragen · nach je 6 Fragen eine Übung ({exercises.length}{" "}
          Übungen)
        </p>
      </div>

      <FlashcardDeck
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        lessonNumber={lessonNumber}
        totalLessons={allLessons.length}
        nextLesson={
          nextLesson
            ? { title: nextLesson.title, published: nextLesson.published }
            : undefined
        }
        cards={cards}
        exercises={exercises}
      />
    </div>
  );

  if (adminPreview) {
    return <AdminPreviewShell>{content}</AdminPreviewShell>;
  }

  return (
    <VisitorLessonGate>
      <LessonUnlockGate lesson={lesson} allLessons={allLessons}>
        {content}
      </LessonUnlockGate>
    </VisitorLessonGate>
  );
}
