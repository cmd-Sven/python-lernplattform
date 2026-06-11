import type { PyodideInterface } from "pyodide";
import { formatPythonError } from "../pythonErrors";
import { loadPyodideRuntime } from "../pyodide";

export interface MazeExitSideEffects {
  holdCount: number;
  laserCount: number;
}

export interface MazeExitPythonResult {
  stdout: string;
  stderr: string;
  error: string | null;
  sideEffects: MazeExitSideEffects;
}

const EXIT_BRIDGE_VERSION = 1;

let exitBridgeReady: Promise<void> | null = null;
let exitBridgeVersion = 0;

const exitEffects: MazeExitSideEffects = {
  holdCount: 0,
  laserCount: 0,
};

function resetExitEffects(): void {
  exitEffects.holdCount = 0;
  exitEffects.laserCount = 0;
}

async function ensureExitChallengeBridge(pyodide: PyodideInterface): Promise<void> {
  if (exitBridgeReady && exitBridgeVersion === EXIT_BRIDGE_VERSION) {
    await exitBridgeReady;
    return;
  }

  exitBridgeReady = null;
  exitBridgeVersion = EXIT_BRIDGE_VERSION;

  exitBridgeReady = (async () => {
    pyodide.registerJsModule("pyto_exit", {
      halten: () => {
        exitEffects.holdCount += 1;
      },
      laser: () => {
        exitEffects.laserCount += 1;
      },
    });

    await pyodide.runPythonAsync(`
from pyto_exit import halten, laser
`);
  })();

  try {
    await exitBridgeReady;
  } catch (err) {
    exitBridgeReady = null;
    throw err;
  }
}

/** Labyrinth-Ausgangsaufgaben: Robot-Funktionen + normaler stdout. */
export async function runMazeExitPython(code: string): Promise<MazeExitPythonResult> {
  resetExitEffects();

  const pyodide = await loadPyodideRuntime();
  await ensureExitChallengeBridge(pyodide);

  let stdout = "";
  let stderr = "";

  pyodide.setStdout({ batched: (text: string) => { stdout += text; } });
  pyodide.setStderr({ batched: (text: string) => { stderr += text; } });

  try {
    await pyodide.runPythonAsync(code);
    return {
      stdout,
      stderr,
      error: null,
      sideEffects: { ...exitEffects },
    };
  } catch (err) {
    return {
      stdout,
      stderr,
      error: formatPythonError(err),
      sideEffects: { ...exitEffects },
    };
  }
}
