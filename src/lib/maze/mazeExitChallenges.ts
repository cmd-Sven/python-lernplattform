import type { MazeExitSideEffects } from "./mazeExitPython";

export const MAZE_EXIT_SPEECH =
  "Na super, ich komme hier wohl nur raus wenn ich diese Aufgabe löse …";

export const MAZE_EXIT_MODAL_DELAY_MS = 3000;

export type MazeExitChallengeKind =
  | "print_exact"
  | "print_lines"
  | "hold_loop"
  | "laser_loop";

export interface MazeExitChallenge {
  levelId: number;
  title: string;
  task: string;
  starterCode: string;
  tips: string[];
  kind: MazeExitChallengeKind;
  /** Exakter stdout (ohne trailing Newline). */
  expectedOutput?: string;
  /** Zeilenweise exakte Ausgabe. */
  expectedLines?: string[];
  /** Benötigte Aufrufe von halten() / laser(). */
  requiredCalls?: number;
}

export const MAZE_EXIT_CHALLENGES: MazeExitChallenge[] = [
  {
    levelId: 1,
    title: "Tür-Code",
    kind: "print_exact",
    task:
      "Der Ausgang ist mit einem **Python-Schloss** gesichert. Schreibe ein kurzes Programm mit `print()`, das genau die Zeile **Tür auf** ausgibt.",
    starterCode: "# Mit print() die richtige Zeile ausgeben:\n",
    tips: [
      "Mit **print()** sendest du Text zur Ausgabe – der Text steht in Anführungszeichen.",
      "So geht's: `print(\"dein Text\")` – welcher Text öffnet die Tür?",
      "Gib **genau** `Tür auf` aus – Groß- und Kleinschreibung beachten!",
    ],
    expectedOutput: "Tür auf",
  },
  {
    levelId: 2,
    title: "Hebel-Schleife",
    kind: "hold_loop",
    requiredCalls: 5,
    task:
      "Der Ausgang braucht **5 Sekunden Hebel-Halten**. Schreibe eine `for`-Schleife mit `range(5)`, die in jedem Durchlauf **`halten()`** aufruft – wie im Labyrinth, nicht mit `print()`.",
    starterCode: "for i in range(5):\n    # halten() hier einfügen\n",
    tips: [
      "Eine **for-Schleife** wiederholt Code: `for i in range(5):` läuft 5-mal.",
      "Unter der Schleife muss der Code **eingerückt** sein – mit 4 Leerzeichen.",
      "Rufe in der Schleife **`halten()`** auf – jeder Aufruf hält 1 Sekunde am Hebel.",
      "`print(\"halten\")` zählt nicht – du musst die echte Funktion **`halten()`** verwenden!",
    ],
  },
  {
    levelId: 3,
    title: "Laser-Salve",
    kind: "laser_loop",
    requiredCalls: 3,
    task:
      "Der Ausgangs-Scanner will **3 Laser-Impulse**. Schreibe eine `for`-Schleife mit `range(3)`, die **3× `laser()`** aufruft – nicht nur Text ausgeben.",
    starterCode: "for i in range(3):\n    # laser() hier einfügen\n",
    tips: [
      "Drei Impulse heißt: `range(3)` – bei `range` startet die Zählung bei 0!",
      "Der Schleifenkörper braucht **Einrückung** (4 Leerzeichen).",
      "Rufe in der Schleife **`laser()`** auf – wie beim Zerstören der Mauer im Level.",
      "`print(\"pew!\")` reicht nicht – nutze die echte Funktion **`laser()`**!",
    ],
  },
  {
    levelId: 4,
    title: "Debug-Passwort",
    kind: "print_lines",
    task:
      "Der **echte** Ausgang verlangt zwei Zeilen Output: Zuerst `404`, dann `Bug gefangen`. Schreibe **zwei separate** `print()`-Aufrufe – einen pro Zeile.",
    starterCode: "# Zwei print()-Zeilen:\n",
    tips: [
      "Jede Ausgabezeile braucht einen **eigenen** `print()`-Aufruf.",
      "Die **erste** Zeile soll genau `404` sein – ohne Extra-Text.",
      "Die **zweite** Zeile: `Bug gefangen` – in einem **zweiten** print(), nicht alles in einem!",
    ],
    expectedLines: ["404", "Bug gefangen"],
  },
];

