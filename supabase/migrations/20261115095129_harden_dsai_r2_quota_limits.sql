-- Harden quota function so callers cannot raise the application ceilings.
CREATE OR REPLACE FUNCTION public.dsai_r2_reserve_usage(
  p_metric text,
  p_units bigint,
  p_limit bigint
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period date;
  v_used bigint;
  v_hard_limit bigint;
  v_effective_limit bigint;
BEGIN
  IF p_metric NOT IN ('class_a', 'class_b', 'stored_bytes') OR p_units <= 0 OR p_limit <= 0 THEN
    RAISE EXCEPTION 'invalid DSAI R2 quota reservation';
  END IF;

  v_hard_limit := CASE p_metric
    WHEN 'stored_bytes' THEN 4500000000
    WHEN 'class_a' THEN 450000
    WHEN 'class_b' THEN 4500000
  END;
  v_effective_limit := LEAST(p_limit, v_hard_limit);

  IF p_metric = 'stored_bytes' THEN
    v_period := DATE '1970-01-01';
  ELSE
    v_period := date_trunc('month', timezone('UTC', now()))::date;
  END IF;

  INSERT INTO public.dsai_r2_usage_counters (period_start, metric, used)
  VALUES (v_period, p_metric, 0)
  ON CONFLICT (period_start, metric) DO NOTHING;

  UPDATE public.dsai_r2_usage_counters
  SET used = used + p_units, updated_at = now()
  WHERE period_start = v_period
    AND metric = p_metric
    AND used + p_units <= v_effective_limit
  RETURNING used INTO v_used;

  RETURN FOUND;
END;
$$;
