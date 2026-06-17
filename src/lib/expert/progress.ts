import { hasEverCompletedLesson } from "../lessonCompletion";
import type { LessonProgress } from "../types";
import {
  EXPERT_LEVEL_COUNT,
  getExpertLevelTaskIds,
  getExpertTasks,
} from "./tasks";
import type { ExpertProgress } from "./types";

export const EXPERT_PROGRESS_KEY = "pcep-expert-progress";
export const EXPERT_PROGRESS_EVENT = "pcep-expert-progress-updated";

const DEFAULT_PROGRESS: ExpertProgress = {
  completedTaskIds: [],
  completedLevels: [],
  lastLevel: 1,
};

function deriveCompletedLevels(completedTaskIds: string[]): number[] {
  const levels: number[] = [];
  for (let levelId = 1; levelId <= EXPERT_LEVEL_COUNT; levelId++) {
    const taskIds = getExpertLevelTaskIds(levelId);
    if (taskIds.every((id) => completedTaskIds.includes(id))) {
      levels.push(levelId);
    }
  }
  return levels;
}

export function isExpertTasksUnlocked(lessonProgress: LessonProgress[]): boolean {
  const lesson3 = lessonProgress.find((item) => item.lessonId === "lektion-3");
  return hasEverCompletedLesson(lesson3);
}

export function readExpertProgress(): ExpertProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(EXPERT_PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as ExpertProgress;
    const completedTaskIds = parsed.completedTaskIds ?? [];
    const completedLevels = deriveCompletedLevels(completedTaskIds);
    return {
      completedTaskIds,
      completedLevels,
      lastLevel: parsed.lastLevel ?? 1,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function writeExpertProgress(progress: ExpertProgress): void {
  if (typeof window === "undefined") return;
  const completedLevels = deriveCompletedLevels(progress.completedTaskIds);
  const next: ExpertProgress = {
    ...progress,
    completedLevels,
  };
  localStorage.setItem(EXPERT_PROGRESS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EXPERT_PROGRESS_EVENT));
}

export function isExpertLevelUnlocked(
  levelId: number,
  progress: ExpertProgress,
  adminPreview = false,
): boolean {
  if (adminPreview) return true;
  if (levelId === 1) return true;
  return progress.completedLevels.includes(levelId - 1);
}

export function isExpertTaskComplete(taskId: string, progress: ExpertProgress): boolean {
  return progress.completedTaskIds.includes(taskId);
}

export function markExpertTaskComplete(
  taskId: string,
  levelId: number,
): ExpertProgress {
  const current = readExpertProgress();
  const completedTaskIds = current.completedTaskIds.includes(taskId)
    ? current.completedTaskIds
    : [...current.completedTaskIds, taskId];
  const completedLevels = deriveCompletedLevels(completedTaskIds);
  const next: ExpertProgress = {
    completedTaskIds,
    completedLevels,
    lastLevel: levelId,
  };
  writeExpertProgress(next);
  return next;
}

export function resetExpertProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(EXPERT_PROGRESS_KEY);
  window.dispatchEvent(new CustomEvent(EXPERT_PROGRESS_EVENT));
}

export function getExpertTaskCount(): number {
  return getExpertTasks().length;
}
