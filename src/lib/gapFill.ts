import type { GapFillBlock, GapFillData, GapFillGap } from "./types";

export type GapTemplatePart =
  | { type: "text"; content: string }
  | { type: "gap"; id: string };

const GAP_PATTERN = /\{\{([a-zA-Z0-9_-]+)\}\}/g;

export function parseGapTemplate(template: string): GapTemplatePart[] {
  const parts: GapTemplatePart[] = [];
  let lastIndex = 0;

  for (const match of template.matchAll(GAP_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: "text", content: template.slice(lastIndex, index) });
    }
    parts.push({ type: "gap", id: match[1] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < template.length) {
    parts.push({ type: "text", content: template.slice(lastIndex) });
  }

  return parts;
}

/** Einheitliche Leerzeichen für Vergleiche in Lücken. */
export function normalizeGapAnswer(value: string): string {
  const collapsed = value.trim().replace(/\s+/g, " ");

  const stringLiteral = collapsed.match(/^(['"])(.*)\1$/);
  if (stringLiteral) {
    return `"${stringLiteral[2]}"`;
  }

  return collapsed
    .replace(/\s*([<>]=?|==|!=)\s*/g, "$1")
    .replace(/\s*([+\-*/%])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function normalizePythonCode(code: string): string {
  return code
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\t/g, "    ").trimEnd())
    .join("\n")
    .trim();
}

export function getCanonicalGapAnswer(
  gap: GapFillGap,
  blocks: GapFillBlock[],
): string | undefined {
  const block = blocks.find((item) => item.id === gap.blockId && !item.isDecoy);
  return block?.text ?? gap.answers[0];
}

export function checkGapAnswer(
  input: string,
  gap: GapFillGap,
  blocks: GapFillBlock[],
): boolean {
  const canonical = getCanonicalGapAnswer(gap, blocks);
  if (!canonical) return false;
  return normalizeGapAnswer(input) === normalizeGapAnswer(canonical);
}

export function resolveGapValue(
  gap: GapFillGap,
  values: Record<string, string>,
  blockAssignments: Record<string, string>,
  blocks: GapFillBlock[],
): string | null {
  const typed = values[gap.id]?.trim();
  if (typed) return typed;

  const blockId = blockAssignments[gap.id];
  if (!blockId) return null;

  const block = blocks.find((item) => item.id === blockId);
  if (!block || block.isDecoy) return null;
  return block.text;
}

export function assembleGapFillCode(
  gapFill: GapFillData,
  values: Record<string, string>,
  blockAssignments: Record<string, string>,
): string {
  let code = gapFill.template;

  for (const gap of gapFill.gaps) {
    const value = resolveGapValue(gap, values, blockAssignments, gapFill.blocks) ?? "";
    code = code.replaceAll(`{{${gap.id}}}`, value);
  }

  return code;
}

export function shuffleBlocks<T extends GapFillBlock>(blocks: T[]): T[] {
  const copy = [...blocks];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getGapById(gaps: GapFillGap[], id: string): GapFillGap | undefined {
  return gaps.find((gap) => gap.id === id);
}

export function hasDecoyBlocks(blocks: GapFillBlock[]): boolean {
  return blocks.some((block) => block.isDecoy);
}

export function areAllGapsFilled(
  gapFill: GapFillData,
  values: Record<string, string>,
  blockAssignments: Record<string, string>,
): boolean {
  return gapFill.gaps.every((gap) => {
    const value = resolveGapValue(gap, values, blockAssignments, gapFill.blocks);
    return Boolean(value?.trim());
  });
}

export function isGapFillComplete(
  gapFill: GapFillData,
  values: Record<string, string>,
  blockAssignments: Record<string, string>,
): boolean {
  const gapsCorrect = gapFill.gaps.every((gap) => {
    const blockId = blockAssignments[gap.id];
    if (blockId) {
      return blockId === gap.blockId;
    }

    const typed = values[gap.id]?.trim();
    if (!typed) return false;
    return checkGapAnswer(typed, gap, gapFill.blocks);
  });

  if (!gapsCorrect) return false;

  if (gapFill.canonicalCode) {
    const assembled = assembleGapFillCode(gapFill, values, blockAssignments);
    return (
      normalizePythonCode(assembled) === normalizePythonCode(gapFill.canonicalCode)
    );
  }

  return true;
}

export const PYTO_DECOY_MESSAGE =
  "Oh, da hat sich ein falsches Klötzchen reingeschmuggelt – verzeih … aber nur welches?";
