import { getOrCreateVisitorId, getVisitorState } from "./visitor";

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleLearnerBoardSync(): void {
  if (typeof window === "undefined") return;

  const { onboarded, name } = getVisitorState();
  if (!onboarded || !name.trim()) return;

  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void syncLearnerBoard();
  }, 400);
}

export async function syncLearnerBoard(): Promise<void> {
  if (typeof window === "undefined") return;

  const { onboarded, name } = getVisitorState();
  if (!onboarded || !name.trim()) return;

  const visitorId = getOrCreateVisitorId();
  const { getLessonProgressList } = await import("./visitorProgress");
  const lessonProgress = getLessonProgressList();

  try {
    await fetch("/api/learners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId,
        displayName: name.trim(),
        lessonProgress,
      }),
    });
  } catch {
    // Monitor ist optional – Fehler still ignorieren
  }
}
