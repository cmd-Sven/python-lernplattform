"use client";

import Image from "next/image";
import { useState } from "react";
import { PYTO_DECOY_MESSAGE, hasDecoyBlocks } from "@/lib/gapFill";
import { useStablePytoMessage } from "@/lib/useStablePytoMessage";
import { PYTO_IMAGES, type PytoVariant } from "@/lib/pyto";
import {
  DEFAULT_GAP_CHECKING_MESSAGES,
  DEFAULT_GAP_COMPLETE_MESSAGES,
  DEFAULT_GAP_ERROR_MESSAGES,
  pickRandom,
} from "@/lib/pytoTips";
import type { GapFillBlock } from "@/lib/types";
import RichContent from "./RichContent";

export type GapValidationFeedback =
  | "idle"
  | "loading"
  | "incomplete"
  | "complete"
  | "error";

interface PytoGapBuddyProps {
  blocks: GapFillBlock[];
  validationFeedback?: GapValidationFeedback;
}

function resolveGapBuddyMessage(
  validationFeedback: GapValidationFeedback,
  decoyTipRevealed: boolean,
  blocks: GapFillBlock[],
): string {
  if (validationFeedback === "complete") {
    return pickRandom(DEFAULT_GAP_COMPLETE_MESSAGES);
  }
  if (validationFeedback === "error") {
    return pickRandom(DEFAULT_GAP_ERROR_MESSAGES);
  }
  if (validationFeedback === "loading") {
    return pickRandom(DEFAULT_GAP_CHECKING_MESSAGES);
  }
  if (decoyTipRevealed && hasDecoyBlocks(blocks)) {
    return PYTO_DECOY_MESSAGE;
  }
  return "Zieh die **Klötzchen aus dem Pool** in die Lücken – nicht alles gehört hinein! Klick mich für einen Tipp.";
}

export default function PytoGapBuddy({
  blocks,
  validationFeedback = "idle",
}: PytoGapBuddyProps) {
  const [decoyTipRevealed, setDecoyTipRevealed] = useState(false);

  const messageStateKey = `${validationFeedback}:${decoyTipRevealed}`;

  const displayMessage = useStablePytoMessage(messageStateKey, () =>
    resolveGapBuddyMessage(validationFeedback, decoyTipRevealed, blocks),
  );

  function handleClick() {
    if (validationFeedback === "loading" || validationFeedback === "complete") return;
    if (hasDecoyBlocks(blocks)) {
      setDecoyTipRevealed(true);
    }
  }

  function getVariant(): PytoVariant {
    if (validationFeedback === "complete") return "erfolg";
    if (validationFeedback === "error") return "verwirrt";
    if (validationFeedback === "loading") return "nachdenklich";
    return "froehlich";
  }

  const bubbleClass =
    validationFeedback === "complete"
      ? "border-success/40 bg-success/5"
      : validationFeedback === "error"
        ? "border-error/40 bg-error/5"
        : validationFeedback === "loading"
          ? "border-primary/30 bg-primary/5"
          : "border-base-300 bg-base-100";

  const canAskTip =
    validationFeedback !== "loading" &&
    validationFeedback !== "complete" &&
    hasDecoyBlocks(blocks) &&
    !decoyTipRevealed;

  return (
    <div className="pyto-gap-buddy flex flex-col gap-3">
      <button
        type="button"
        className={`self-center transition-transform ${
          canAskTip ? "cursor-pointer hover:scale-105" : "cursor-default"
        } ${validationFeedback === "complete" ? "pyto-celebrate" : ""} ${
          validationFeedback === "error" ? "pyto-shake" : ""
        }`}
        onClick={handleClick}
        disabled={!canAskTip}
        aria-label={canAskTip ? "Tipp von Pyto" : "Pyto"}
      >
        <Image
          src={PYTO_IMAGES[getVariant()]}
          alt="Pyto"
          width={120}
          height={120}
          className="drop-shadow-lg object-contain"
        />
      </button>

      <div className={`border-2 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md ${bubbleClass}`}>
        <p className="text-xs font-semibold text-primary mb-1">Pyto</p>
        <RichContent key={messageStateKey} content={displayMessage} size="sm" />
      </div>
    </div>
  );
}
