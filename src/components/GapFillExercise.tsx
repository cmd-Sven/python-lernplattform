"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Exercise, GapFillGap } from "@/lib/types";
import {
  areAllGapsFilled,
  getGapById,
  isGapFillComplete,
  parseGapTemplate,
} from "@/lib/gapFill";
import { GAP_CHECK_LOADING_MESSAGES } from "@/lib/pytoTips";
import GapFillBlockPool from "./GapFillBlockPool";
import GapFillCheckLoader, { type GapCheckPhase } from "./GapFillCheckLoader";
import PytoGapBuddy, { type GapValidationFeedback } from "./PytoGapBuddy";
import PytoStickyAside from "./PytoStickyAside";
import RichContent from "./RichContent";

const CHECK_DURATION_MS = 3000;
const MESSAGE_INTERVAL_MS = 2200;
const PROGRESS_TICK_MS = 50;

interface GapFillExerciseProps {
  exercise: Exercise;
  isCompleted: boolean;
  saving: boolean;
  onToggleComplete: () => void;
}

function GapSlot({
  gap,
  assignedBlockText,
  disabled,
  onAssignBlock,
  onClearBlock,
}: {
  gap: GapFillGap;
  assignedBlockText?: string;
  disabled?: boolean;
  onAssignBlock: (blockId: string) => void;
  onClearBlock: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <span
      className={`inline-flex align-middle mx-1 my-1 min-w-[7rem] max-w-full ${
        dragOver && !disabled ? "ring-2 ring-primary rounded-lg" : ""
      }`}
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        if (disabled) return;
        event.preventDefault();
        setDragOver(false);
        const blockId = event.dataTransfer.getData("text/block-id");
        if (blockId) onAssignBlock(blockId);
      }}
    >
      {assignedBlockText ? (
        <span className="gap-slot-filled">
          <span className="gap-slot-code">{assignedBlockText}</span>
          {!disabled && (
            <button
              type="button"
              className="gap-slot-remove"
              onClick={onClearBlock}
              aria-label="Klötzchen aus der Lücke entfernen"
              title="Klötzchen entfernen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3"
                aria-hidden
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </span>
      ) : (
        <span
          className={`gap-slot-dropzone ${dragOver ? "gap-slot-dropzone--active" : ""}`}
          aria-label={`Lücke ${gap.id} – Klötzchen hierher ziehen`}
        >
          Klötzchen hierher ziehen
        </span>
      )}
    </span>
  );
}

