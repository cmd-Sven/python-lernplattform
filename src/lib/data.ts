import { promises as fs } from "fs";
import path from "path";
import { isStaleLearnerDuplicate, dedupeStoredLearnersByName, mergeLearnerUpsertPayload } from "./learnerDedup";
import type { StoredLearner } from "./learnerBoard";
import type { MazeHighscoreEntry } from "./maze/highscores";
import { sortMazeHighscores } from "./maze/highscores";
import type { Exercise, Flashcard, GuestbookEntry, Lesson, LessonProgress, SiteProgress, VisitorHit, VisitorStatsSummary } from "./types";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase/server";

const DATA_DIR = path.join(process.cwd(), "data");

const lessonsPath = path.join(DATA_DIR, "lessons.json");
const cardsPath = path.join(DATA_DIR, "cards.json");
const exercisesPath = path.join(DATA_DIR, "exercises.json");
const progressPath = path.join(DATA_DIR, "progress.json");
const learnersPath = path.join(DATA_DIR, "learners.json");
const mazeScoresPath = path.join(DATA_DIR, "maze-scores.json");
const guestbookPath = path.join(DATA_DIR, "guestbook.json");
const visitorHitsPath = path.join(DATA_DIR, "visitor-hits.json");

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

type LessonRow = {
  id: string;
  title: string;
  description: string;
  order: number;
  published: boolean;
  pcep_topic: string | null;
};

type FlashcardRow = {
  id: string;
  lesson_id: string;
  order: number;
  question: string;
  tip: string;
  pyto_intro_message?: string | null;
  tip2_messages: string[];
  tip3_messages: string[];
  answer: string;
  detail: string | null;
  code_example: string | null;
  learn_more_url: string | null;
  learn_more_label: string | null;
  card_type?: string | null;
  mc_options?: string[] | null;
  mc_correct_index?: number | null;
};

type ExerciseRow = {
  id: string;
  lesson_id: string;
  order: number;
  title: string;
  task: string;
  solution: string;
  notes: string | null;
  starter_code: string | null;
  solution_code: string | null;
  exercise_type?: string | null;
  gap_fill?: import("./types").GapFillData | null;
};

function mapLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    order: row.order,
    published: row.published,
    pcepTopic: row.pcep_topic ?? undefined,
  };
}

function mapFlashcard(row: FlashcardRow): Flashcard {
  const cardType =
    row.card_type === "multiple_choice" ? "multiple_choice" : "flip";
  const mcOptions = row.mc_options ?? undefined;
  const mcCorrectIndex = row.mc_correct_index ?? undefined;

  return {
    id: row.id,
    lessonId: row.lesson_id,
    order: row.order,
    question: row.question,
    tip: row.tip,
    pytoIntroMessage: row.pyto_intro_message ?? undefined,
    tip2Messages: row.tip2_messages?.length ? row.tip2_messages : undefined,
    tip3Messages: row.tip3_messages?.length ? row.tip3_messages : undefined,
    answer: row.answer,
    detail: row.detail ?? undefined,
    codeExample: row.code_example ?? undefined,
    learnMoreUrl: row.learn_more_url ?? undefined,
    learnMoreLabel: row.learn_more_label ?? undefined,
    cardType: mcOptions ? "multiple_choice" : cardType,
    multipleChoice:
      mcOptions && mcCorrectIndex !== undefined
        ? { options: mcOptions, correctIndex: mcCorrectIndex }
        : undefined,
  };
}

function mapExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    order: row.order,
    title: row.title,
    task: row.task,
    solution: row.solution,
    notes: row.notes ?? undefined,
    starterCode: row.starter_code ?? undefined,
    solutionCode: row.solution_code ?? undefined,
    exerciseType:
      row.exercise_type === "gap_fill" || row.gap_fill
        ? "gap_fill"
        : "code",
    gapFill: row.gap_fill ?? undefined,
  };
}

function lessonToRow(lesson: Lesson): LessonRow {
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    published: lesson.published,
    pcep_topic: lesson.pcepTopic ?? null,
  };
}

