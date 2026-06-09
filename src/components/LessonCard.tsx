import Link from "next/link";
import type { LessonWithStats } from "@/lib/types";
import ProgressBar from "./ProgressBar";

interface LessonCardProps {
  lesson: LessonWithStats;
}

export default function LessonCard({ lesson }: LessonCardProps) {
  const statusBadge = lesson.lessonCompleted ? (
    <span className="badge badge-success gap-1">✓ Abgeschlossen</span>
  ) : lesson.completedCards > 0 ? (
    <span className="badge badge-warning">In Bearbeitung</span>
  ) : (
    <span className="badge badge-ghost">Neu</span>
  );

  return (
    <div className="card bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition-shadow">
      <div className="card-body">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="card-title text-lg">{lesson.title}</h2>
          {statusBadge}
        </div>
        {lesson.pcepTopic && (
          <p className="text-xs text-primary font-medium">{lesson.pcepTopic}</p>
        )}
        <p className="text-sm opacity-70">{lesson.description}</p>

        <div className="mt-2">
          <ProgressBar
            value={lesson.completedCards}
            max={lesson.cardCount}
            label="Lernkarten"
          />
        </div>

        <div className="card-actions justify-end mt-4">
          <Link href={`/lektion/${lesson.id}`} className="btn btn-primary btn-sm">
            {lesson.lessonCompleted ? "Wiederholen" : "Lernen"}
          </Link>
        </div>
      </div>
    </div>
  );
}
