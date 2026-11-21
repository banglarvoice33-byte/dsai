-- Executed against an isolated PostgreSQL 17 database after applying the migration.
-- The caller creates anon/authenticated/service_role and public.users before applying it.
-- Test fixture: a permissive policy ensures the restrictive production deny policy is
-- the actual protection. If the restrictive policy is removed, the negative tests below
-- can read/insert and fail; default-deny alone cannot make this test pass.
CREATE POLICY contract_ack_test_permissive_browser_access
  ON private.contract_acknowledgments
  AS PERMISSIVE FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
GRANT USAGE ON SCHEMA private TO anon, authenticated;
GRANT SELECT, INSERT ON private.contract_acknowledgments TO anon, authenticated;
GRANT SELECT, INSERT ON private.contract_acknowledgment_events TO anon, authenticated;

SET ROLE service_role;
INSERT INTO private.contract_acknowledgments
  (owner_user_id, token_hash, document_snapshot, document_sha256, recipient_name, recipient_email, expires_at)
VALUES
  (1, repeat('a', 64), '{"version":1,"title":"RLS test","body":"immutable"}'::jsonb,
   repeat('b', 64), 'Test Recipient', 'recipient@example.test', now() + interval '7 days')
RETURNING id AS ack_id \gset
INSERT INTO private.contract_acknowledgment_events (acknowledgment_id, event_type, document_sha256)
VALUES (:'ack_id'::uuid, 'created', repeat('b', 64));
DO $$
DECLARE visible_count integer;
BEGIN
  SELECT count(*) INTO visible_count FROM private.contract_acknowledgments WHERE owner_user_id = 1;
  IF visible_count <> 1 THEN RAISE EXCEPTION 'service_role_positive_read_failed'; END IF;
  BEGIN
    UPDATE private.contract_acknowledgments
      SET document_snapshot = '{"version":1,"title":"tampered","body":"tampered"}'::jsonb
      WHERE token_hash = repeat('a', 64);
    RAISE EXCEPTION 'immutable_snapshot_guard_failed';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'contract acknowledgment snapshot and recipient are immutable' THEN RAISE; END IF;
    RAISE NOTICE 'CONTRACT_ACK_SNAPSHOT_IMMUTABLE=PASS';
  END;
END $$;
RESET ROLE;
GRANT UPDATE ON private.contract_acknowledgment_events TO service_role;
SET ROLE service_role;
DO $$
BEGIN
  BEGIN
    UPDATE private.contract_acknowledgment_events SET acknowledgment_name = 'tampered';
    RAISE EXCEPTION 'immutable_event_guard_failed';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'contract acknowledgment events are immutable' THEN RAISE; END IF;
    RAISE NOTICE 'CONTRACT_ACK_EVENT_IMMUTABLE=PASS';
  END;
END $$;
RESET ROLE;
REVOKE UPDATE ON private.contract_acknowledgment_events FROM service_role;
SET ROLE service_role;
DO $$
BEGIN
  BEGIN
    DELETE FROM private.contract_acknowledgment_events;
    RAISE EXCEPTION 'event_delete_privilege_guard_failed';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'CONTRACT_ACK_EVENT_DELETE_DENIED=PASS';
  END;
END $$;
RESET ROLE;

SET ROLE anon;
DO $$
DECLARE visible_count integer;
BEGIN
  SELECT count(*) INTO visible_count FROM private.contract_acknowledgments;
  IF visible_count <> 0 THEN RAISE EXCEPTION 'anon_can_read_private_acknowledgments'; END IF;
  BEGIN
    INSERT INTO private.contract_acknowledgments
      (owner_user_id, token_hash, document_snapshot, document_sha256, recipient_name, recipient_email, expires_at)
    VALUES
      (1, repeat('c', 64), '{"version":1,"title":"forbidden","body":"forbidden"}'::jsonb,
       repeat('d', 64), 'Forbidden', 'forbidden@example.test', now() + interval '7 days');
    RAISE EXCEPTION 'anon_insert_policy_not_enforced';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'CONTRACT_ACK_ANON_RLS_NEGATIVE=PASS';
  END;
END $$;
RESET ROLE;

SET ROLE authenticated;
DO $$
DECLARE visible_count integer;
BEGIN
  SELECT count(*) INTO visible_count FROM private.contract_acknowledgments;
  IF visible_count <> 0 THEN RAISE EXCEPTION 'authenticated_can_read_private_acknowledgments'; END IF;
  BEGIN
    INSERT INTO private.contract_acknowledgments
      (owner_user_id, token_hash, document_snapshot, document_sha256, recipient_name, recipient_email, expires_at)
    VALUES
      (1, repeat('e', 64), '{"version":1,"title":"forbidden","body":"forbidden"}'::jsonb,
       repeat('f', 64), 'Forbidden', 'forbidden2@example.test', now() + interval '7 days');
    RAISE EXCEPTION 'authenticated_insert_policy_not_enforced';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'CONTRACT_ACK_AUTHENTICATED_RLS_NEGATIVE=PASS';
  END;
END $$;
RESET ROLE;

SELECT 'CONTRACT_ACK_RLS_INTEGRATION=PASS' AS result;
