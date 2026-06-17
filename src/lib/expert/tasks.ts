import expertTasksJson from "../../../data/expert-tasks.json";
import type { ExpertTask } from "./types";

const TASKS = expertTasksJson as ExpertTask[];

export function getExpertTasks(): ExpertTask[] {
  return [...TASKS].sort((a, b) => a.levelId - b.levelId || a.order - b.order);
}

export function getExpertTaskById(id: string): ExpertTask | undefined {
  return TASKS.find((task) => task.id === id);
}

export function getExpertTasksByLevel(levelId: number): ExpertTask[] {
  return getExpertTasks().filter((task) => task.levelId === levelId);
}

export function getExpertLevelTaskIds(levelId: number): string[] {
  return getExpertTasksByLevel(levelId).map((task) => task.id);
}

export const EXPERT_LEVEL_COUNT = 3;
