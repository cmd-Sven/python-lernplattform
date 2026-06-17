import type { Metadata } from "next";

const SITE_NAME = "PCEP Lernplattform";
const DEFAULT_DESCRIPTION =
  "Kostenlose Lernplattform zur Vorbereitung auf das PCEP-Zertifikat: Python-Lernkarten, Übungen, Labyrinth und Prüfungssimulation – Lektion für Lektion.";

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3002";
}

type PageMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  type?: "website" | "article";
};

export function createPageMetadata(options: PageMetadataOptions): Metadata {
  const description = options.description ?? DEFAULT_DESCRIPTION;
  const url = options.path ? `${getSiteUrl()}${options.path}` : getSiteUrl();

  return {
    title: options.title,
    description,
    alternates: options.path ? { canonical: url } : undefined,
    robots: options.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: options.type ?? "website",
      locale: "de_DE",
      url,
      siteName: SITE_NAME,
      title: options.title,
      description,
    },
    twitter: {
      card: "summary",
      title: options.title,
      description,
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} – Python Lernkarten`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "PCEP",
    "Python",
    "Zertifikat",
    "Lernkarten",
    "Programmieren lernen",
    "Python Institute",
    "PCAP",
    "Prüfungsvorbereitung",
    "WBS",
  ],
  authors: [{ name: "Sven Sieber" }],
  creator: "Sven Sieber",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Python Lernkarten`,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} – Python Lernkarten`,
    description: DEFAULT_DESCRIPTION,
  },
};

export { SITE_NAME, DEFAULT_DESCRIPTION };
