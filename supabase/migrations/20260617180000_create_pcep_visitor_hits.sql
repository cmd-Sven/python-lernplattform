-- Tägliche Besucherzählung (ein Eintrag pro Browser-ID und Tag)

CREATE TABLE IF NOT EXISTS pcep_visitor_hits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  path TEXT NOT NULL DEFAULT '/',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS pcep_visitor_hits_unique_daily
  ON pcep_visitor_hits (visitor_id, visit_date);

CREATE INDEX IF NOT EXISTS pcep_visitor_hits_date_idx
  ON pcep_visitor_hits (visit_date DESC);

ALTER TABLE pcep_visitor_hits ENABLE ROW LEVEL SECURITY;
