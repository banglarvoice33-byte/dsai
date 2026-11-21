-- Server-side runtime access only. Browser roles remain explicitly revoked and denied by RLS.
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE private.document_tasks, private.document_task_events
  TO service_role;
GRANT USAGE, SELECT
  ON SEQUENCE private.document_task_events_id_seq
  TO service_role;