function flashcardToRow(card: Flashcard): FlashcardRow {
  return {
    id: card.id,
    lesson_id: card.lessonId,
    order: card.order,
    question: card.question,
    tip: card.tip,
    pyto_intro_message: card.pytoIntroMessage ?? null,
    tip2_messages: card.tip2Messages ?? [],
    tip3_messages: card.tip3Messages ?? [],
    answer: card.answer,
    detail: card.detail ?? null,
    code_example: card.codeExample ?? null,
    learn_more_url: card.learnMoreUrl ?? null,
    learn_more_label: card.learnMoreLabel ?? null,
    card_type: card.multipleChoice ? "multiple_choice" : card.cardType ?? "flip",
    mc_options: card.multipleChoice?.options ?? null,
    mc_correct_index: card.multipleChoice?.correctIndex ?? null,
  };
}

function exerciseToRow(exercise: Exercise): ExerciseRow {
  return {
    id: exercise.id,
    lesson_id: exercise.lessonId,
    order: exercise.order,
    title: exercise.title,
    task: exercise.task,
    solution: exercise.solution,
    notes: exercise.notes ?? null,
    starter_code: exercise.starterCode ?? null,
    solution_code: exercise.solutionCode ?? null,
    exercise_type: exercise.gapFill ? "gap_fill" : exercise.exerciseType ?? "code",
    gap_fill: exercise.gapFill ?? null,
  };
}

export async function getLessons(): Promise<Lesson[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_lessons")
      .select("*")
      .order("order");
    if (error) throw error;
    return (data as LessonRow[]).map(mapLesson);
  }

  const lessons = await readJson<Lesson[]>(lessonsPath, []);
  return lessons.sort((a, b) => a.order - b.order);
}

export async function getPublishedLessons(): Promise<Lesson[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_lessons")
      .select("*")
      .eq("published", true)
      .order("order");
    if (error) throw error;
    return (data as LessonRow[]).map(mapLesson);
  }

  const lessons = await getLessons();
  return lessons.filter((l) => l.published);
}

export async function getLessonById(id: string): Promise<Lesson | undefined> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_lessons")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapLesson(data as LessonRow) : undefined;
  }

  const lessons = await getLessons();
  return lessons.find((l) => l.id === id);
}

export async function saveLessons(lessons: Lesson[]): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const rows = lessons.map(lessonToRow);
    const { error } = await supabase.from("pcep_lessons").upsert(rows, {
      onConflict: "id",
    });
    if (error) throw error;
    return;
  }

  await writeJson(lessonsPath, lessons);
}

export async function getCards(): Promise<Flashcard[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_flashcards")
      .select("*")
      .order("order");
    if (error) throw error;
    return (data as FlashcardRow[]).map(mapFlashcard);
  }

  const cards = await readJson<Flashcard[]>(cardsPath, []);
  return cards.sort((a, b) => a.order - b.order);
}

export async function getCardsByLesson(lessonId: string): Promise<Flashcard[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_flashcards")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order");
    if (error) throw error;
    return (data as FlashcardRow[]).map(mapFlashcard);
  }

  const cards = await getCards();
  return cards
    .filter((c) => c.lessonId === lessonId)
    .sort((a, b) => a.order - b.order);
}

export async function saveCards(cards: Flashcard[]): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("pcep_flashcards")
      .upsert(cards.map(flashcardToRow), { onConflict: "id" });
    if (error) throw error;
    return;
  }

  await writeJson(cardsPath, cards);
}

export async function getExercises(): Promise<Exercise[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_exercises")
      .select("*")
      .order("order");
    if (error) throw error;
    return (data as ExerciseRow[]).map(mapExercise);
  }

  const exercises = await readJson<Exercise[]>(exercisesPath, []);
  return exercises.sort((a, b) => a.order - b.order);
}

