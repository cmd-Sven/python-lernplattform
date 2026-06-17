"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ExpertTask } from "@/lib/expert/types";
import { getExpertTip } from "@/lib/expert/validate";
import { PYTO_IMAGES, type PytoVariant } from "@/lib/pyto";
import RichContent from "../RichContent";

export type ExpertTaskFeedback = "idle" | "checking" | "success" | "error";

interface ExpertPytoBuddyProps {
  task: ExpertTask;
  feedback: ExpertTaskFeedback;
  tipIndex: number;
  completed: boolean;
}

export default function ExpertPytoBuddy({
  task,
  feedback,
  tipIndex,
  completed,
}: ExpertPytoBuddyProps) {
  const [message, setMessage] = useState(task.pytoIntroMessage);

  useEffect(() => {
    if (completed) {
      setMessage("Stark! Diese Experten-Aufgabe hast du gemeistert. 🎉");
      return;
    }
    if (feedback === "success") {
      setMessage("Perfekt! Dein Code ist korrekt – Experten-Level geschafft!");
      return;
    }
    if (feedback === "error" && tipIndex >= 0) {
      setMessage(getExpertTip(task, tipIndex));
      return;
    }
    if (feedback === "checking") {
      setMessage("Moment … ich schaue mir deinen Code an.");
      return;
    }
    setMessage(task.pytoIntroMessage);
  }, [task, feedback, tipIndex, completed]);

  function getVariant(): PytoVariant {
    if (completed || feedback === "success") return "erfolg";
    if (feedback === "error") return "verwirrt";
    if (feedback === "checking") return "nachdenklich";
    return "froehlich";
  }

  const bubbleClass =
    completed || feedback === "success"
      ? "border-success/40 bg-success/5"
      : feedback === "error"
        ? "border-warning/40 bg-warning/5"
        : "border-base-300 bg-base-100";

  return (
    <div className="pyto-buddy flex flex-col items-center gap-3 w-full md:max-w-[220px] shrink-0">
      <div className="relative">
        <Image
          src={PYTO_IMAGES[getVariant()]}
          alt="Pyto"
          width={140}
          height={140}
          className="drop-shadow-lg object-contain"
          priority
        />
      </div>
      <div className="pyto-bubble-side w-full">
        <div
          className={`border-2 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md min-h-[5rem] ${bubbleClass}`}
        >
          <p className="text-xs font-semibold text-primary mb-1">Pyto</p>
          <RichContent content={message} size="sm" />
          {feedback === "error" && tipIndex < task.tips.length - 1 && (
            <p className="text-xs opacity-50 mt-2">
              Tipp {tipIndex + 1}/{task.tips.length} – nochmal prüfen!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
