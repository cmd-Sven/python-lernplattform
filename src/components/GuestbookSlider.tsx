"use client";

import { useEffect, useMemo, useState } from "react";
import type { GuestbookEntry } from "@/lib/types";

const VISIBLE_COUNT = 4;
const ROTATE_MS = 5000;

function StarDisplay({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${stars} von 5 Sternen`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={index < stars ? "text-warning" : "text-base-content/20"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

function GuestbookCard({ entry }: { entry: GuestbookEntry }) {
  return (
    <article className="guestbook-card rounded-2xl border-2 border-base-300 bg-base-100 p-4 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-2">
        <strong className="text-sm truncate">{entry.authorName}</strong>
        <StarDisplay stars={entry.stars} />
      </div>
      <p className="text-sm leading-relaxed opacity-90 flex-1 line-clamp-4">
        {entry.comment}
      </p>
    </article>
  );
}

interface GuestbookSliderProps {
  entries: GuestbookEntry[];
}

export default function GuestbookSlider({ entries }: GuestbookSliderProps) {
  const [page, setPage] = useState(0);

  const pages = useMemo(() => {
    if (entries.length === 0) return [];
    const result: GuestbookEntry[][] = [];
    for (let i = 0; i < entries.length; i += VISIBLE_COUNT) {
      result.push(entries.slice(i, i + VISIBLE_COUNT));
    }
    return result;
  }, [entries]);

  useEffect(() => {
    setPage(0);
  }, [entries.length]);

  useEffect(() => {
    if (pages.length <= 1) return;
    const timer = window.setInterval(() => {
      setPage((current) => (current + 1) % pages.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [pages.length]);

  if (entries.length === 0) return null;

  const visible = pages[page] ?? pages[0] ?? [];

  return (
    <section className="mb-8" aria-label="Gästebuch">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold">Gästebuch</h2>
          <p className="text-sm opacity-70">
            Was Lernende über die Plattform sagen
          </p>
        </div>
        {pages.length > 1 && (
          <div className="flex gap-1" aria-hidden>
            {pages.map((_, index) => (
              <span
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === page ? "bg-primary" : "bg-base-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div
        key={page}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 guestbook-slider-page"
      >
        {visible.map((entry) => (
          <GuestbookCard key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}