export async function getExercisesByLesson(lessonId: string): Promise<Exercise[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_exercises")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order");
    if (error) throw error;
    return (data as ExerciseRow[]).map(mapExercise);
  }

  const exercises = await getExercises();
  return exercises
    .filter((e) => e.lessonId === lessonId)
    .sort((a, b) => a.order - b.order);
}

export async function saveExercises(exercises: Exercise[]): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("pcep_exercises")
      .upsert(exercises.map(exerciseToRow), { onConflict: "id" });
    if (error) throw error;
    return;
  }

  await writeJson(exercisesPath, exercises);
}

export async function getProgress(): Promise<SiteProgress> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    const { data: site, error: siteErr } = await supabase
      .from("pcep_site_progress")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    if (siteErr) throw siteErr;

    const { data: lessonRows, error: lpErr } = await supabase
      .from("pcep_lesson_progress")
      .select("*");

    if (lpErr) throw lpErr;

    return {
      learnerName: site?.learner_name ?? "",
      onboarded: site?.onboarded ?? Boolean(site?.learner_name),
      lessonProgress: (lessonRows ?? []).map((lp) => ({
        lessonId: lp.lesson_id,
        completedCardIds: lp.completed_card_ids ?? [],
        completedExerciseIds: lp.completed_exercise_ids ?? [],
        lessonCompleted: lp.lesson_completed ?? false,
        completedAt: lp.completed_at ?? undefined,
      })),
      updatedAt: site?.updated_at ?? new Date().toISOString(),
      progressResetAt: site?.progress_reset_at ?? undefined,
    };
  }

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
    progressResetAt: raw.progressResetAt,
  };
}

export async function getProgressResetAt(): Promise<string | null> {
  const progress = await getProgress();
  return progress.progressResetAt ?? null;
}

function isServerlessDeployment(): boolean {
  return Boolean(process.env.VERCEL);
}

/** Setzt Lernmonitor und Fortschritt zurück; Lektionen, Karten und Namen bleiben. */
export async function resetAllProgress(): Promise<string> {
  const resetAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.rpc("pcep_reset_all_progress");
    if (error) throw error;

    if (typeof data === "string" && data) {
      return data;
    }

    return resetAt;
  }

  if (isServerlessDeployment()) {
    throw new Error(
      "Supabase ist auf Vercel nicht konfiguriert. Bitte NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY als Umgebungsvariablen setzen.",
    );
  }

  const learners = await readJson<StoredLearner[]>(learnersPath, []);
  const clearedLearners = learners.map((learner) => ({
    ...learner,
    lessonProgress: [],
    updatedAt: resetAt,
  }));
  await writeJson(learnersPath, clearedLearners);

  await writeJson(progressPath, {
    learnerName: "",
    onboarded: false,
    lessonProgress: [],
    updatedAt: resetAt,
    progressResetAt: resetAt,
  } satisfies SiteProgress);

  return resetAt;
}

export async function saveProgress(progress: SiteProgress): Promise<void> {
  progress.updatedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();

    const { error: siteErr } = await supabase.from("pcep_site_progress").upsert(
      {
        id: "default",
        learner_name: progress.learnerName,
        onboarded: progress.onboarded,
        updated_at: progress.updatedAt,
      },
      { onConflict: "id" },
    );
    if (siteErr) throw siteErr;

    if (progress.lessonProgress.length > 0) {
      const rows = progress.lessonProgress.map((lp) => ({
        lesson_id: lp.lessonId,
        completed_card_ids: lp.completedCardIds,
        completed_exercise_ids: lp.completedExerciseIds ?? [],
        lesson_completed: lp.lessonCompleted,
        completed_at: lp.completedAt ?? null,
      }));

      const { error: lpErr } = await supabase
        .from("pcep_lesson_progress")
        .upsert(rows, { onConflict: "lesson_id" });
      if (lpErr) throw lpErr;
    }

    return;
  }

  await writeJson(progressPath, progress);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type LearnerRow = {
  id: string;
  display_name: string;
  lesson_progress: LessonProgress[];
  maze_completed_levels?: number[] | null;
  expert_completed_levels?: number[] | null;
  pcep_challenge_completed?: boolean | null;
  updated_at: string;
};

