"use client";

import { useState } from "react";
import LessonCompleteModal from "./LessonCompleteModal";

interface LessonAchievementBadgeProps {
  lessonTitle: string;
  show: boolean;
}

export default function LessonAchievementBadge({
  lessonTitle,
  show,
}: LessonAchievementBadgeProps) {
  const [open, setOpen] = useState(false);

  if (!show) return null;

  return (
    <>
      <button
        type="button"
        className="lesson-achievement-badge"
        onClick={() => setOpen(true)}
        title="Erfolg nochmal ansehen"
        aria-label="Lektions-Erfolg mit Pyto-Video ansehen"
      >
        <span className="lesson-achievement-badge__ribbon" aria-hidden />
        <span className="lesson-achievement-badge__medal" aria-hidden>
          ★
        </span>
      </button>

      <LessonCompleteModal
        open={open}
        lessonTitle={lessonTitle}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
