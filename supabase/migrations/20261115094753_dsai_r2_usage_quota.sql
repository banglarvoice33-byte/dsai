-- DSAI-only R2 usage ledger. The stored_bytes metric is a live reservation;
-- class_a and class_b counters roll over at UTC month boundaries.
CREATE TABLE IF NOT EXISTS public.dsai_r2_usage_counters (
  period_start date NOT NULL,
  metric text NOT NULL CHECK (metric IN ('class_a', 'class_b', 'stored_bytes')),
  used bigint NOT NULL DEFAULT 0 CHECK (used >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (period_start, metric)
);

ALTER TABLE public.dsai_r2_usage_counters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.dsai_r2_usage_counters FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.dsai_r2_usage_counters TO service_role;

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
BEGIN
  IF p_metric NOT IN ('class_a', 'class_b', 'stored_bytes') OR p_units <= 0 OR p_limit <= 0 THEN
    RAISE EXCEPTION 'invalid DSAI R2 quota reservation';
  END IF;

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
    AND used + p_units <= p_limit
  RETURNING used INTO v_used;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.dsai_r2_release_storage(p_units bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_units <= 0 THEN
    RETURN;
  END IF;
  UPDATE public.dsai_r2_usage_counters
  SET used = GREATEST(0, used - p_units), updated_at = now()
  WHERE period_start = DATE '1970-01-01' AND metric = 'stored_bytes';
END;
$$;

REVOKE ALL ON FUNCTION public.dsai_r2_reserve_usage(text, bigint, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.dsai_r2_release_storage(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.dsai_r2_reserve_usage(text, bigint, bigint) TO service_role, postgres;
GRANT EXECUTE ON FUNCTION public.dsai_r2_release_storage(bigint) TO service_role, postgres;
