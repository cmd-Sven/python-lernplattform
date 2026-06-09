export default function VersionBanner() {
  return (
    <div
      role="status"
      className="bg-info/15 text-info-content border-b border-info/30 px-4 py-2 text-center text-xs sm:text-sm"
    >
      <p>
        <span className="font-semibold">Python Lernplattform Version 0.8</span>
        {" – "}
        <span className="opacity-90">
          Hinweis: Aufgrund von Updates und Überarbeitungen kann es zu technischen
          Verzögerungen kommen.
        </span>
      </p>
    </div>
  );
}