export function getMazeExitChallenge(levelId: number): MazeExitChallenge | undefined {
  return MAZE_EXIT_CHALLENGES.find((item) => item.levelId === levelId);
}

function normalizeStdout(stdout: string): string {
  return stdout.replace(/\r\n/g, "\n").trimEnd();
}

function countRegexMatches(code: string, pattern: RegExp): number {
  return (code.match(pattern) ?? []).length;
}

function hasForRange(code: string, count: number): boolean {
  return new RegExp(`\\bfor\\b[\\s\\S]*?\\brange\\s*\\(\\s*${count}\\s*\\)`).test(code);
}

function codeUsesPrintWith(code: string, fragment: string): boolean {
  const re = new RegExp(`\\bprint\\s*\\([^)]*${fragment}`, "i");
  return re.test(code);
}

function validateStdout(challenge: MazeExitChallenge, stdout: string): boolean {
  const out = normalizeStdout(stdout);

  if (challenge.expectedOutput !== undefined) {
    return out.trim() === challenge.expectedOutput.trim();
  }

  if (challenge.expectedLines) {
    const lines = out
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (lines.length !== challenge.expectedLines.length) return false;
    return challenge.expectedLines.every((line, index) => lines[index] === line);
  }

  return true;
}

function validateLevel1Code(code: string): boolean {
  if (!/\bprint\s*\(/.test(code)) return false;
  if (!/Tür auf/.test(code)) return false;
  return true;
}

function validateLevel2Code(code: string): boolean {
  if (!hasForRange(code, 5)) return false;
  if (!/\bhalten\s*\(\s*\)/.test(code)) return false;
  if (codeUsesPrintWith(code, "halten")) return false;
  return true;
}

function validateLevel3Code(code: string): boolean {
  if (!hasForRange(code, 3)) return false;
  if (!/\blaser\s*\(\s*\)/.test(code)) return false;
  if (codeUsesPrintWith(code, "pew")) return false;
  return true;
}

function validateLevel4Code(code: string): boolean {
  const printCalls = countRegexMatches(code, /\bprint\s*\(/g);
  if (printCalls < 2) return false;
  if (/\bprint\s*\([^)]*404[^)]*Bug/i.test(code)) return false;
  if (/\bprint\s*\([^)]*\\n/i.test(code) && /404/.test(code) && /Bug/.test(code)) {
    return false;
  }
  return true;
}

export function validateMazeExitChallengeCode(code: string, challenge: MazeExitChallenge): boolean {
  switch (challenge.kind) {
    case "print_exact":
      return validateLevel1Code(code);
    case "hold_loop":
      return validateLevel2Code(code);
    case "laser_loop":
      return validateLevel3Code(code);
    case "print_lines":
      return validateLevel4Code(code);
    default:
      return true;
  }
}

export function validateMazeExitChallenge(
  challenge: MazeExitChallenge,
  code: string,
  stdout: string,
  error: string | null,
  sideEffects: MazeExitSideEffects,
): boolean {
  if (error) return false;
  if (!validateMazeExitChallengeCode(code, challenge)) return false;

  switch (challenge.kind) {
    case "hold_loop":
      return (
        sideEffects.holdCount === (challenge.requiredCalls ?? 5) &&
        sideEffects.laserCount === 0
      );
    case "laser_loop":
      return (
        sideEffects.laserCount === (challenge.requiredCalls ?? 3) &&
        sideEffects.holdCount === 0
      );
    case "print_exact":
    case "print_lines":
      return validateStdout(challenge, stdout);
    default:
      return false;
  }
}
