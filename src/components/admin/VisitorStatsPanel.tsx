"use client";

import { useEffect, useMemo, useState } from "react";
import type { VisitorStatsSummary } from "@/lib/types";

function formatDayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" });
}

export default function VisitorStatsPanel() {
  const [stats, setStats] = useState<VisitorStatsSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/visits?weeks=4", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setError("Besucherstatistik konnte nicht geladen werden.");
          return;
        }
        const data = await res.json();
        if (!cancelled) setStats(data.stats ?? null);
      } catch {
        if (!cancelled) setError("Besucherstatistik konnte nicht geladen werden.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxVisitors = useMemo(
    () => Math.max(1, ...(stats?.days.map((day) => day.uniqueVisitors) ?? [1])),
    [stats],
  );

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error text-sm">{error}</div>;
  }

  if (!stats) {
    return (
      <div className="alert alert-info text-sm">
        Noch keine Besucherdaten vorhanden. Sobald Nutzer die Seite öffnen, erscheinen
        hier die Zahlen.
      </div>
    );
  }

  const trend =
    stats.lastWeek === 0
      ? stats.thisWeek > 0
        ? "+100 %"
        : "0 %"
      : `${Math.round(((stats.thisWeek - stats.lastWeek) / stats.lastWeek) * 100)} %`;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat bg-base-200 rounded-xl border border-base-300">
          <div className="stat-title">Diese Woche</div>
          <div className="stat-value text-primary">{stats.thisWeek}</div>
          <div className="stat-desc">eindeutige Besucher</div>
        </div>
        <div className="stat bg-base-200 rounded-xl border border-base-300">
          <div className="stat-title">Letzte Woche</div>
          <div className="stat-value">{stats.lastWeek}</div>
          <div className="stat-desc">eindeutige Besucher</div>
        </div>
        <div className="stat bg-base-200 rounded-xl border border-base-300">
          <div className="stat-title">Letzte {stats.weeks} Wochen</div>
          <div className="stat-value">{stats.totalUniqueVisitors}</div>
          <div className="stat-desc">gesamt · Trend {trend}</div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Tägliche Besucher (letzte {stats.weeks} Wochen)</h3>
        <div className="overflow-x-auto pb-2">
          <div className="flex items-end gap-1 min-w-max h-40">
            {stats.days.map((day) => (
              <div
                key={day.date}
                className="flex flex-col items-center gap-1 w-8 sm:w-10"
                title={`${formatDayLabel(day.date)}: ${day.uniqueVisitors} Besucher`}
              >
                <span className="text-[10px] opacity-70">{day.uniqueVisitors || ""}</span>
                <div
                  className="w-full rounded-t bg-primary/80 min-h-[4px] transition-all"
                  style={{
                    height: `${Math.max(4, (day.uniqueVisitors / maxVisitors) * 120)}px`,
                  }}
                />
                <span className="text-[9px] opacity-60 rotate-[-45deg] origin-top-left h-8 whitespace-nowrap">
                  {formatDayLabel(day.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs opacity-60 mt-2">
          Gezählt wird pro Browser und Tag ein Besuch (anonyme Besucher-ID, DSGVO-freundlich).
        </p>
      </div>
    </div>
  );
}
