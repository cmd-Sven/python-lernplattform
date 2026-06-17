-- Gästebuch mit Sternebewertung auf der Startseite

CREATE TABLE IF NOT EXISTS pcep_guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT,
  author_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pcep_guestbook_active_created_idx
  ON pcep_guestbook_entries (active, created_at DESC);

ALTER TABLE pcep_guestbook_entries ENABLE ROW LEVEL SECURITY;