function mapLearner(row: LearnerRow): StoredLearner {
  return {
    id: row.id,
    displayName: row.display_name,
    lessonProgress: row.lesson_progress ?? [],
    mazeCompletedLevels: row.maze_completed_levels ?? [],
    expertCompletedLevels: row.expert_completed_levels ?? [],
    pcepChallengeCompleted: Boolean(row.pcep_challenge_completed),
    updatedAt: row.updated_at,
  };
}

export async function getLearnerRecords(): Promise<StoredLearner[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_learners")
      .select("*")
      .neq("display_name", "")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return dedupeStoredLearnersByName(
      (data ?? []).map((row) => mapLearner(row as LearnerRow)),
    );
  }

  return dedupeStoredLearnersByName(
    await readJson<StoredLearner[]>(learnersPath, []),
  );
}

export async function deleteLearnerRecords(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("pcep_learners")
      .delete()
      .in("id", ids);
    if (error) throw error;
    return;
  }

  const learners = await readJson<StoredLearner[]>(learnersPath, []);
  const remaining = learners.filter((learner) => !ids.includes(learner.id));
  await writeJson(learnersPath, remaining);
}

async function pruneStaleLearnerDuplicates(
  currentId: string,
  displayName: string,
  lessonProgress: LessonProgress[],
): Promise<void> {
  const learners = await getLearnerRecords();
  const staleIds = learners
    .filter((learner) =>
      isStaleLearnerDuplicate(learner, currentId, displayName, lessonProgress),
    )
    .map((learner) => learner.id);

  await deleteLearnerRecords(staleIds);
}

