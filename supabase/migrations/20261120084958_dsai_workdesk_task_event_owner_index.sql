-- Cover the user_id foreign key and owner-scoped event retention queries.
CREATE INDEX IF NOT EXISTS document_task_events_user_created_idx
  ON private.document_task_events (user_id, created_at);
