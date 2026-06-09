"use client";

import { useCallback, useEffect, useState } from "react";
import { loadPyodideRuntime, runPythonCode } from "@/lib/pyodide";

interface PythonPlaygroundProps {
  exerciseId: string;
  initialCode?: string;
}

type RunState = "idle" | "loading-runtime" | "running" | "done";

export default function PythonPlayground({
  exerciseId,
  initialCode = "# Schreibe deinen Code hier\n",
}: PythonPlaygroundProps) {
  const storageKey = `pcep-code-${exerciseId}`;

  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [runState, setRunState] = useState<RunState>("idle");
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      setCode(saved);
    } else if (initialCode) {
      setCode(initialCode);
    }
  }, [storageKey, initialCode]);

  useEffect(() => {
    localStorage.setItem(storageKey, code);
  }, [code, storageKey]);

  useEffect(() => {
    loadPyodideRuntime()
      .then(() => {
        setRuntimeReady(true);
        setRuntimeError(null);
      })
      .catch((err) => {
        setRuntimeError(
          err instanceof Error ? err.message : "Python konnte nicht geladen werden."
        );
      });
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = `${code.slice(0, start)}    ${code.slice(end)}`;
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  };

  const handleRun = useCallback(async () => {
    setRunState(runtimeReady ? "running" : "loading-runtime");
    setOutput("");

    try {
      if (!runtimeReady) {
        await loadPyodideRuntime();
        setRuntimeReady(true);
      }

      const result = await runPythonCode(code);
      const lines: string[] = [];

      if (result.stdout) lines.push(result.stdout);
      if (result.stderr) lines.push(result.stderr);
      if (result.error) lines.push(`Fehler: ${result.error}`);

      setOutput(lines.join("\n") || "(Keine Ausgabe)");
    } catch (err) {
      setOutput(
        `Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`
      );
    } finally {
      setRunState("done");
    }
  }, [code, runtimeReady]);

  const handleReset = () => {
    setCode(initialCode);
    setOutput("");
    localStorage.removeItem(storageKey);
  };

  const isBusy = runState === "loading-runtime" || runState === "running";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase opacity-60">
          Code-Editor – Python im Browser
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={handleReset}
            disabled={isBusy}
          >
            Zurücksetzen
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm gap-2"
            onClick={handleRun}
            disabled={isBusy || !!runtimeError}
          >
            {isBusy ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                {runState === "loading-runtime" ? "Lade Python…" : "Läuft…"}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
                Ausführen
              </>
            )}
          </button>
        </div>
      </div>

      {!runtimeReady && !runtimeError && (
        <div className="alert alert-info py-2 text-sm">
          <span className="loading loading-spinner loading-sm" />
          Python wird geladen (einmalig, ca. 10–15 Sek.)…
        </div>
      )}

      {runtimeError && (
        <div className="alert alert-error py-2 text-sm">
          <span>{runtimeError}</span>
        </div>
      )}

      <textarea
        className="textarea textarea-bordered w-full font-mono text-sm min-h-[200px] leading-relaxed p-4 code-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        aria-label="Python Code eingeben"
      />

      <div>
        <p className="text-xs font-semibold uppercase opacity-60 mb-2">Ausgabe</p>
        <pre className="code-block text-sm min-h-[4rem] max-h-64 overflow-auto rounded-lg">
          <code>{output || "Hier erscheint die Ausgabe nach dem Ausführen."}</code>
        </pre>
      </div>

      <p className="text-xs opacity-50">
        Tipp: Tab für Einrückung · <code>input()</code> öffnet ein Eingabefenster ·
        Code wird lokal gespeichert
      </p>
    </div>
  );
}
