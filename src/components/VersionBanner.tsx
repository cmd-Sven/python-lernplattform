export default function VersionBanner() {
  return (
    <div
      role="status"
      className="bg-info/15 text-info-content border-b border-info/30 px-4 py-2 text-center text-xs sm:text-sm"
    >
      <p>
        <span className="font-semibold">Python Lernplattform Version 1.0</span>
        {" – "}
        <span className="opacity-90">
          Alle Lektionen sind verfügbar – inklusive Zusatzlektionen zu Python-Vokabeln
          und Code lesen. Wer Lektion 4 geschafft hat, kann Pyto im Gästebuch bewerten.
        </span>
      </p>
    </div>
  );
}
