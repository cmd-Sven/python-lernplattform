import type { Metadata } from "next";
import { getCards, getExercises, getGuestbookEntries, getLessons } from "@/lib/data";
import HomeClient from "@/components/HomeClient";
import JsonLd from "@/components/JsonLd";
import { createPageMetadata, DEFAULT_DESCRIPTION, getSiteUrl, SITE_NAME } from "@/lib/site";
import type { LessonWithCardCount } from "@/lib/visitorProgress";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Python Lernkarten zur PCEP-Prüfung",
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

export default async function HomePage() {
  const [lessons, cards, exercises, guestbookEntries] = await Promise.all([
    getLessons(),
    getCards(),
    getExercises(),
    getGuestbookEntries(true),
  ]);

  const lessonsWithCounts: LessonWithCardCount[] = lessons.map((lesson) => ({
    ...lesson,
    cardCount: cards.filter((c) => c.lessonId === lesson.id).length,
    exerciseCount: exercises.filter((e) => e.lessonId === lesson.id).length,
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          description: DEFAULT_DESCRIPTION,
          inLanguage: "de-DE",
          url: getSiteUrl(),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: "PCEP Prüfungsvorbereitung mit Python",
          description: DEFAULT_DESCRIPTION,
          provider: {
            "@type": "Organization",
            name: SITE_NAME,
            url: getSiteUrl(),
          },
          inLanguage: "de",
          isAccessibleForFree: true,
          educationalLevel: "Beginner",
          teaches: "Python programming for PCEP certification",
        }}
      />
      <HomeClient lessons={lessonsWithCounts} guestbookEntries={guestbookEntries} />
    </>
  );
}
