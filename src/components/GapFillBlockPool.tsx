"use client";

import { useMemo } from "react";
import type { GapFillBlock } from "@/lib/types";
import { shuffleBlocks } from "@/lib/gapFill";

interface GapFillBlockPoolProps {
  blocks: GapFillBlock[];
  usedBlockIds: ReadonlySet<string>;
  disabled?: boolean;
}

export default function GapFillBlockPool({
  blocks,
  usedBlockIds,
  disabled = false,
}: GapFillBlockPoolProps) {
  const shuffledBlocks = useMemo(() => shuffleBlocks(blocks), [blocks]);

  return (
    <div className="gap-fill-pool card bg-base-100 border border-base-300">
      <div className="card-body gap-3">
        <div>
          <p className="text-xs font-semibold uppercase opacity-60">Klötzchen-Pool</p>
          <p className="text-sm opacity-80 mt-1">
            Ziehe die passenden Bausteine in die Lücken im Code.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {shuffledBlocks.map((block) => {
            const inUse = usedBlockIds.has(block.id);
            const canDrag = !disabled && !inUse;

            return (
              <div
                key={block.id}
                draggable={canDrag}
                onDragStart={(event) => {
                  if (!canDrag) {
                    event.preventDefault();
                    return;
                  }
                  event.dataTransfer.setData("text/block-id", block.id);
                  event.dataTransfer.setData("text/block-text", block.text);
                  event.dataTransfer.effectAllowed = "move";
                }}
                className={`gap-fill-block badge badge-lg badge-outline px-3 py-4 h-auto font-mono text-sm ${
                  canDrag
                    ? "cursor-grab active:cursor-grabbing"
                    : "opacity-40 cursor-not-allowed"
                }`}
                aria-grabbed={canDrag ? undefined : true}
              >
                {block.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
