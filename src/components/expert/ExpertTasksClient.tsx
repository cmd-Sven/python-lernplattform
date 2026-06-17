"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AchievementBadge from "@/components/AchievementBadge";
import {
  getExpertMedalIcon,
  getExpertMedalTitle,
} from "@/lib/achievements";
import { EXPERT_LEVEL_COUNT, getExpertTasksByLevel } from "@/lib/expert/tasks";
import {
  EXPERT_PROGRESS_EVENT,
  isExpertLevelUnlocked,
  isExpertTaskComplete,
  readExpertProgress,
} from "@/lib/expert/progress";
import type { ExpertProgress } from "@/lib/expert/types";
import ExpertCodeTask from "./ExpertCodeTask";

interface ExpertTasksClientProps {
  adminPreview?: boolean;
}

function levelStatus(levelId: number, progress: ExpertProgress) {
  const done = progress.completedLevels.includes(levelId);
  if (done) return { badge: "badge-success", text: "abgeschlossen" };
  if (isExpertLevelUnlocked(levelId, progress)) {
    return { badge: "badge-outline", text: "freigeschaltet" };
  }
  return { badge: "badge-ghost", text: "🔒 gesperrt" };
}

export default function ExpertTasksClient({
  adminPreview = false,
}: ExpertTasksClientProps) {
  const [progress, setProgress] = useState<ExpertProgress>(() => readExpertProgress());
  const [activeLevel, setActiveLevel] = useState(1);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const refreshProgress = useCallback(() => {
    setProgress(readExpertProgress());
  }, []);

  useEffect(() => {
    refreshProgress();
    const handler = () => refreshProgress();
    window.addEventListener(EXPERT_PROGRESS_EVENT, handler);
    return () => window.removeEventListener(EXPERT_PROGRESS_EVENT, handler);
  }, [refreshProgress]);

  useEffect(() => {
    const tasks = getExpertTasksByLevel(activeLevel);
    if (!activeTaskId || !tasks.some((task) => task.id === activeTaskId)) {
      setActiveTaskId(tasks[0]?.id ?? null);
    }
  }, [activeLevel, activeTaskId]);

  const activeTask = activeTaskId
    ? getExpertTasksByLevel(activeLevel).find((task) => task.id === activeTaskId) ??
      getExpertTasksByLevel(activeLevel)[0]
    : getExpertTasksByLevel(activeLevel)[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <Link href="/" className="btn btn-ghost btn-sm mb-4">
          ← Zurück
        </Link>
        <h1 className="text-3xl font-bold mb-2">Experten-Aufgaben</h1>
        <p className="opacity-80 max-w-2xl">
          Schreibe echten Python-Code und lass ihn prüfen. Jedes Level hat zwei Aufgaben –
          Level 2 und 3 schaltest du frei, wenn das vorherige Level vollständig gelöst ist.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: EXPERT_LEVEL_COUNT }, (_, index) => {
          const levelId = index + 1;
          const status = levelStatus(levelId, progress);
          const unlocked = isExpertLevelUnlocked(levelId, progress, adminPreview);
          const done = progress.completedLevels.includes(levelId);
          return (
            <button
              key={levelId}
              type="button"
              className={`btn btn-sm ${activeLevel === levelId ? "btn-primary" : "btn-outline"}`}
              disabled={!unlocked}
              onClick={() => setActiveLevel(levelId)}
            >
              {done && (
                <AchievementBadge
                  icon={getExpertMedalIcon(levelId)}
                  title={getExpertMedalTitle(levelId)}
                  size="sm"
                />
              )}
              Level {levelId}
              <span className={`badge badge-xs ml-1 ${status.badge}`}>{status.text}</span>
            </button>
          );
        })}
      </div>

      {!isExpertLevelUnlocked(activeLevel, progress, adminPreview) ? (
        <div className="alert alert-warning">
          <span>
            Level {activeLevel} ist noch gesperrt. Schließe zuerst Level {activeLevel - 1} ab
            (beide Aufgaben).
          </span>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {getExpertTasksByLevel(activeLevel).map((task) => {
              const done = isExpertTaskComplete(task.id, progress);
              return (
                <button
                  key={task.id}
                  type="button"
                  className={`btn btn-sm ${
                    activeTask?.id === task.id ? "btn-secondary" : "btn-ghost"
                  }`}
                  onClick={() => setActiveTaskId(task.id)}
                >
                  Aufgabe {task.order}: {task.title}
                  {done && <span className="badge badge-success badge-xs ml-1">✓</span>}
                </button>
              );
            })}
          </div>

          {activeTask && (
            <ExpertCodeTask
              key={activeTask.id}
              task={activeTask}
              adminPreview={adminPreview}
              onCompleted={refreshProgress}
            />
          )}
        </>
      )}
    </div>
  );
}
