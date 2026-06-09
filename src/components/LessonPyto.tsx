"use client";

import { getPytoForLesson } from "@/lib/pyto";
import PytoMascot from "./PytoMascot";

interface LessonPytoProps {
  completedCards: number;
  totalCards: number;
  onExercise?: boolean;
}

export default function LessonPyto({
  completedCards,
  totalCards,
  onExercise = false,
}: LessonPytoProps) {
  const pyto = getPytoForLesson(completedCards, totalCards, onExercise);

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-base-100 border border-base-300 shadow-sm">
      <PytoMascot
        key={pyto.message}
        variant={pyto.variant}
        message={pyto.message}
        size="sm"
      />
    </div>
  );
}