export default function GapFillExercise({
  exercise,
  isCompleted,
  saving,
  onToggleComplete,
}: GapFillExerciseProps) {
  const gapFill = exercise.gapFill!;
  const parts = useMemo(
    () => parseGapTemplate(gapFill.template),
    [gapFill.template],
  );

  const [blockAssignments, setBlockAssignments] = useState<Record<string, string>>({});
  const [checkPhase, setCheckPhase] = useState<GapCheckPhase>(
    isCompleted ? "success" : "idle",
  );
  const [checkProgress, setCheckProgress] = useState(isCompleted ? 100 : 0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCheckTimers = useCallback(() => {
    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current);
      checkTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
      messageIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearCheckTimers();
    setBlockAssignments({});
    setCheckPhase(isCompleted ? "success" : "idle");
    setCheckProgress(isCompleted ? 100 : 0);
    setLoadingMessageIndex(0);
  }, [exercise.id, isCompleted, clearCheckTimers]);

  useEffect(() => clearCheckTimers, [clearCheckTimers]);

  const usedBlockIds = useMemo(
    () => new Set(Object.values(blockAssignments)),
    [blockAssignments],
  );

  const blockTexts = useMemo(() => {
    const texts: Record<string, string> = {};
    for (const [gapId, blockId] of Object.entries(blockAssignments)) {
      const block = gapFill.blocks.find((item) => item.id === blockId);
      if (block) texts[gapId] = block.text;
    }
    return texts;
  }, [blockAssignments, gapFill.blocks]);

  const emptyValues = useMemo(() => ({}), []);
  const allFilled = areAllGapsFilled(gapFill, emptyValues, blockAssignments);
  const inputsLocked = checkPhase === "loading" || checkPhase === "success" || isCompleted;

  const validationFeedback: GapValidationFeedback =
    checkPhase === "loading"
      ? "loading"
      : checkPhase === "success"
        ? "complete"
        : checkPhase === "error"
          ? "error"
          : "idle";

  const loadingMessage =
    GAP_CHECK_LOADING_MESSAGES[loadingMessageIndex] ?? GAP_CHECK_LOADING_MESSAGES[0];

  function resetCheckAfterEdit() {
    if (checkPhase === "error") {
      setCheckPhase("idle");
      setCheckProgress(0);
    }
  }

  function assignBlock(gapId: string, blockId: string) {
    resetCheckAfterEdit();

    setBlockAssignments((prev) => {
      const copy = { ...prev };
      for (const [existingGapId, existingBlockId] of Object.entries(copy)) {
        if (existingBlockId === blockId) {
          delete copy[existingGapId];
        }
      }
      copy[gapId] = blockId;
      return copy;
    });
  }

  function clearBlock(gapId: string) {
    resetCheckAfterEdit();
    setBlockAssignments((prev) => {
      const copy = { ...prev };
      delete copy[gapId];
      return copy;
    });
  }

  function handlePruefen() {
    if (!allFilled || checkPhase === "loading" || checkPhase === "success") return;

    clearCheckTimers();
    setCheckPhase("loading");
    setCheckProgress(0);
    setLoadingMessageIndex(0);

    const startedAt = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setCheckProgress(Math.min((elapsed / CHECK_DURATION_MS) * 100, 100));
    }, PROGRESS_TICK_MS);

    messageIntervalRef.current = setInterval(() => {
      setLoadingMessageIndex((index) => (index + 1) % GAP_CHECK_LOADING_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);

    checkTimerRef.current = setTimeout(() => {
      clearCheckTimers();

      const isCorrect = isGapFillComplete(gapFill, emptyValues, blockAssignments);

      if (isCorrect) {
        setCheckProgress(100);
        setCheckPhase("success");
        if (!isCompleted) {
          onToggleComplete();
        }
        return;
      }

      setCheckPhase("error");
    }, CHECK_DURATION_MS);
  }

  const showPruefenButton =
    allFilled && checkPhase !== "loading" && checkPhase !== "success";

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {exercise.task && <RichContent content={exercise.task} size="sm" />}

        <GapFillBlockPool
          blocks={gapFill.blocks}
          usedBlockIds={usedBlockIds}
          disabled={inputsLocked}
        />

        <div className="card bg-base-200 border border-base-300">
          <div className="card-body">
            <p className="text-xs font-semibold uppercase opacity-60 mb-3">
              Code – Lücken mit Klötzchen füllen
            </p>
            <pre
              className={`code-block text-sm leading-8 whitespace-pre overflow-x-auto rounded-lg ${
                checkPhase === "error" ? "gap-fill-code--error" : ""
              }`}
            >
              {parts.map((part, index) => {
                if (part.type === "text") {
                  return <span key={`t-${index}`}>{part.content}</span>;
                }

                const gap = getGapById(gapFill.gaps, part.id);
                if (!gap) return null;

                return (
                  <GapSlot
                    key={`g-${part.id}`}
                    gap={gap}
                    assignedBlockText={blockTexts[part.id]}
                    disabled={inputsLocked}
                    onAssignBlock={(blockId) => assignBlock(part.id, blockId)}
                    onClearBlock={() => clearBlock(part.id)}
                  />
                );
              })}
            </pre>
          </div>
        </div>

        {checkPhase !== "idle" && (
          <GapFillCheckLoader
            phase={checkPhase}
            loadingMessage={loadingMessage}
            progress={checkProgress}
          />
        )}

        {showPruefenButton && (
          <div className="flex justify-end border-t border-base-300 pt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePruefen}
              disabled={saving}
            >
              Prüfen
            </button>
          </div>
        )}
      </div>

      <PytoStickyAside>
        <PytoGapBuddy blocks={gapFill.blocks} validationFeedback={validationFeedback} />
      </PytoStickyAside>
    </div>
  );
}
