-- Forward correction: include legacy rows created today in the per-owner daily cap.
CREATE OR REPLACE FUNCTION private.dsai_create_lead(
  p_owner_id integer,
  p_request_id uuid,
  p_full_name text,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_company text DEFAULT NULL,
  p_source text DEFAULT 'manual',
  p_notes text DEFAULT NULL
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
  v_lead_id integer;
  v_existing public.usage_logs%ROWTYPE;
  v_email text := nullif(lower(btrim(p_email)), '');
  v_phone text := nullif(btrim(p_phone), '');
  v_name text := nullif(btrim(p_full_name), '');
  v_reason text;
  v_quality jsonb;
BEGIN
  IF p_owner_id IS NULL OR p_request_id IS NULL
     OR NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = p_owner_id) THEN
    RETURN jsonb_build_object('ok', false, 'status', 'rejected', 'reason', 'invalid_owner_or_request');
  END IF;

  -- A transaction-scoped lock makes quota checks safe under concurrent requests.
  PERFORM pg_advisory_xact_lock(
    hashtextextended('dsai-lead-crm:' || p_owner_id::text || ':' || v_day::text, 0)
  );

  SELECT * INTO v_existing
  FROM public.usage_logs
  WHERE owner_id = p_owner_id
    AND service = 'lead_crm'
    AND action = 'lead.create'
    AND request_id = p_request_id;

  IF FOUND THEN
    IF v_existing.outcome = 'success' AND v_existing.resource_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'ok', true, 'status', 'created', 'lead_id', v_existing.resource_id,
        'idempotent_replay', true
      );
    END IF;
    RETURN jsonb_build_object(
      'ok', false, 'status', v_existing.outcome,
      'reason', coalesce(v_existing.metadata->>'reason', 'previous_request_rejected'),
      'idempotent_replay', true
    );
  END IF;

  IF v_name IS NULL OR length(v_name) < 2 OR length(v_name) > 160 THEN
    v_reason := 'quality_gate_name_invalid';
  ELSIF v_email IS NULL AND v_phone IS NULL THEN
    v_reason := 'quality_gate_contact_required';
  ELSIF v_email IS NOT NULL AND v_email !~* '^[A-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$' THEN
    v_reason := 'quality_gate_email_invalid';
  ELSIF v_phone IS NOT NULL AND length(regexp_replace(v_phone, '[^0-9]', '', 'g')) NOT BETWEEN 7 AND 15 THEN
    v_reason := 'quality_gate_phone_invalid';
  ELSIF coalesce(p_source, 'manual') NOT IN ('manual', 'website', 'import', 'api', 'ai_enriched') THEN
    v_reason := 'quality_gate_source_invalid';
  END IF;

  IF v_reason IS NOT NULL THEN
    INSERT INTO public.usage_logs(owner_id, service, action, quantity, outcome, request_id, metadata)
    VALUES (p_owner_id, 'lead_crm', 'lead.create', 0, 'rejected', p_request_id,
            jsonb_build_object('reason', v_reason, 'quality_gate', 'failed'));
    RETURN jsonb_build_object('ok', false, 'status', 'rejected', 'reason', v_reason);
  END IF;

  IF v_email IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.lead_records lr
    WHERE lr."userId" = p_owner_id AND lower(lr.email) = v_email
  ) THEN
    INSERT INTO public.usage_logs(owner_id, service, action, quantity, outcome, request_id, metadata)
    VALUES (p_owner_id, 'lead_crm', 'lead.create', 0, 'rejected', p_request_id,
            jsonb_build_object('reason', 'duplicate_lead'));
    RETURN jsonb_build_object('ok', false, 'status', 'rejected', 'reason', 'duplicate_lead');
  END IF;

  SELECT coalesce(sum(quantity), 0)::integer INTO v_used
  FROM public.usage_logs
  WHERE owner_id = p_owner_id
    AND service = 'lead_crm'
    AND action = 'lead.create'
    AND outcome = 'success'
    AND created_at >= v_day_start
    AND created_at < v_day_start + interval '1 day';

  -- Preserve the cap across migration: count legacy CRM rows created today too.
  -- GREATEST avoids double-counting rows that also have a usage-log entry.
  v_used := greatest(
    v_used,
    (SELECT count(*)::integer
     FROM public.lead_records lr
     WHERE lr."userId" = p_owner_id
       AND lr."createdAt" >= (v_day_start AT TIME ZONE 'UTC')
       AND lr."createdAt" < ((v_day_start + interval '1 day') AT TIME ZONE 'UTC'))
  );

  IF v_used >= 20 THEN
    INSERT INTO public.usage_logs(owner_id, service, action, quantity, outcome, request_id, metadata)
    VALUES (p_owner_id, 'lead_crm', 'lead.create', 0, 'rejected', p_request_id,
            jsonb_build_object('reason', 'daily_limit_reached', 'daily_limit', 20, 'used_today', v_used));
    RETURN jsonb_build_object(
      'ok', false, 'status', 'rejected', 'reason', 'daily_limit_reached',
      'daily_limit', 20, 'used_today', v_used
    );
  END IF;

  v_quality := jsonb_build_object(
    'status', 'passed',
    'name_present', true,
    'contact_present', true,
    'email_valid', v_email IS NOT NULL,
    'phone_valid', v_phone IS NOT NULL
  );

  BEGIN
    INSERT INTO public.lead_records(
      "userId", title, company, "contactName", email, phone, source, notes, quality_gate, request_id
    )
    VALUES (
      p_owner_id, coalesce(nullif(btrim(p_company), ''), v_name),
      nullif(btrim(p_company), ''), v_name, v_email, v_phone,
      coalesce(p_source, 'manual'), nullif(btrim(p_notes), ''), v_quality, p_request_id
    )
    RETURNING id INTO v_lead_id;
  EXCEPTION WHEN unique_violation THEN
    INSERT INTO public.usage_logs(owner_id, service, action, quantity, outcome, request_id, metadata)
    VALUES (p_owner_id, 'lead_crm', 'lead.create', 0, 'rejected', p_request_id,
            jsonb_build_object('reason', 'duplicate_lead'));
    RETURN jsonb_build_object('ok', false, 'status', 'rejected', 'reason', 'duplicate_lead');
  END;

  INSERT INTO public.usage_logs(owner_id, service, action, quantity, outcome, request_id, resource_id, metadata)
  VALUES (
    p_owner_id, 'lead_crm', 'lead.create', 1, 'success', p_request_id, v_lead_id,
    jsonb_build_object('quality_gate', 'passed', 'daily_limit', 20, 'used_today', v_used + 1)
  );

  RETURN jsonb_build_object(
    'ok', true, 'status', 'created', 'lead_id', v_lead_id,
    'daily_limit', 20, 'used_today', v_used + 1, 'quality_gate', 'passed',
    'idempotent_replay', false
  );
END;
$$;
