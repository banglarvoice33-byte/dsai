-- DSAI one-time customer acknowledgment. This records document receipt/acknowledgment,
-- not identity-verified electronic signature or legal acceptance.
CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.contract_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  document_snapshot jsonb NOT NULL,
  document_sha256 char(64) NOT NULL CHECK (document_sha256 ~ '^[0-9a-f]{64}$'),
  recipient_name varchar(160) NOT NULL,
  recipient_email varchar(320) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  first_viewed_at timestamptz,
  acknowledged_at timestamptz,
  acknowledgment_name varchar(160),
  CHECK (expires_at > created_at),
  CHECK ((status = 'pending' AND acknowledged_at IS NULL AND acknowledgment_name IS NULL)
      OR (status = 'acknowledged' AND acknowledged_at IS NOT NULL AND acknowledgment_name IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS contract_ack_owner_created_idx
  ON private.contract_acknowledgments (owner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS contract_ack_expiry_idx
  ON private.contract_acknowledgments (expires_at)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS private.contract_acknowledgment_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  acknowledgment_id uuid NOT NULL REFERENCES private.contract_acknowledgments(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('created', 'viewed', 'acknowledged')),
  document_sha256 char(64) NOT NULL,
  acknowledgment_name varchar(160),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contract_ack_events_owner_lookup_idx
  ON private.contract_acknowledgment_events (acknowledgment_id, created_at);

ALTER TABLE private.contract_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.contract_acknowledgments FORCE ROW LEVEL SECURITY;
ALTER TABLE private.contract_acknowledgment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.contract_acknowledgment_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contract_ack_no_browser_access ON private.contract_acknowledgments;
CREATE POLICY contract_ack_no_browser_access
  ON private.contract_acknowledgments
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS contract_ack_events_no_browser_access ON private.contract_acknowledgment_events;
CREATE POLICY contract_ack_events_no_browser_access
  ON private.contract_acknowledgment_events
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
REVOKE ALL ON private.contract_acknowledgments FROM PUBLIC, anon, authenticated;
REVOKE ALL ON private.contract_acknowledgment_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON private.contract_acknowledgments TO service_role;
GRANT SELECT, INSERT ON private.contract_acknowledgment_events TO service_role;
REVOKE ALL ON SEQUENCE private.contract_acknowledgment_events_id_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE private.contract_acknowledgment_events_id_seq TO service_role;

CREATE OR REPLACE FUNCTION private.dsai_guard_contract_ack_immutable()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.owner_user_id IS DISTINCT FROM NEW.owner_user_id
    OR OLD.token_hash IS DISTINCT FROM NEW.token_hash
    OR OLD.document_snapshot IS DISTINCT FROM NEW.document_snapshot
    OR OLD.document_sha256 IS DISTINCT FROM NEW.document_sha256
    OR OLD.recipient_name IS DISTINCT FROM NEW.recipient_name
    OR OLD.recipient_email IS DISTINCT FROM NEW.recipient_email
    OR OLD.created_at IS DISTINCT FROM NEW.created_at
    OR OLD.expires_at IS DISTINCT FROM NEW.expires_at
  THEN
    RAISE EXCEPTION 'contract acknowledgment snapshot and recipient are immutable';
  END IF;
  IF OLD.first_viewed_at IS NOT NULL
    AND OLD.first_viewed_at IS DISTINCT FROM NEW.first_viewed_at
  THEN
    RAISE EXCEPTION 'contract acknowledgment first view is immutable';
  END IF;
  IF OLD.status = 'acknowledged' AND (
    NEW.status IS DISTINCT FROM OLD.status
    OR NEW.acknowledged_at IS DISTINCT FROM OLD.acknowledged_at
    OR NEW.acknowledgment_name IS DISTINCT FROM OLD.acknowledgment_name
  ) THEN
    RAISE EXCEPTION 'contract acknowledgment confirmation is immutable';
  END IF;
  IF NEW.status = 'acknowledged' AND (
    OLD.first_viewed_at IS NULL
    OR OLD.first_viewed_at > now() - interval '3 seconds'
    OR NEW.acknowledged_at IS NULL
    OR NEW.acknowledged_at < OLD.first_viewed_at + interval '3 seconds'
    OR NEW.acknowledged_at > now()
    OR NEW.acknowledgment_name IS NULL
  ) THEN
    RAISE EXCEPTION 'contract acknowledgment requires a recorded view after the minimum wait';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contract_ack_snapshot_immutable ON private.contract_acknowledgments;
CREATE TRIGGER contract_ack_snapshot_immutable
  BEFORE UPDATE ON private.contract_acknowledgments
  FOR EACH ROW EXECUTE FUNCTION private.dsai_guard_contract_ack_immutable();

CREATE OR REPLACE FUNCTION private.dsai_reject_contract_ack_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'contract acknowledgment events are immutable';
END;
$$;

DROP TRIGGER IF EXISTS contract_ack_events_append_only ON private.contract_acknowledgment_events;
CREATE TRIGGER contract_ack_events_append_only
  BEFORE UPDATE ON private.contract_acknowledgment_events
  FOR EACH ROW EXECUTE FUNCTION private.dsai_reject_contract_ack_event_mutation();
