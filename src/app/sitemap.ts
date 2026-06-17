import type { MetadataRoute } from "next";
import { getLessons } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const lessons = await getLessons();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteUrl}/labyrinth`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/pcep-challenge`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/experten-aufgaben`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/impressum`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const lessonRoutes: MetadataRoute.Sitemap = lessons
    .filter((lesson) => lesson.published)
    .map((lesson) => ({
      url: `${siteUrl}/lektion/${lesson.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    }));

  return [...staticRoutes, ...lessonRoutes];
}
