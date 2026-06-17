"use client";

import { FormEvent, useState } from "react";
import {
  getOrCreateVisitorId,
  hasGuestbookSubmitted,
  markGuestbookSubmitted,
} from "@/lib/visitor";
import type { GuestbookEntry } from "@/lib/types";

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (stars: number) => void;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Sternebewertung">
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1;
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            className={`text-3xl transition-colors ${
              active ? "text-warning" : "text-base-content/25 hover:text-warning/60"
            }`}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

interface GuestbookPromptProps {
  authorName: string;
  onSubmitted: (entry: GuestbookEntry) => void;
}

export default function GuestbookPrompt({
  authorName,
  onSubmitted,
}: GuestbookPromptProps) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(hasGuestbookSubmitted());

  if (done) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (stars < 1) {
      setError("Bitte wähle mindestens einen Stern.");
      return;
    }
    if (comment.trim().length < 5) {
      setError("Bitte schreibe mindestens 5 Zeichen.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: getOrCreateVisitorId(),
          authorName,
          comment: comment.trim(),
          stars,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Speichern fehlgeschlagen.");
        return;
      }

      markGuestbookSubmitted();
      setDone(true);
      if (data.entry) onSubmitted(data.entry as GuestbookEntry);
    } catch {
      setError("Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-8 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 sm:p-8">
      <h2 className="text-xl font-bold mb-4 text-center">Dein Gästebucheintrag</h2>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col gap-4">
        <div>
          <span className="label-text font-medium mb-2 block">Deine Sterne</span>
          <StarPicker value={stars} onChange={setStars} />
        </div>

        <label className="form-control w-full">
          <span className="label-text font-medium mb-2">Dein Kommentar</span>
          <textarea
            className="textarea textarea-bordered w-full min-h-28"
            placeholder="Was hat dir an der Lernplattform gefallen? Was können wir verbessern?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            required
          />
        </label>

        {error && <p className="text-error text-sm">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? "Wird gespeichert…" : "Gästebucheintrag absenden"}
        </button>
      </form>
    </section>
  );
}
