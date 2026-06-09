# PCEP Lernplattform

Öffentliche Web-Lernplattform für die **PCEP™ – Certified Entry-Level Python Programmer** Zertifizierung.

## Features

- **Lektion für Lektion** – Jede Lektion enthält digitale Lernkarten (Frage → Tipp → Antwort)
- **Öffentlicher Fortschritt** – Dein Lernstand ist für die Gruppe sichtbar
- **Admin-Bereich** – Lektionen und Karten freigeben, neue Inhalte anlegen
- **React + Next.js + DaisyUI** – Modernes UI mit Tailwind CSS

## Schnellstart

```bash
cd python-lernplattform
npm install
npm run dev
```

Öffne [http://localhost:3002](http://localhost:3002)

### Admin-Zugang

1. Gehe zu `/admin`
2. Standard-Passwort: `pcep-admin-2026`
3. Ändere es in `.env.local`:

```
ADMIN_PASSWORD=dein-sicheres-passwort
```

## Struktur

| Pfad | Beschreibung |
|------|-------------|
| `/` | Startseite mit Fortschritt & Lektionsübersicht |
| `/lektion/[id]` | Lernkarten einer Lektion |
| `/admin` | Lektionen freigeben, Karten verwalten |
| `data/` | JSON-Daten (Lektionen, Karten, Fortschritt) |

## Lektion 1

Enthält **20 PCEP-Lernkarten** zu Python-Grundlagen (bereits freigegeben).

## Deployment

Für Vercel/Netlify: Das `data/`-Verzeichnis ist schreibbar im Dev-Modus. Für Produktion empfiehlt sich später eine Datenbank (z. B. Supabase).

```bash
npm run build
npm start
```
