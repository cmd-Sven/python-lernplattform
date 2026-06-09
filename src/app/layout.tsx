import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import ThemeScript from "@/components/ThemeScript";
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
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="footer footer-center p-4 bg-base-100 text-base-content border-t border-base-300">
          <aside>
            <p>
              PCEP™ – Certified Entry-Level Python Programmer · Öffentliche
              Lernplattform
            </p>
          </aside>
        </footer>
      </body>
    </html>
  );
}
