-- Atomic sliding-window quota guard for free-only AI providers.
-- Requests are recorded before outbound calls, so failed attempts still consume quota.
BEGIN;

CREATE TABLE IF NOT EXISTS private.ai_provider_quota_events (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('openrouter', 'cloudflare')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_provider_quota_events_provider_created_idx
  ON private.ai_provider_quota_events (provider, created_at DESC);

ALTER TABLE private.ai_provider_quota_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.ai_provider_quota_events FORCE ROW LEVEL SECURITY;

REVOKE ALL ON private.ai_provider_quota_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE private.ai_provider_quota_events_id_seq FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
GRANT SELECT, INSERT, DELETE ON private.ai_provider_quota_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE private.ai_provider_quota_events_id_seq TO service_role;

CREATE POLICY ai_provider_quota_events_deny_client
  ON private.ai_provider_quota_events
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY ai_provider_quota_events_service_role
  ON private.ai_provider_quota_events
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION private.consume_ai_provider_quota(
  p_provider TEXT,
  p_per_minute INTEGER,
  p_per_24_hours INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_minute_count INTEGER;
  v_day_count INTEGER;
BEGIN
  IF p_provider IS NULL OR p_provider NOT IN ('openrouter', 'cloudflare') THEN
    RAISE EXCEPTION 'unsupported AI provider quota key';
  END IF;
  IF p_per_minute < 1 OR p_per_24_hours < 1 OR p_per_minute > p_per_24_hours THEN
    RAISE EXCEPTION 'invalid AI provider quota limits';
  END IF;

  -- Serialize quota decisions per provider so concurrent serverless requests
  -- cannot all pass the same remaining slot.
  PERFORM pg_advisory_xact_lock(
    pg_catalog.hashtextextended('dsai-provider-quota:' || p_provider, 0)
  );

  DELETE FROM private.ai_provider_quota_events
  WHERE provider = p_provider
    AND created_at <= v_now - INTERVAL '24 hours';

  SELECT count(*)::INTEGER INTO v_minute_count
  FROM private.ai_provider_quota_events
  WHERE provider = p_provider
    AND created_at > v_now - INTERVAL '1 minute';

  IF v_minute_count >= p_per_minute THEN
    RETURN FALSE;
  END IF;

  SELECT count(*)::INTEGER INTO v_day_count
  FROM private.ai_provider_quota_events
  WHERE provider = p_provider
    AND created_at > v_now - INTERVAL '24 hours';

  IF v_day_count >= p_per_24_hours THEN
    RETURN FALSE;
  END IF;

  INSERT INTO private.ai_provider_quota_events (provider, created_at)
  VALUES (p_provider, v_now);

  RETURN TRUE;
END;
$function$;

REVOKE ALL ON FUNCTION private.consume_ai_provider_quota(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.consume_ai_provider_quota(TEXT, INTEGER, INTEGER) TO service_role;

COMMENT ON TABLE private.ai_provider_quota_events IS
  'Server-only sliding-window AI provider quota events; each attempted call is reserved before network access.';
COMMENT ON FUNCTION private.consume_ai_provider_quota(TEXT, INTEGER, INTEGER) IS
  'Atomic sliding-window request limiter for shared AI provider credentials; counts failed attempts and serializes concurrent calls.';

COMMIT;
