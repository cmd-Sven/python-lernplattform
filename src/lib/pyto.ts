export const PYTO_IMAGES = {
  tutor: "/images/pyto/pyto_tutor.png",
  froehlich: "/images/pyto/pyto_froehliches_winken.png",
  buch: "/images/pyto/pyto_winkt_mit_buch.png",
  erfolg: "/images/pyto/pyto_erfolg.png",
  nachdenklich: "/images/pyto/pyto_nachdenklich.png",
  ueberlegt: "/images/pyto/pyto_ueberlegt.png",
  verwirrt: "/images/pyto/pyto_verwirrt.png",
  schlafend: "/images/pyto/pyto_schlafend.png",
} as const;

export type PytoVariant = keyof typeof PYTO_IMAGES;

export function getPytoForHome(
  onboarded: boolean,
  completedCards: number,
  totalCards: number
): { variant: PytoVariant; message: string } {
  if (!onboarded) {
    return {
      variant: "buch",
      message:
        "Hallo! Ich bin Pyto, dein Lerntutor. Wie heißt du? Dann legen wir los mit Python!",
    };
  }

  if (completedCards === 0) {
    return {
      variant: "froehlich",
      message:
        "Schön, dass du da bist! Starte mit Lektion 1 – ich bin bei jeder Übung an deiner Seite.",
    };
  }

  if (totalCards > 0 && completedCards >= totalCards) {
    return {
      variant: "erfolg",
      message:
        "Wow, alle Karten geschafft! Du bist bereit für die PCEP-Prüfung. Ich bin stolz auf dich!",
    };
  }

  const percent = totalCards > 0 ? (completedCards / totalCards) * 100 : 0;

  if (percent >= 50) {
    return {
      variant: "erfolg",
      message: `Über die Hälfte geschafft – weiter so! Noch ${totalCards - completedCards} Karten bis zum Ziel.`,
    };
  }

  return {
    variant: "tutor",
    message:
      "Jede Karte bringt dich näher ans Zertifikat. Bleib dran – du schaffst das!",
  };
}

export function getPytoForLesson(
  completedCards: number,
  totalCards: number,
  onExercise: boolean
): { variant: PytoVariant; message: string } {
  if (onExercise) {
    return {
      variant: "ueberlegt",
      message:
        "Zeit zum Üben! Tippe deinen Code ein und teste ihn mit Ausführen. Probier es aus!",
    };
  }

  if (completedCards === 0) {
    return {
      variant: "buch",
      message:
        "Lies die Frage genau. Klick mich neben der Karte für Tipps – Glühbirne zeigt die Lösung!",
    };
  }

  if (completedCards >= totalCards) {
    return {
      variant: "erfolg",
      message: "Lektion geschafft! Du hast alle Fragen und Übungen gemeistert.",
    };
  }

  return {
    variant: "nachdenklich",
    message: `Noch ${totalCards - completedCards} Fragen – du bist auf einem guten Weg!`,
  };
}
