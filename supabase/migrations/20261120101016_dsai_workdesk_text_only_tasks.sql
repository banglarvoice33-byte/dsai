-- Durable text-only Work Desk tasks; independent of file scanning and binary uploads.
CREATE TABLE IF NOT EXISTS private.workdesk_text_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  idempotency_key varchar(128) NOT NULL,
  language text NOT NULL DEFAULT 'bn' CHECK (language IN ('bn','en','auto')),
  prompt text NOT NULL CHECK (length(prompt) BETWEEN 3 AND 12000),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','cancelled')),
  result_text text,
  provider text,
  model text,
  error_code varchar(80),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS workdesk_text_tasks_owner_created_idx
  ON private.workdesk_text_tasks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS workdesk_text_tasks_queue_idx
  ON private.workdesk_text_tasks(status, created_at);
ALTER TABLE private.workdesk_text_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.workdesk_text_tasks FORCE ROW LEVEL SECURITY;
REVOKE ALL ON private.workdesk_text_tasks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON private.workdesk_text_tasks TO service_role;
CREATE POLICY workdesk_text_tasks_deny_browser ON private.workdesk_text_tasks
  AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
