"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPythonError } from "@/lib/pythonErrors";
import { loadPyodideRuntime } from "@/lib/pyodide";
import {
  isExpertTaskComplete,
  markExpertTaskComplete,
  readExpertProgress,
} from "@/lib/expert/progress";
import { runExpertPython } from "@/lib/expert/runExpertPython";
import type { ExpertTask } from "@/lib/expert/types";
import { validateExpertTask } from "@/lib/expert/validate";
import { scheduleLearnerBoardSync } from "@/lib/learnerSync";
import RichContent from "../RichContent";
import ExpertPytoBuddy, { type ExpertTaskFeedback } from "./ExpertPytoBuddy";

interface ExpertCodeTaskProps {
  task: ExpertTask;
  adminPreview?: boolean;
  onCompleted: () => void;
}

export default function ExpertCodeTask({
  task,
  adminPreview = false,
  onCompleted,
}: ExpertCodeTaskProps) {
  const storageKey = `pcep-expert-code-${task.id}`;
  const [code, setCode] = useState(task.starterCode);
  const [output, setOutput] = useState("");
  const [feedback, setFeedback] = useState<ExpertTaskFeedback>("idle");
  const [attemptCount, setAttemptCount] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setCode(saved ?? task.starterCode);
    setOutput("");
    setFeedback("idle");
    setAttemptCount(0);
    setTipIndex(0);
    setCompleted(isExpertTaskComplete(task.id, readExpertProgress()));
  }, [task.id, task.starterCode, storageKey]);

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
          err instanceof Error ? err.message : "Python konnte nicht geladen werden.",
        );
      });
  }, []);

  const handleRun = useCallback(async () => {
    if (completed) return;
    setBusy(true);
    setFeedback("checking");
    setOutput("");

    try {
      if (!runtimeReady) {
        await loadPyodideRuntime();
        setRuntimeReady(true);
      }

      const result = await runExpertPython(code, task.mockInputs);
      const lines: string[] = [];
      if (result.stdout) lines.push(result.stdout);
      if (result.stderr) lines.push(result.stderr);
      if (result.error) lines.push(`Fehler: ${result.error}`);
      const text = lines.join("\n") || "(Keine Ausgabe)";
      setOutput(text);

      const nextAttempt = attemptCount + 1;
      const validation = validateExpertTask(
        task,
        code,
        result.stdout,
        result.error,
        nextAttempt - 1,
      );

      if (validation.ok) {
        setFeedback("success");
        if (!adminPreview) {
          markExpertTaskComplete(task.id, task.levelId);
          scheduleLearnerBoardSync();
        }
        setCompleted(true);
        onCompleted();
      } else {
        setAttemptCount(nextAttempt);
        setTipIndex(validation.tipIndex);
        setFeedback("error");
      }
    } catch (err) {
      setOutput(`Fehler: ${formatPythonError(err)}`);
      setFeedback("error");
      setAttemptCount((count) => count + 1);
      setTipIndex(Math.min(attemptCount, task.tips.length - 1));
    } finally {
      setBusy(false);
    }
  }, [
    adminPreview,
    attemptCount,
    code,
    completed,
    onCompleted,
    runtimeReady,
    task,
  ]);

  const handleReset = () => {
    if (completed) return;
    setCode(task.starterCode);
    setOutput("");
    localStorage.removeItem(storageKey);
    setFeedback("idle");
    setAttemptCount(0);
    setTipIndex(0);
  };

  return (
    <div className="card bg-base-100 shadow-xl border-2 border-secondary">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-secondary">Level {task.levelId}</span>
          <span className="badge badge-outline">Aufgabe {task.order}</span>
          {completed && <span className="badge badge-success">Gelöst</span>}
        </div>

        <h2 className="card-title text-xl">{task.title}</h2>

        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="rounded-xl border border-base-300 bg-base-200/40 p-4">
              <RichContent content={task.task} size="sm" />
            </div>

            {runtimeError && <p className="text-error text-sm">{runtimeError}</p>}

            <textarea
              className="textarea textarea-bordered w-full font-mono text-sm min-h-[12rem] leading-relaxed code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              disabled={busy || completed}
              aria-label="Python-Code für Experten-Aufgabe"
            />

            <div>
              <p className="text-xs font-semibold uppercase opacity-60 mb-1">Ausgabe</p>
              <pre className="code-block text-sm min-h-[4rem] max-h-48 overflow-auto rounded-lg p-3">
                <code>{output || "Hier erscheint die Ausgabe nach dem Prüfen."}</code>
              </pre>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleReset}
                disabled={busy || completed}
              >
                Zurücksetzen
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void handleRun()}
                disabled={busy || !!runtimeError || completed}
              >
                {busy && <span className="loading loading-spinner loading-sm" />}
                {completed ? "Aufgabe gelöst" : "Ausführen & prüfen"}
              </button>
            </div>
          </div>

          <ExpertPytoBuddy
            task={task}
            feedback={feedback}
            tipIndex={tipIndex}
            completed={completed}
          />
        </div>
      </div>
    </div>
  );
}
