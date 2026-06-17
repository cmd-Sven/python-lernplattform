ALTER TABLE pcep_learners
  ADD COLUMN IF NOT EXISTS expert_completed_levels JSONB NOT NULL DEFAULT '[]'::jsonb;
