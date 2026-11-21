-- Persist user-edited Work Desk text without overwriting the original AI output.
-- Server-only table access and owner-scoped API checks remain unchanged.
ALTER TABLE private.workdesk_text_tasks
  ADD COLUMN IF NOT EXISTS edited_result_text text,
  ADD COLUMN IF NOT EXISTS edited_result_updated_at timestamptz;

ALTER TABLE private.workdesk_text_tasks
  DROP CONSTRAINT IF EXISTS workdesk_text_tasks_edited_result_length_check;
ALTER TABLE private.workdesk_text_tasks
  ADD CONSTRAINT workdesk_text_tasks_edited_result_length_check
  CHECK (
    edited_result_text IS NULL
    OR length(edited_result_text) BETWEEN 1 AND 250000
  );

ALTER TABLE private.workdesk_text_task_events
  DROP CONSTRAINT IF EXISTS workdesk_text_task_events_event_type_check;
ALTER TABLE private.workdesk_text_task_events
  ADD CONSTRAINT workdesk_text_task_events_event_type_check
  CHECK (event_type IN (
    'created', 'claimed', 'retry_scheduled', 'completed', 'failed',
    'cancelled', 'edited'
  ));

COMMENT ON COLUMN private.workdesk_text_tasks.result_text IS
  'Immutable original AI-generated text result; user edits are stored separately.';
COMMENT ON COLUMN private.workdesk_text_tasks.edited_result_text IS
  'Latest owner-edited result. NULL means the original AI result is still current.';
