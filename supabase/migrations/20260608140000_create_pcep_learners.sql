-- Öffentlicher Lernmonitor: ein Eintrag pro Browser/Nutzer (anonyme ID + Anzeigename)

CREATE TABLE pcep_learners (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  lesson_progress JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX pcep_learners_updated_at_idx ON pcep_learners (updated_at DESC);

ALTER TABLE pcep_learners ENABLE ROW LEVEL SECURITY;

CREATE POLICY pcep_learners_public_read ON pcep_learners
  FOR SELECT USING (display_name <> '');
