"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isExpertTasksUnlocked } from "@/lib/expert/progress";
import { getLessonProgressList } from "@/lib/visitorProgress";

interface ExpertTasksGateProps {
  children: React.ReactNode;
}

export default function ExpertTasksGate({ children }: ExpertTasksGateProps) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    setUnlocked(isExpertTasksUnlocked(getLessonProgressList()));
  }, []);

  if (unlocked === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-5xl mb-4" aria-hidden>
          🔒
        </p>
        <h1 className="text-2xl font-bold mb-3">Experten-Aufgaben noch gesperrt</h1>
        <p className="opacity-80 mb-6">
          Schließe zuerst <strong>Lektion 4</strong> ab. Dann kannst du die Experten-Aufgaben
          mit automatischer Code-Prüfung lösen.
        </p>
        <Link href="/" className="btn btn-primary">
          Zur Startseite
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
