import type { ExpertTask, ExpertValidationResult } from "./types";

function normalizeOutput(stdout: string): string {
  return stdout
    .replace(/\r\n/g, "\n")
    .trim()
    .toLowerCase();
}

function outputLines(stdout: string): string[] {
  return stdout
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function containsNumberNear(stdout: string, expected: number, tolerance = 0.15): boolean {
  const numbers = stdout.match(/-?\d+(?:[.,]\d+)?/g) ?? [];
  return numbers.some((raw) => {
    const value = Number.parseFloat(raw.replace(",", "."));
    return Number.isFinite(value) && Math.abs(value - expected) <= tolerance;
  });
}

function checkRequiredInCode(code: string, required: string[]): string | null {
  const lowered = code.toLowerCase();
  for (const token of required) {
    if (!lowered.includes(token.toLowerCase())) {
      return token;
    }
  }
  return null;
}

export function validateExpertTask(
  task: ExpertTask,
  code: string,
  stdout: string,
  error: string | null,
  attemptCount: number,
): ExpertValidationResult {
  const tipIndex = Math.min(attemptCount, task.tips.length - 1);

  if (error) {
    return {
      ok: false,
      kind: "syntax",
      message: `Python-Fehler: ${error}`,
      tipIndex,
    };
  }

  const missingToken = checkRequiredInCode(
    code,
    task.validation.requireInCode ?? [],
  );
  if (missingToken) {
    return {
      ok: false,
      kind: "structure",
      message: `Im Code fehlt noch etwas Wichtiges (z. B. \`${missingToken}\`).`,
      tipIndex,
    };
  }

  const normalized = normalizeOutput(stdout);
  if (!normalized) {
    return {
      ok: false,
      kind: "output",
      message: "Dein Programm hat noch keine Ausgabe produziert.",
      tipIndex,
    };
  }

  for (const fragment of task.validation.requiredInOutput ?? []) {
    if (!normalized.includes(fragment.toLowerCase())) {
      return {
        ok: false,
        kind: "output",
        message: `In der Ausgabe fehlt noch: „${fragment}“.`,
        tipIndex,
      };
    }
  }

  const lines = outputLines(stdout);
  for (const expectedLine of task.validation.requiredLines ?? []) {
    const found = lines.some((line) => line.includes(expectedLine));
    if (!found) {
      return {
        ok: false,
        kind: "output",
        message: `Eine Ausgabezeile sollte „${expectedLine}“ enthalten.`,
        tipIndex,
      };
    }
  }

  for (const expectedNumber of task.validation.requiredNumbers ?? []) {
    if (!containsNumberNear(stdout, expectedNumber)) {
      return {
        ok: false,
        kind: "output",
        message: `Der berechnete Wert **${expectedNumber}** fehlt in der Ausgabe noch.`,
        tipIndex,
      };
    }
  }

  return { ok: true };
}

export function getExpertTip(task: ExpertTask, tipIndex: number): string {
  if (task.tips.length === 0) return "Lies die Aufgabe noch einmal langsam Zeile für Zeile.";
  return task.tips[Math.min(Math.max(tipIndex, 0), task.tips.length - 1)];
}
