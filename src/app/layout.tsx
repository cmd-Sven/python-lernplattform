import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ThemeScript from "@/components/ThemeScript";
import VersionBanner from "@/components/VersionBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PCEP Lernplattform – Python Lernkarten",
  description:
    "Öffentliche Lernplattform für die PCEP-Zertifizierung mit digitalen Lernkarten, Lektion für Lektion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-base-200">
        <VersionBanner />
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="footer footer-center p-4 bg-base-100 text-base-content border-t border-base-300 gap-2">
          <aside className="flex flex-col items-center gap-1">
            <p>PCEP™ – Öffentliche Lernplattform 2026 @ Sven Sieber</p>
            <Link href="/impressum" className="link link-hover text-sm opacity-80">
              Impressum
            </Link>
          </aside>
        </footer>
      </body>
    </html>
  );
}
