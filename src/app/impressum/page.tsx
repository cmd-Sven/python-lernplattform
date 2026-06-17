import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Impressum",
  description: "Impressum, Anbieterhinweise und Kontakt zur PCEP Lernplattform.",
  path: "/impressum",
});

export default function ImpressumPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Impressum</h1>

      <div className="card bg-base-100 shadow border border-base-300 mb-6">
        <div className="card-body gap-4">
          <h2 className="card-title text-lg">Hinweis zur Lernplattform</h2>
          <p className="leading-relaxed">
            Diese Lernplattform dient ausschließlich dazu, Python zu lernen um
            das PCEP Zertifikat zu erhalten.
          </p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-base-content/90">
        <section>
          <h2 className="text-xl font-semibold mb-2">
            Angaben gemäß § 5 TMG
          </h2>
          <p>
            Sven Sieber
            <br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Kontakt</h2>
          <p>
            <a
              href="https://github.com/cmd-Sven/python-lernplattform"
              className="link link-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub-Projekt der Lernplattform
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Haftungsausschluss</h2>
          <p className="leading-relaxed">
            Die Inhalte dieser Lernplattform wurden mit größter Sorgfalt
            erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der
            Inhalte kann jedoch keine Gewähr übernommen werden. Die Nutzung
            erfolgt auf eigene Verantwortung.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Markenhinweis</h2>
          <p className="leading-relaxed">
            PCEP™ ist eine Marke der Python Institute. Diese Lernplattform ist
            ein unabhängiges Lernangebot und steht nicht in offizieller
            Verbindung zum Python Institute.
          </p>
        </section>
      </div>

      <div className="mt-10">
        <Link href="/" className="btn btn-ghost btn-sm">
          ← Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}
