-- Durable, server-only Work Desk document task lifecycle.
-- Additive schema only: no existing files or user data are modified.
CREATE TABLE IF NOT EXISTS private.document_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_asset_id integer NOT NULL REFERENCES public.file_assets(id) ON DELETE CASCADE,
  task_type text NOT NULL DEFAULT 'extract_text'
    CHECK (task_type IN ('extract_text')),
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'retry_wait', 'completed', 'failed', 'cancelled')),
  language text NOT NULL DEFAULT 'bn' CHECK (language IN ('bn', 'en', 'auto')),
  idempotency_key varchar(128) NOT NULL,
  content_sha256 char(64) NOT NULL CHECK (content_sha256 ~ '^[a-f0-9]{64}$'),
  attempt_count smallint NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  max_attempts smallint NOT NULL DEFAULT 3 CHECK (max_attempts BETWEEN 1 AND 5),
  next_retry_at timestamptz,
  lease_token uuid,
  lease_expires_at timestamptz,
  cancel_requested_at timestamptz,
  result_json jsonb,
  extracted_text text,
  error_code varchar(80),
  error_message varchar(500),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  CONSTRAINT document_tasks_user_idempotency_unique UNIQUE (user_id, idempotency_key),
  CONSTRAINT document_tasks_result_size_check CHECK (extracted_text IS NULL OR length(extracted_text) <= 250000),
  CONSTRAINT document_tasks_terminal_state_check CHECK (
    (status IN ('completed', 'failed', 'cancelled') AND completed_at IS NOT NULL)
    OR (status NOT IN ('completed', 'failed', 'cancelled'))
  )
);

CREATE INDEX IF NOT EXISTS document_tasks_user_created_idx
  ON private.document_tasks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS document_tasks_queue_idx
  ON private.document_tasks (status, next_retry_at, created_at)
  WHERE status IN ('queued', 'retry_wait');
CREATE INDEX IF NOT EXISTS document_tasks_lease_idx
  ON private.document_tasks (lease_expires_at)
  WHERE status = 'running';
CREATE INDEX IF NOT EXISTS document_tasks_file_asset_idx
  ON private.document_tasks (file_asset_id, created_at DESC);

CREATE TABLE IF NOT EXISTS private.document_task_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES private.document_tasks(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'created', 'claimed', 'progress', 'retry_scheduled', 'cancel_requested',
    'cancelled', 'completed', 'failed'
  )),
  attempt_count smallint NOT NULL DEFAULT 0,
  detail_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS document_task_events_task_created_idx
  ON private.document_task_events (task_id, created_at);

ALTER TABLE private.document_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.document_task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.document_tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE private.document_task_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS document_tasks_deny_client_access ON private.document_tasks;
CREATE POLICY document_tasks_deny_client_access ON private.document_tasks
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS document_task_events_deny_client_access ON private.document_task_events;
CREATE POLICY document_task_events_deny_client_access ON private.document_task_events
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

REVOKE ALL ON private.document_tasks FROM anon, authenticated;
REVOKE ALL ON private.document_task_events FROM anon, authenticated;

-- Preserve lifecycle evidence as append-only, even if a future server handler regresses.
CREATE OR REPLACE FUNCTION private.reject_document_task_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, private
AS $function$
BEGIN
  RAISE EXCEPTION 'document task events are append-only'
    USING ERRCODE = '55000';
END;
$function$;
REVOKE ALL ON FUNCTION private.reject_document_task_event_mutation() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS document_task_events_append_only ON private.document_task_events;
CREATE TRIGGER document_task_events_append_only
  BEFORE UPDATE OR DELETE ON private.document_task_events
  FOR EACH ROW EXECUTE FUNCTION private.reject_document_task_event_mutation();
COMMENT ON TABLE private.document_tasks IS
  'Server-only durable Work Desk task state. Processing must re-check file ownership, clean scanner state and retention before every attempt.';
COMMENT ON TABLE private.document_task_events IS
  'Append-only server-side audit events for Work Desk task lifecycle transitions.';
