-- Durable asynchronous queue and immutable lifecycle evidence for text-only Work Desk tasks.
-- No file bytes or scanner dependency are involved in this text-only task queue.

ALTER TABLE private.workdesk_text_tasks
  DROP CONSTRAINT IF EXISTS workdesk_text_tasks_status_check;

ALTER TABLE private.workdesk_text_tasks
  ADD CONSTRAINT workdesk_text_tasks_status_check
  CHECK (status IN ('queued', 'running', 'retry_wait', 'completed', 'failed', 'cancelled'));

ALTER TABLE private.workdesk_text_tasks
  ADD COLUMN IF NOT EXISTS attempt_count smallint NOT NULL DEFAULT 0
    CHECK (attempt_count >= 0),
  ADD COLUMN IF NOT EXISTS max_attempts smallint NOT NULL DEFAULT 3
    CHECK (max_attempts BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS next_retry_at timestamptz,
  ADD COLUMN IF NOT EXISTS lease_token uuid,
  ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS error_message varchar(500);

CREATE INDEX IF NOT EXISTS workdesk_text_tasks_queue_idx
  ON private.workdesk_text_tasks (status, next_retry_at, created_at);
CREATE INDEX IF NOT EXISTS workdesk_text_tasks_lease_idx
  ON private.workdesk_text_tasks (lease_expires_at);

CREATE TABLE IF NOT EXISTS private.workdesk_text_task_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES private.workdesk_text_tasks(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'created', 'claimed', 'retry_scheduled', 'completed', 'failed', 'cancelled'
  )),
  attempt_count smallint NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  detail_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workdesk_text_task_events_task_created_idx
  ON private.workdesk_text_task_events (task_id, created_at);
CREATE INDEX IF NOT EXISTS workdesk_text_task_events_user_created_idx
  ON private.workdesk_text_task_events (user_id, created_at);

ALTER TABLE private.workdesk_text_task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.workdesk_text_task_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workdesk_text_task_events_service_only
  ON private.workdesk_text_task_events;
CREATE POLICY workdesk_text_task_events_service_only
  ON private.workdesk_text_task_events AS RESTRICTIVE
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

REVOKE ALL ON TABLE private.workdesk_text_task_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE private.workdesk_text_task_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE private.workdesk_text_task_events_id_seq TO service_role;

-- Text task execution never needs to delete durable user work.
REVOKE DELETE ON TABLE private.workdesk_text_tasks FROM service_role;

COMMENT ON TABLE private.workdesk_text_task_events IS
  'Append-only server-only audit of text-only Work Desk task lifecycle transitions.';
COMMENT ON COLUMN private.workdesk_text_tasks.lease_token IS
  'Fencing token preventing stale workers from committing results after lease expiry or cancellation.';
