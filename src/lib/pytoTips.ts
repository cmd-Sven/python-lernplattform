export const DEFAULT_TIP2_MESSAGES = [
  "Wie, noch ein Tipp? Na komm schon … du weißt das doch!",
  "Schon wieder? Ich glaube an dich – probier's nochmal im Kopf!",
  "Pytonische Geduld … aber ernsthaft, du hast das schon fast!",
  "Tipp Nr. 2? Du bist hartnäckig – das gefällt mir!",
  "Hmm … vielleicht hilft ein tiefer Atemzug und noch ein Versuch?",
];

export const DEFAULT_TIP3_MESSAGES = [
  "Drei Tipps! Mehr gebe ich nicht preis. Gleich penne ich ein …",
  "Okay, letzter Tipp! Danach brauche ich ein Nickerchen. Du auch fast fertig?",
  "Das war's von mir – du schaffst das! Ich gönne mir jetzt 5 Sekunden Schlaf.",
  "Alles klar, ich bin tipplich erschöpft. Nächste Karte weckt mich wieder!",
  "Zzz … nein warte, erst noch dieser letzte Hinweis für dich!",
];

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function linesToMessages(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function messagesToLines(messages?: string[]): string {
  return messages?.join("\n") ?? "";
}
