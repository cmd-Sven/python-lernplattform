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

export const DEFAULT_MC_CORRECT_MESSAGES = [
  "Genau richtig! **Stark gemacht** – du hast den Dreh raus!",
  "Super! **Volltreffer** – so sieht's aus!",
  "Klasse! **Richtig** – weiter so!",
  "Yes! **Genau so** – du bist auf dem richtigen Weg!",
  "Perfekt! **Das war's** – ich bin beeindruckt!",
];

export const DEFAULT_MC_WRONG_MESSAGES = [
  "Hmm, **noch nicht ganz** – aber du bist nah dran! Probier's nochmal oder klick mich für einen Tipp.",
  "**Fast!** Lies die Frage noch einmal genau – du schaffst das!",
  "Noch nicht die richtige Antwort – **kein Stress!** Jeder Fehler bringt dich näher zur Lösung.",
  "**Nicht aufgeben!** Überleg nochmal oder hol dir einen Tipp von mir.",
  "Knapp vorbei – **noch ein Versuch?** Ich glaube an dich!",
];

export const DEFAULT_FLIP_SUCCESS_MESSAGES = [
  "Ah, **da ist die Lösung!** Hast du alles verstanden? Dann geht's weiter!",
  "Super – **jetzt weißt du Bescheid!** Wenn's passt, klick auf Weiter.",
  "**Genau!** So funktioniert's. Du kannst zur nächsten Frage!",
];

export const GAP_CHECK_LOADING_MESSAGES = [
  "Python-Interpreteter wird angekurbelt …",
  "Rechenzentrum auf maximale Auslastung …",
];

export const DEFAULT_GAP_COMPLETE_MESSAGES = [
  "**Alle Lücken richtig!** Der Code läuft – klick auf Weiter!",
  "Perfekt ausgefüllt! **Der Interpreter ist zufrieden** – weiter geht's!",
  "**Klasse!** Alles passt – du kannst zur nächsten Runde!",
];

export const DEFAULT_GAP_CHECKING_MESSAGES = [
  "Ich lasse den **Python-Interpreteter** laufen – halt dich fest!",
  "Moment … das **Rechenzentrum** rödelt für dich!",
  "**Syntax-Check läuft** – gleich wissen wir mehr!",
];

export const DEFAULT_GAP_ERROR_MESSAGES = [
  "**Oh oh!** Der Interpreter ist abgestürzt – irgendwas stimmt nicht!",
  "**ERROR!** Da hat sich ein Fehler eingeschlichen – schau nochmal hin!",
  "Ups, **Crash!** Prüf die Lücken nochmal oder nutz meine Klötzchen!",
];

export const DEFAULT_GAP_INCOMPLETE_MESSAGES = [
  "**Noch nicht alle Lücken stimmen** – schau nochmal hin oder nutz meine Klötzchen!",
  "Hmm, da fehlt noch was. **Nicht aufgeben** – ein kleiner Tipp kann helfen!",
  "**Fast!** Prüf nochmal Zeile für Zeile – du bist nah dran!",
];

export function pickMcCorrectMessage(answer: string, custom?: string[]): string {
  const pool = custom && custom.length > 0 ? custom : DEFAULT_MC_CORRECT_MESSAGES;
  const base = pickRandom(pool);
  const shortAnswer = answer.split("\n")[0].replace(/\*\*/g, "").trim();
  if (shortAnswer.length > 0 && shortAnswer.length < 80) {
    return `${base}\n\n**${shortAnswer}**`;
  }
  return base;
}

export function pickMcWrongMessage(custom?: string[]): string {
  const pool = custom && custom.length > 0 ? custom : DEFAULT_MC_WRONG_MESSAGES;
  return pickRandom(pool);
}

export function pickFlipSuccessMessage(custom?: string[]): string {
  const pool = custom && custom.length > 0 ? custom : DEFAULT_FLIP_SUCCESS_MESSAGES;
  return pickRandom(pool);
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
