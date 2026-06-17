import { formatPythonError } from "../pythonErrors";
import { loadPyodideRuntime } from "../pyodide";

export async function runExpertPython(
  code: string,
  mockInputs: string[] = [],
): Promise<{
  stdout: string;
  stderr: string;
  error: string | null;
}> {
  const pyodide = await loadPyodideRuntime();
  const inputJson = JSON.stringify(mockInputs);

  let stdout = "";
  let stderr = "";

  pyodide.setStdout({ batched: (text: string) => { stdout += text; } });
  pyodide.setStderr({ batched: (text: string) => { stderr += text; } });

  const wrapped = `
import builtins

_inputs = ${inputJson}
_idx = 0

def _expert_input(prompt_text=""):
    global _idx
    if _idx >= len(_inputs):
        return ""
    value = _inputs[_idx]
    _idx += 1
    return value

builtins.input = _expert_input

${code}
`;

  try {
    await pyodide.runPythonAsync(wrapped);
    return { stdout, stderr, error: null };
  } catch (err) {
    return { stdout, stderr, error: formatPythonError(err) };
  }
}
