import { promises as fs } from "fs";
import path from "path";
import type { Exercise, Flashcard, Lesson, SiteProgress } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

const lessonsPath = path.join(DATA_DIR, "lessons.json");
const cardsPath = path.join(DATA_DIR, "cards.json");
const exercisesPath = path.join(DATA_DIR, "exercises.json");
const progressPath = path.join(DATA_DIR, "progress.json");

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(filePath: string, data: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getLessons(): Promise<Lesson[]> {
  const lessons = await readJson<Lesson[]>(lessonsPath, []);
  return lessons.sort((a, b) => a.order - b.order);
}

export async function getPublishedLessons(): Promise<Lesson[]> {
  const lessons = await getLessons();
  return lessons.filter((l) => l.published);
}

export async function getLessonById(id: string): Promise<Lesson | undefined> {
  const lessons = await getLessons();
  return lessons.find((l) => l.id === id);
}

export async function saveLessons(lessons: Lesson[]): Promise<void> {
  await writeJson(lessonsPath, lessons);
}

export async function getCards(): Promise<Flashcard[]> {
  const cards = await readJson<Flashcard[]>(cardsPath, []);
  return cards.sort((a, b) => a.order - b.order);
}

export async function getCardsByLesson(lessonId: string): Promise<Flashcard[]> {
  const cards = await getCards();
  return cards
    .filter((c) => c.lessonId === lessonId)
    .sort((a, b) => a.order - b.order);
}

export async function saveCards(cards: Flashcard[]): Promise<void> {
  await writeJson(cardsPath, cards);
}

export async function getExercises(): Promise<Exercise[]> {
  const exercises = await readJson<Exercise[]>(exercisesPath, []);
  return exercises.sort((a, b) => a.order - b.order);
}

export async function getExercisesByLesson(lessonId: string): Promise<Exercise[]> {
  const exercises = await getExercises();
  return exercises
    .filter((e) => e.lessonId === lessonId)
    .sort((a, b) => a.order - b.order);
}

export async function saveExercises(exercises: Exercise[]): Promise<void> {
  await writeJson(exercisesPath, exercises);
}

export async function getProgress(): Promise<SiteProgress> {
  const raw = await readJson<SiteProgress & { bio?: string }>(progressPath, {
    learnerName: "",
    onboarded: false,
    lessonProgress: [],
    updatedAt: new Date().toISOString(),
  });
  return {
    learnerName: raw.learnerName ?? "",
    onboarded: raw.onboarded ?? Boolean(raw.learnerName),
    lessonProgress: raw.lessonProgress ?? [],
    updatedAt: raw.updatedAt,
  };
}

export async function saveProgress(progress: SiteProgress): Promise<void> {
  progress.updatedAt = new Date().toISOString();
  await writeJson(progressPath, progress);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
