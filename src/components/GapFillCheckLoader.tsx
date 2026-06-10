"use client";

export type GapCheckPhase = "idle" | "loading" | "success" | "error";

interface GapFillCheckLoaderProps {
  phase: Exclude<GapCheckPhase, "idle">;
  loadingMessage: string;
  progress: number;
}

export default function GapFillCheckLoader({
  phase,
  loadingMessage,
  progress,
}: GapFillCheckLoaderProps) {
  if (phase === "loading") {
    return (
      <div className="gap-check-loader gap-check-loader--running" role="status" aria-live="polite">
        <div className="gap-check-loader-track">
          <div
            className="gap-check-loader-fill"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p key={loadingMessage} className="gap-check-loader-text">
          {loadingMessage}
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div
        className="gap-check-loader gap-check-loader--crashed"
        role="alert"
        aria-live="assertive"
      >
        <div className="gap-check-loader-track gap-check-loader-track--crashed">
          <div
            className="gap-check-loader-fill gap-check-loader-fill--crash"
            style={{ width: `${Math.min(progress, 92)}%` }}
          />
        </div>
        <p className="gap-check-error-blink font-mono font-bold text-error text-xl tracking-widest">
          ERROR
        </p>
        <p className="text-error text-sm mt-2 font-medium">
          oh oh … irgendwas stimmt nicht!
        </p>
      </div>
    );
  }

  return (
    <div className="gap-check-loader gap-check-loader--success" role="status">
      <div className="gap-check-loader-track">
        <div className="gap-check-loader-fill gap-check-loader-fill--success w-full" />
      </div>
      <p className="text-success text-sm font-medium mt-1">
        Code läuft – alles korrekt!
      </p>
    </div>
  );
}