export async function upsertLearnerRecord(
  id: string,
  displayName: string,
  lessonProgress: LessonProgress[],
  mazeCompletedLevels: number[] = [],
  pcepChallengeCompleted = false,
  expertCompletedLevels: number[] = [],
): Promise<StoredLearner> {
  const updatedAt = new Date().toISOString();
  const trimmedName = displayName.trim();
  const normalizedMazeLevels = [...new Set(mazeCompletedLevels.filter((level) => level >= 1 && level <= 4))].sort(
    (a, b) => a - b,
  );
  const normalizedExpertLevels = [...new Set(expertCompletedLevels.filter((level) => level >= 1 && level <= 3))].sort(
    (a, b) => a - b,
  );

  let mergedLessonProgress = lessonProgress;
  let mergedMazeLevels = normalizedMazeLevels;
  let mergedExpertLevels = normalizedExpertLevels;
  let mergedPcepChallenge = pcepChallengeCompleted;

  if (isSupabaseConfigured()) {
    const { data: existingRow } = await getSupabaseAdmin()
      .from("pcep_learners")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (existingRow) {
      const merged = mergeLearnerUpsertPayload(mapLearner(existingRow as LearnerRow), {
        lessonProgress,
        mazeCompletedLevels: normalizedMazeLevels,
        expertCompletedLevels: normalizedExpertLevels,
        pcepChallengeCompleted,
      });
      mergedLessonProgress = merged.lessonProgress;
      mergedMazeLevels = merged.mazeCompletedLevels;
      mergedExpertLevels = merged.expertCompletedLevels;
      mergedPcepChallenge = merged.pcepChallengeCompleted;
    }
  } else {
    const learners = await readJson<StoredLearner[]>(learnersPath, []);
    const existing = learners.find((learner) => learner.id === id);
    if (existing) {
      const merged = mergeLearnerUpsertPayload(existing, {
        lessonProgress,
        mazeCompletedLevels: normalizedMazeLevels,
        expertCompletedLevels: normalizedExpertLevels,
        pcepChallengeCompleted,
      });
      mergedLessonProgress = merged.lessonProgress;
      mergedMazeLevels = merged.mazeCompletedLevels;
      mergedExpertLevels = merged.expertCompletedLevels;
      mergedPcepChallenge = merged.pcepChallengeCompleted;
    }
  }

  await pruneStaleLearnerDuplicates(id, trimmedName, mergedLessonProgress);

  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_learners")
      .upsert(
        {
          id,
          display_name: trimmedName,
          lesson_progress: mergedLessonProgress,
          maze_completed_levels: mergedMazeLevels,
          expert_completed_levels: mergedExpertLevels,
          pcep_challenge_completed: mergedPcepChallenge,
          updated_at: updatedAt,
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (error) throw error;
    return mapLearner(data as LearnerRow);
  }

  const learners = await readJson<StoredLearner[]>(learnersPath, []);
  const next: StoredLearner = {
    id,
    displayName: trimmedName,
    lessonProgress: mergedLessonProgress,
    mazeCompletedLevels: mergedMazeLevels,
    expertCompletedLevels: mergedExpertLevels,
    pcepChallengeCompleted: mergedPcepChallenge,
    updatedAt,
  };
  const idx = learners.findIndex((learner) => learner.id === id);
  if (idx >= 0) learners[idx] = next;
  else learners.push(next);
  await writeJson(learnersPath, learners);
  return next;
}

type MazeScoreRow = {
  visitor_id: string;
  level_id: number;
  display_name: string;
  execute_count: number;
  achieved_at: string;
};

function mapMazeScore(row: MazeScoreRow): MazeHighscoreEntry {
  return {
    visitorId: row.visitor_id,
    displayName: row.display_name,
    levelId: row.level_id,
    executeCount: row.execute_count,
    achievedAt: row.achieved_at,
  };
}

export async function getMazeHighscoresForLevel(
  levelId: number,
): Promise<MazeHighscoreEntry[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_maze_scores")
      .select("*")
      .eq("level_id", levelId)
      .neq("display_name", "")
      .order("execute_count", { ascending: true })
      .order("achieved_at", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((row) => mapMazeScore(row as MazeScoreRow));
  }

  const all = await readJson<MazeHighscoreEntry[]>(mazeScoresPath, []);
  return sortMazeHighscores(all.filter((entry) => entry.levelId === levelId));
}

export async function upsertMazeHighscore(
  visitorId: string,
  displayName: string,
  levelId: number,
  executeCount: number,
): Promise<MazeHighscoreEntry> {
  const trimmedName = displayName.trim().slice(0, 40) || "Spieler";
  const achievedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const { data: existing, error: readError } = await getSupabaseAdmin()
      .from("pcep_maze_scores")
      .select("*")
      .eq("visitor_id", visitorId)
      .eq("level_id", levelId)
      .maybeSingle();

    if (readError) throw readError;

    const current = existing as MazeScoreRow | null;
    if (current && executeCount >= current.execute_count) {
      return mapMazeScore(current);
    }

    const { data, error } = await getSupabaseAdmin()
      .from("pcep_maze_scores")
      .upsert(
        {
          visitor_id: visitorId,
          level_id: levelId,
          display_name: trimmedName,
          execute_count: executeCount,
          achieved_at: achievedAt,
        },
        { onConflict: "visitor_id,level_id" },
      )
      .select("*")
      .single();

    if (error) throw error;
    return mapMazeScore(data as MazeScoreRow);
  }

  const all = await readJson<MazeHighscoreEntry[]>(mazeScoresPath, []);
  const idx = all.findIndex(
    (entry) => entry.visitorId === visitorId && entry.levelId === levelId,
  );
  const next: MazeHighscoreEntry = {
    visitorId,
    displayName: trimmedName,
    levelId,
    executeCount,
    achievedAt,
  };

  if (idx >= 0) {
    if (executeCount < all[idx].executeCount) {
      all[idx] = next;
    } else {
      all[idx] = { ...all[idx], displayName: trimmedName };
    }
    await writeJson(mazeScoresPath, all);
    return all[idx];
  }

  all.push(next);
  await writeJson(mazeScoresPath, all);
  return next;
}

