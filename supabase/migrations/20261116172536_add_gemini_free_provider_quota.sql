-- Extend the existing atomic free-provider quota guard to Gemini.
-- Gemini is not enabled by this migration; the server-side no-billing gate must be confirmed separately.
BEGIN;

ALTER TABLE private.ai_provider_quota_events
  DROP CONSTRAINT ai_provider_quota_events_provider_check;

ALTER TABLE private.ai_provider_quota_events
  ADD CONSTRAINT ai_provider_quota_events_provider_check
  CHECK (provider IN ('openrouter', 'cloudflare', 'gemini'));

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
  IF p_provider IS NULL OR p_provider NOT IN ('openrouter', 'cloudflare', 'gemini') THEN
    RAISE EXCEPTION 'unsupported AI provider quota key';
  END IF;
  IF p_per_minute < 1 OR p_per_24_hours < 1 OR p_per_minute > p_per_24_hours THEN
    RAISE EXCEPTION 'invalid AI provider quota limits';
  END IF;

  -- Serialize concurrent requests per provider before checking either window.
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

COMMENT ON FUNCTION private.consume_ai_provider_quota(TEXT, INTEGER, INTEGER) IS
  'Atomic sliding-window quota for OpenRouter, Cloudflare Workers AI, and Gemini free-only routes.';

COMMIT;
