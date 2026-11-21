-- Integration proof for persisted Work Desk edits on disposable CI PostgreSQL.
-- The server role writes edits; browser roles remain denied by RLS.
SET ROLE service_role;
INSERT INTO private.workdesk_text_tasks
  (id, user_id, idempotency_key, language, prompt, status, result_text)
VALUES
  ('10000000-0000-4000-8000-000000000001', 1, 'workdesk-edit-ci-0001', 'bn',
   'পরীক্ষার নির্দেশনা', 'completed', 'মূল AI ফলাফল')
ON CONFLICT (user_id, idempotency_key) DO NOTHING;

UPDATE private.workdesk_text_tasks
SET edited_result_text = 'ব্যবহারকারীর সম্পাদিত ফলাফল',
    edited_result_updated_at = now(),
    updated_at = now()
WHERE id = '10000000-0000-4000-8000-000000000001'
  AND user_id = 1
  AND status = 'completed';

INSERT INTO private.workdesk_text_task_events
  (task_id, user_id, event_type, attempt_count, detail_json)
VALUES
  ('10000000-0000-4000-8000-000000000001', 1, 'edited', 0,
   jsonb_build_object('characterCount', length('ব্যবহারকারীর সম্পাদিত ফলাফল')));

DO $$
DECLARE
  original_value text;
  edited_value text;
  audit_count integer;
BEGIN
  SELECT result_text, edited_result_text
    INTO original_value, edited_value
    FROM private.workdesk_text_tasks
   WHERE id = '10000000-0000-4000-8000-000000000001';
  IF original_value <> 'মূল AI ফলাফল' THEN
    RAISE EXCEPTION 'Original AI result was overwritten';
  END IF;
  IF edited_value <> 'ব্যবহারকারীর সম্পাদিত ফলাফল' THEN
    RAISE EXCEPTION 'Edited result was not persisted';
  END IF;
  SELECT count(*) INTO audit_count
    FROM private.workdesk_text_task_events
   WHERE task_id = '10000000-0000-4000-8000-000000000001'
     AND event_type = 'edited';
  IF audit_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one edit audit event, got %', audit_count;
  END IF;
END;
$$;
RESET ROLE;

-- Deliberately grant table access in the disposable test database so RLS,
-- rather than missing SQL grants, is what prevents browser-role data access.
GRANT USAGE ON SCHEMA private TO anon, authenticated;
GRANT SELECT, INSERT ON private.workdesk_text_tasks TO anon, authenticated;

SET ROLE anon;
DO $$
DECLARE visible_rows integer;
BEGIN
  SELECT count(*) INTO visible_rows FROM private.workdesk_text_tasks;
  IF visible_rows <> 0 THEN RAISE EXCEPTION 'anon can read Work Desk task rows'; END IF;
END;
$$;
RESET ROLE;

SET ROLE authenticated;
DO $$
DECLARE visible_rows integer;
BEGIN
  SELECT count(*) INTO visible_rows FROM private.workdesk_text_tasks;
  IF visible_rows <> 0 THEN RAISE EXCEPTION 'authenticated can read Work Desk task rows'; END IF;
END;
$$;
RESET ROLE;
