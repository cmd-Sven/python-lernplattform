import { isAdminPreviewActive } from "./adminPreview";
import { normalizeCompletionCount } from "./lessonCompletion";
import { getOrCreateVisitorId, getVisitorState } from "./visitor";
import { learnerProgressScore } from "./learnerDedup";
import { replaceLessonProgressList, getLessonProgressList } from "./visitorProgress";

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleLearnerBoardSync(): void {
  if (typeof window === "undefined") return;
  if (isAdminPreviewActive()) return;

  const { onboarded, name } = getVisitorState();
  if (!onboarded || !name.trim()) return;

  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void syncLearnerBoard();
  }, 400);
}

export async function restoreLearnerProgressFromServerIfNeeded(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (isAdminPreviewActive()) return false;

  const { onboarded } = getVisitorState();
  if (!onboarded) return false;

  if (learnerProgressScore(getLessonProgressList()) > 0) return false;

  const visitorId = getOrCreateVisitorId();
  try {
    const res = await fetch(
      `/api/learners?visitorId=${encodeURIComponent(visitorId)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return false;

    const data = (await res.json()) as {
      savedRecord?: {
        lessonProgress: import("./types").LessonProgress[];
        mazeCompletedLevels: number[];
        expertCompletedLevels: number[];
        pcepChallengeCompleted: boolean;
      } | null;
    };

    const saved = data.savedRecord;
    if (!saved || learnerProgressScore(saved.lessonProgress ?? []) === 0) {
      return false;
    }

    replaceLessonProgressList(saved.lessonProgress, { skipSync: true });

    const { writeMazeProgress } = await import("./maze/progress");
    const mazeLevels = saved.mazeCompletedLevels ?? [];
    if (mazeLevels.length > 0) {
      writeMazeProgress({
        completedLevels: mazeLevels,
        lastLevel: Math.max(...mazeLevels),
      });
    }

    if (saved.pcepChallengeCompleted) {
      const { writePcepChallengeProgress } = await import("./pcepChallenge/progress");
      writePcepChallengeProgress({
        completed: true,
        bestTimeMs: null,
        lastTimeMs: null,
        attemptCount: 1,
      });
    }

    const expertLevels = saved.expertCompletedLevels ?? [];
    if (expertLevels.length > 0) {
      const { getExpertLevelTaskIds } = await import("./expert/tasks");
      const { writeExpertProgress } = await import("./expert/progress");
      const completedTaskIds = expertLevels.flatMap((levelId) =>
        getExpertLevelTaskIds(levelId),
      );
      writeExpertProgress({
        completedTaskIds,
        completedLevels: expertLevels,
        lastLevel: Math.max(...expertLevels),
      });
    }

    return true;
  } catch {
    return false;
  }
}

export async function syncLearnerBoard(): Promise<void> {
  if (typeof window === "undefined") return;
  if (isAdminPreviewActive()) return;

  const { onboarded, name } = getVisitorState();
  if (!onboarded || !name.trim()) return;

  const visitorId = getOrCreateVisitorId();
  const { getLessonProgressList } = await import("./visitorProgress");
  const lessonProgress = getLessonProgressList().map((lp) => {
    normalizeCompletionCount(lp);
    return lp;
  });

  try {
    const { readMazeProgress } = await import("./maze/progress");
    const { readPcepChallengeProgress } = await import("./pcepChallenge/progress");
    const { readExpertProgress } = await import("./expert/progress");
    const mazeCompletedLevels = readMazeProgress().completedLevels;
    const pcepChallengeCompleted = readPcepChallengeProgress().completed;
    const expertCompletedLevels = readExpertProgress().completedLevels;

    await fetch("/api/learners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId,
        displayName: name.trim(),
        lessonProgress,
        mazeCompletedLevels,
        pcepChallengeCompleted,
        expertCompletedLevels,
      }),
    });
  } catch {
    // Monitor ist optional – Fehler still ignorieren
  }
}
