"use client";

import { useState } from "react";
import type { Flashcard } from "@/lib/types";
import type { PytoAnswerFeedback } from "./PytoTipBuddy";
import CodeBlock from "./CodeBlock";
import RichContent from "./RichContent";

interface MultipleChoiceCardProps {
  card: Flashcard;
  onAnsweredCorrectly: () => void;
  onAnswerFeedbackChange?: (feedback: PytoAnswerFeedback) => void;
}

export default function MultipleChoiceCard({
  card,
  onAnsweredCorrectly,
  onAnswerFeedbackChange,
}: MultipleChoiceCardProps) {
  const options = card.multipleChoice?.options ?? [];
  const correctIndex = card.multipleChoice?.correctIndex ?? 0;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selectedIndex === correctIndex;

  function handleSelect(index: number) {
    if (submitted && isCorrect) return;
    setSelectedIndex(index);
    setSubmitted(false);
    onAnswerFeedbackChange?.(null);
  }

  function handleCheck() {
    if (selectedIndex === null) return;
    setSubmitted(true);
    const correct = selectedIndex === correctIndex;
    onAnswerFeedbackChange?.(correct ? "correct" : "wrong");
    if (correct) {
      onAnsweredCorrectly();
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300 w-full">
      <div className="card-body min-h-0 justify-between gap-6">
        <div>
          <span className="badge badge-outline mb-3">Multiple Choice</span>
          <RichContent content={card.question} size="lg" className="font-medium" />
          {card.codeExample && <CodeBlock code={card.codeExample} />}
        </div>

        <div className="flex flex-col gap-2" role="listbox" aria-label="Antwortmöglichkeiten">
          {options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const showResult = submitted && isSelected;
            const isOptionCorrect = index === correctIndex;

            let optionClass = "mc-option";
            if (!submitted) {
              if (isSelected) optionClass += " mc-option--selected";
            } else if (showResult) {
              optionClass += isOptionCorrect
                ? " mc-option--correct"
                : " mc-option--wrong";
            } else if (isOptionCorrect) {
              optionClass += " mc-option--correct-hint";
            } else {
              optionClass += " mc-option--dimmed";
            }

            let badgeClass = "mc-option-badge";
            if (!submitted && isSelected) badgeClass += " mc-option-badge--selected";
            if (submitted && isOptionCorrect) badgeClass += " mc-option-badge--correct";
            if (showResult && !isOptionCorrect) badgeClass += " mc-option-badge--wrong";

            return (
              <button
                key={index}
                type="button"
                className={optionClass}
                onClick={() => handleSelect(index)}
                disabled={submitted && isCorrect}
                role="option"
                aria-selected={isSelected}
              >
                <span className={badgeClass}>
                  {String.fromCharCode(65 + index)}
                </span>
                <RichContent content={option} size="sm" className="flex-1 mc-option-text" />
              </button>
            );
          })}
        </div>

        {submitted && isCorrect && (
          <div className="rounded-xl border border-success/30 bg-success/10 p-4">
            <RichContent content={card.answer} size="base" className="font-semibold" />
            {card.detail && (
              <RichContent content={card.detail} size="sm" className="mt-3 opacity-90" />
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCheck}
            disabled={selectedIndex === null || (submitted && isCorrect)}
          >
            {submitted && isCorrect ? "Richtig!" : "Antwort prüfen"}
          </button>
        </div>
      </div>
    </div>
  );
}