type GuestbookRow = {
  id: string;
  visitor_id: string | null;
  author_name: string;
  comment: string;
  stars: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

function mapGuestbookEntry(row: GuestbookRow): GuestbookEntry {
  return {
    id: row.id,
    visitorId: row.visitor_id ?? undefined,
    authorName: row.author_name,
    comment: row.comment,
    stars: row.stars,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function guestbookToRow(entry: GuestbookEntry): GuestbookRow {
  return {
    id: entry.id,
    visitor_id: entry.visitorId ?? null,
    author_name: entry.authorName,
    comment: entry.comment,
    stars: entry.stars,
    active: entry.active,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  };
}

export async function getGuestbookEntries(activeOnly = false): Promise<GuestbookEntry[]> {
  if (isSupabaseConfigured()) {
    let query = getSupabaseAdmin()
      .from("pcep_guestbook_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (activeOnly) {
      query = query.eq("active", true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => mapGuestbookEntry(row as GuestbookRow));
  }

  const entries = await readJson<GuestbookEntry[]>(guestbookPath, []);
  return activeOnly ? entries.filter((entry) => entry.active) : entries;
}

export async function hasGuestbookEntryForVisitor(visitorId: string): Promise<boolean> {
  if (!visitorId.trim()) return false;

  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_guestbook_entries")
      .select("id")
      .eq("visitor_id", visitorId)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  }

  const entries = await readJson<GuestbookEntry[]>(guestbookPath, []);
  return entries.some((entry) => entry.visitorId === visitorId);
}

export async function createGuestbookEntry(input: {
  visitorId?: string;
  authorName: string;
  comment: string;
  stars: number;
}): Promise<GuestbookEntry> {
  const now = new Date().toISOString();
  const trimmedName = input.authorName.trim().slice(0, 40);
  const trimmedComment = input.comment.trim().slice(0, 500);
  const stars = Math.min(5, Math.max(1, Math.round(input.stars)));

  if (!trimmedName) throw new Error("Name fehlt");
  if (trimmedComment.length < 5) {
    throw new Error("Bitte schreibe mindestens 5 Zeichen.");
  }

  if (input.visitorId?.trim()) {
    const exists = await hasGuestbookEntryForVisitor(input.visitorId.trim());
    if (exists) throw new Error("Du hast bereits einen Gästebucheintrag hinterlassen.");
  }

  const entry: GuestbookEntry = {
    id: crypto.randomUUID(),
    visitorId: input.visitorId?.trim() || undefined,
    authorName: trimmedName,
    comment: trimmedComment,
    stars,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_guestbook_entries")
      .insert(guestbookToRow(entry))
      .select("*")
      .single();

    if (error) throw error;
    return mapGuestbookEntry(data as GuestbookRow);
  }

  const entries = await readJson<GuestbookEntry[]>(guestbookPath, []);
  entries.unshift(entry);
  await writeJson(guestbookPath, entries);
  return entry;
}

export async function updateGuestbookEntry(
  id: string,
  patch: Partial<Pick<GuestbookEntry, "authorName" | "comment" | "stars" | "active">>,
): Promise<GuestbookEntry> {
  const entries = await getGuestbookEntries();
  const current = entries.find((entry) => entry.id === id);
  if (!current) throw new Error("Eintrag nicht gefunden");

  const next: GuestbookEntry = {
    ...current,
    authorName: patch.authorName?.trim().slice(0, 40) ?? current.authorName,
    comment: patch.comment?.trim().slice(0, 500) ?? current.comment,
    stars:
      patch.stars !== undefined
        ? Math.min(5, Math.max(1, Math.round(patch.stars)))
        : current.stars,
    active: patch.active ?? current.active,
    updatedAt: new Date().toISOString(),
  };

  if (!next.authorName.trim()) throw new Error("Name fehlt");
  if (next.comment.trim().length < 5) {
    throw new Error("Kommentar zu kurz");
  }

  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_guestbook_entries")
      .update(guestbookToRow(next))
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return mapGuestbookEntry(data as GuestbookRow);
  }

  const all = await readJson<GuestbookEntry[]>(guestbookPath, []);
  const idx = all.findIndex((entry) => entry.id === id);
  if (idx < 0) throw new Error("Eintrag nicht gefunden");
  all[idx] = next;
  await writeJson(guestbookPath, all);
  return next;
}

export async function deleteGuestbookEntry(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("pcep_guestbook_entries")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return;
  }

  const entries = await readJson<GuestbookEntry[]>(guestbookPath, []);
  await writeJson(
    guestbookPath,
    entries.filter((entry) => entry.id !== id),
  );
}

type VisitorHitRow = {
  id: string;
  visitor_id: string;
  visit_date: string;
  path: string;
  created_at: string;
};

function mapVisitorHit(row: VisitorHitRow): VisitorHit {
  return {
    id: row.id,
    visitorId: row.visitor_id,
    visitDate: row.visit_date,
    path: row.path,
    createdAt: row.created_at,
  };
}

export async function recordVisitorHit(
  visitorId: string,
  path = "/",
): Promise<void> {
  const trimmedId = visitorId.trim();
  if (!trimmedId) return;

  const visitDate = new Date().toISOString().slice(0, 10);
  const normalizedPath = path.trim().slice(0, 120) || "/";
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin()
      .from("pcep_visitor_hits")
      .upsert(
        {
          visitor_id: trimmedId,
          visit_date: visitDate,
          path: normalizedPath,
          created_at: now,
        },
        { onConflict: "visitor_id,visit_date", ignoreDuplicates: true },
      );

    if (error) throw error;
    return;
  }

  const hits = await readJson<VisitorHit[]>(visitorHitsPath, []);
  const exists = hits.some(
    (hit) => hit.visitorId === trimmedId && hit.visitDate === visitDate,
  );
  if (exists) return;

  hits.push({
    id: crypto.randomUUID(),
    visitorId: trimmedId,
    visitDate,
    path: normalizedPath,
    createdAt: now,
  });
  await writeJson(visitorHitsPath, hits);
}

