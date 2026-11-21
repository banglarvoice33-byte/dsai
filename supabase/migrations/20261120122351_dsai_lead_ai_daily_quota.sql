-- Daily quality/capacity gate for AI lead composition.
-- Each attempt reserves one unit before calling the provider; failures still count
-- toward the daily cap to prevent unbounded retry/provider spend.

CREATE OR REPLACE FUNCTION private.dsai_reserve_lead_ai(
  p_owner_id integer,
  p_request_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_day date := (timezone('UTC', now()))::date;
  v_day_start timestamptz := ((timezone('UTC', now()))::date)::timestamp AT TIME ZONE 'UTC';
  v_used integer := 0;
BEGIN
  IF p_owner_id IS NULL OR p_request_id IS NULL
     OR NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = p_owner_id) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_owner_or_request');
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended('dsai-lead-ai:' || p_owner_id::text || ':' || v_day::text, 0)
  );

  IF EXISTS (
    SELECT 1 FROM public.usage_logs
    WHERE owner_id = p_owner_id AND service = 'lead_ai'
      AND action = 'compose' AND request_id = p_request_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'request_already_used');
  END IF;

  SELECT coalesce(sum(quantity), 0)::integer INTO v_used
  FROM public.usage_logs
  WHERE owner_id = p_owner_id
    AND service = 'lead_ai'
    AND action = 'compose'
    AND outcome IN ('success', 'failed')
    AND created_at >= v_day_start
    AND created_at < v_day_start + interval '1 day';

  IF v_used >= 20 THEN
    INSERT INTO public.usage_logs(owner_id, service, action, quantity, outcome, request_id, metadata)
    VALUES (
      p_owner_id, 'lead_ai', 'compose', 0, 'rejected', p_request_id,
      jsonb_build_object('reason', 'daily_limit_reached', 'daily_limit', 20, 'used_today', v_used)
    );
    RETURN jsonb_build_object(
      'ok', false, 'reason', 'daily_limit_reached',
      'daily_limit', 20, 'used_today', v_used
    );
  END IF;

  -- Mark as failed/reserved immediately. This consumes one unit even if the provider times out.
  INSERT INTO public.usage_logs(owner_id, service, action, quantity, outcome, request_id, metadata)
  VALUES (
    p_owner_id, 'lead_ai', 'compose', 1, 'failed', p_request_id,
    jsonb_build_object('state', 'reserved', 'daily_limit', 20, 'used_today', v_used + 1)
  );

  RETURN jsonb_build_object('ok', true, 'daily_limit', 20, 'used_today', v_used + 1);
END;
$$;

CREATE OR REPLACE FUNCTION private.dsai_finalize_lead_ai(
  p_owner_id integer,
  p_request_id uuid,
  p_success boolean,
  p_model text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
BEGIN
  UPDATE public.usage_logs
  SET outcome = CASE WHEN p_success THEN 'success' ELSE 'failed' END,
      metadata = metadata || jsonb_build_object(
        'state', CASE WHEN p_success THEN 'completed' ELSE 'failed' END,
        'model', left(coalesce(p_model, ''), 120),
        'finished_at', now()
      )
  WHERE owner_id = p_owner_id
    AND service = 'lead_ai'
    AND action = 'compose'
    AND request_id = p_request_id
    AND outcome = 'failed'
    AND metadata->>'state' = 'reserved';

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION private.dsai_reserve_lead_ai(integer, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.dsai_finalize_lead_ai(integer, uuid, boolean, text) FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
GRANT EXECUTE ON FUNCTION private.dsai_reserve_lead_ai(integer, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION private.dsai_finalize_lead_ai(integer, uuid, boolean, text) TO service_role;

COMMENT ON FUNCTION private.dsai_reserve_lead_ai(integer, uuid) IS
  'Reserves one AI lead composition attempt under a per-owner UTC daily cap of 20.';
COMMENT ON FUNCTION private.dsai_finalize_lead_ai(integer, uuid, boolean, text) IS
  'Finalizes the reserved AI lead composition usage log; provider failures consume the reservation.';
