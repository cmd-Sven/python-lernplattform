import type { PyodideInterface } from "pyodide";

const PYODIDE_VERSION = "0.29.4";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodidePromise: Promise<PyodideInterface> | null = null;
let inputHookInstalled = false;

export function loadPyodideRuntime(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const { loadPyodide } = await import("pyodide");
      const pyodide = await loadPyodide({ indexURL: PYODIDE_CDN });
      return pyodide;
    })();
  }
  return pyodidePromise;
}

export async function runPythonCode(code: string): Promise<{
  stdout: string;
  stderr: string;
  error: string | null;
}> {
  const pyodide = await loadPyodideRuntime();

  if (!inputHookInstalled) {
    pyodide.runPython(`
import builtins
from js import prompt

def _browser_input(prompt_text=""):
    result = prompt(prompt_text)
    return "" if result is None else str(result)

builtins.input = _browser_input
`);
    inputHookInstalled = true;
  }

  let stdout = "";
  let stderr = "";

  pyodide.setStdout({ batched: (text: string) => { stdout += text; } });
  pyodide.setStderr({ batched: (text: string) => { stderr += text; } });

  try {
    await pyodide.runPythonAsync(code);
    return { stdout, stderr, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { stdout, stderr, error: message };
  }
}