function buildVisitorStatsFromHits(
  hits: VisitorHit[],
  weeks = 4,
): VisitorStatsSummary {
  const daysBack = weeks * 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - (daysBack - 1));

  const byDate = new Map<string, Set<string>>();
  for (const hit of hits) {
    const date = hit.visitDate;
    if (!byDate.has(date)) byDate.set(date, new Set());
    byDate.get(date)!.add(hit.visitorId);
  }

  const days: VisitorStatsSummary["days"] = [];
  for (let i = 0; i < daysBack; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    days.push({
      date: key,
      uniqueVisitors: byDate.get(key)?.size ?? 0,
    });
  }

  const allVisitorIds = new Set<string>();
  for (const day of days) {
    const visitors = byDate.get(day.date);
    visitors?.forEach((id) => allVisitorIds.add(id));
  }

  const thisWeek = days.slice(-7).reduce((sum, day) => sum + day.uniqueVisitors, 0);
  const lastWeek = days.slice(-14, -7).reduce((sum, day) => sum + day.uniqueVisitors, 0);

  return {
    days,
    totalUniqueVisitors: allVisitorIds.size,
    thisWeek,
    lastWeek,
    weeks,
  };
}

export async function getVisitorStats(weeks = 4): Promise<VisitorStatsSummary> {
  const daysBack = weeks * 7;
  const since = new Date();
  since.setDate(since.getDate() - (daysBack - 1));
  const sinceKey = since.toISOString().slice(0, 10);

  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseAdmin()
      .from("pcep_visitor_hits")
      .select("id, visitor_id, visit_date, path, created_at")
      .gte("visit_date", sinceKey)
      .order("visit_date", { ascending: true });

    if (error) throw error;
    return buildVisitorStatsFromHits(
      (data ?? []).map((row) => mapVisitorHit(row as VisitorHitRow)),
      weeks,
    );
  }

  const hits = await readJson<VisitorHit[]>(visitorHitsPath, []);
  return buildVisitorStatsFromHits(
    hits.filter((hit) => hit.visitDate >= sinceKey),
    weeks,
  );
}
