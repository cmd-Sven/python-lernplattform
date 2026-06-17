"use client";

import Link from "next/link";
import AchievementBadge from "@/components/AchievementBadge";
import {
  getExpertMedalIcon,
  getExpertMedalTitle,
} from "@/lib/achievements";
import { EXPERT_LEVEL_COUNT } from "@/lib/expert/tasks";

interface PytoExpertTasksRewardProps {
  completedLevels: number[];
}

function levelStatusBadge(levelId: number, completedLevels: number[]) {
  const done = completedLevels.includes(levelId);
  if (done) return { className: "badge-success", text: "✓" };
  if (levelId === 1) return { className: "badge-outline", text: "offen" };
  const prevDone = completedLevels.includes(levelId - 1);
  if (prevDone) return { className: "badge-outline", text: "freigeschaltet" };
  return { className: "badge-ghost", text: "🔒" };
}

export default function PytoExpertTasksReward({
  completedLevels,
}: PytoExpertTasksRewardProps) {
  return (
    <section className="rounded-2xl border-2 border-secondary/40 shadow-md mb-8 overflow-hidden bg-base-100">
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center">
        <div className="text-5xl shrink-0" aria-hidden>
          🏆
        </div>
        <div className="flex-1 text-center sm:text-left">
          <span className="badge badge-secondary badge-lg mb-2">Experten-Modus</span>
          <h2 className="text-2xl font-bold mb-2">Experten-Aufgaben</h2>
          <p className="opacity-85 mb-4">
            Du hast Lektion 3 geschafft – jetzt warten echte Code-Herausforderungen mit
            automatischer Prüfung. Pro Level zwei Aufgaben; für jedes abgeschlossene Level
            gibt es einen <strong>Ordner</strong> im Lernmonitor.
          </p>

          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start text-sm mb-4">
            {Array.from({ length: EXPERT_LEVEL_COUNT }, (_, index) => {
              const levelId = index + 1;
              const done = completedLevels.includes(levelId);
              const status = levelStatusBadge(levelId, completedLevels);
              return (
                <span key={levelId} className="inline-flex items-center gap-1">
                  {done && (
                    <AchievementBadge
                      icon={getExpertMedalIcon(levelId)}
                      title={getExpertMedalTitle(levelId)}
                      size="sm"
                    />
                  )}
                  <span className={`badge ${status.className}`}>
                    Level {levelId} {status.text}
                  </span>
                </span>
              );
            })}
          </div>

          <Link href="/experten-aufgaben" className="btn btn-secondary btn-lg">
            Zu den Experten-Aufgaben
          </Link>
        </div>
      </div>
    </section>
  );
}
