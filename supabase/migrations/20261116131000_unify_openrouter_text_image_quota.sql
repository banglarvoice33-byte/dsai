-- Share the same OpenRouter free-tier quota ledger across text and image requests.
-- The image path remains stricter at 10/minute; the combined account ceiling is 40/24h.
BEGIN;

CREATE OR REPLACE FUNCTION private.dsai_reserve_image_generation(p_user_id INTEGER)
RETURNS TABLE(allowed BOOLEAN, used_today INTEGER, daily_limit INTEGER, reason TEXT, usage_date DATE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_date DATE := (timezone('Asia/Dhaka', now()))::date;
  v_minute TIMESTAMPTZ := date_trunc('minute', now());
  v_global_users INTEGER;
  v_new_user BOOLEAN := false;
  v_count INTEGER;
  v_provider_count INTEGER;
  v_minute_count INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('dsai-image-generation:' || v_date::text, 0));

  UPDATE public.image_generation_daily_users AS daily_users SET reservations = 0
  WHERE daily_users.usage_date = v_date AND daily_users.reservations > 0
    AND daily_users.last_reserved_at < now() - interval '15 minutes';
  DELETE FROM public.image_generation_daily_users AS daily_users
  WHERE daily_users.usage_date = v_date AND daily_users.reservations = 0 AND daily_users.successful_count = 0;

  DELETE FROM private.image_generation_provider_minute_usage AS minute_usage
  WHERE minute_usage.minute_start < now() - interval '1 day';

  INSERT INTO public.image_generation_daily_users(usage_date,user_id,last_reserved_at)
  VALUES(v_date,p_user_id,now())
  ON CONFLICT ON CONSTRAINT image_generation_daily_users_pkey DO NOTHING;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_new_user := v_count = 1;

  IF v_new_user THEN
    SELECT count(*)::integer INTO v_global_users
    FROM public.image_generation_daily_users AS daily_users
    WHERE daily_users.usage_date = v_date;
    IF v_global_users > 500 THEN
      DELETE FROM public.image_generation_daily_users AS daily_users
      WHERE daily_users.usage_date = v_date AND daily_users.user_id = p_user_id
        AND daily_users.reservations = 0 AND daily_users.successful_count = 0;
      RETURN QUERY SELECT false,0,2,'global_daily_limit'::text,v_date;
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.image_generation_usage(user_id,usage_date,request_count)
  VALUES(p_user_id,v_date,1)
  ON CONFLICT ON CONSTRAINT image_generation_usage_pkey DO UPDATE
    SET request_count = public.image_generation_usage.request_count + 1
    WHERE public.image_generation_usage.request_count < 2
  RETURNING request_count INTO v_count;

  IF v_count IS NULL THEN
    SELECT usage.request_count INTO v_count
    FROM public.image_generation_usage AS usage
    WHERE usage.user_id = p_user_id AND usage.usage_date = v_date;
    IF v_new_user THEN
      DELETE FROM public.image_generation_daily_users AS daily_users
      WHERE daily_users.usage_date = v_date AND daily_users.user_id = p_user_id
        AND daily_users.reservations = 0 AND daily_users.successful_count = 0;
    END IF;
    RETURN QUERY SELECT false,coalesce(v_count,2),2,'daily_limit_reached'::text,v_date;
    RETURN;
  END IF;

  INSERT INTO private.image_generation_provider_daily_usage(usage_date,request_count)
  VALUES(v_date,1)
  ON CONFLICT ON CONSTRAINT image_generation_provider_daily_usage_pkey DO UPDATE
    SET request_count = private.image_generation_provider_daily_usage.request_count + 1,
        updated_at = now()
    WHERE private.image_generation_provider_daily_usage.request_count < 40
  RETURNING request_count INTO v_provider_count;

  IF v_provider_count IS NULL THEN
    UPDATE public.image_generation_usage AS usage
    SET request_count = greatest(usage.request_count - 1,0)
    WHERE usage.user_id = p_user_id AND usage.usage_date = v_date;
    IF v_new_user THEN
      DELETE FROM public.image_generation_daily_users AS daily_users
      WHERE daily_users.usage_date = v_date AND daily_users.user_id = p_user_id
        AND daily_users.reservations = 0 AND daily_users.successful_count = 0;
    END IF;
    RETURN QUERY SELECT false,greatest(coalesce(v_count,1)-1,0),2,'provider_daily_limit'::text,v_date;
    RETURN;
  END IF;

  INSERT INTO private.image_generation_provider_minute_usage(minute_start,request_count)
  VALUES(v_minute,1)
  ON CONFLICT (minute_start) DO UPDATE
    SET request_count = private.image_generation_provider_minute_usage.request_count + 1,
        updated_at = now()
    WHERE private.image_generation_provider_minute_usage.request_count < 10
  RETURNING request_count INTO v_minute_count;

  IF v_minute_count IS NULL THEN
    UPDATE private.image_generation_provider_daily_usage AS provider_daily
    SET request_count = greatest(provider_daily.request_count - 1,0), updated_at = now()
    WHERE provider_daily.usage_date = v_date;
    UPDATE public.image_generation_usage AS usage
    SET request_count = greatest(usage.request_count - 1,0)
    WHERE usage.user_id = p_user_id AND usage.usage_date = v_date;
    IF v_new_user THEN
      DELETE FROM public.image_generation_daily_users AS daily_users
      WHERE daily_users.usage_date = v_date AND daily_users.user_id = p_user_id
        AND daily_users.reservations = 0 AND daily_users.successful_count = 0;
    END IF;
    RETURN QUERY SELECT false,greatest(coalesce(v_count,1)-1,0),2,'provider_rate_limit'::text,v_date;
    RETURN;
  END IF;

  -- Shared OpenRouter account quota: image requests now count against the same
  -- rolling 24-hour and 60-second ledger as text completions.
  IF NOT private.consume_ai_provider_quota('openrouter', 10, 40) THEN
    UPDATE private.image_generation_provider_minute_usage AS minute_usage
    SET request_count = greatest(minute_usage.request_count - 1,0), updated_at = now()
    WHERE minute_usage.minute_start = v_minute;
    UPDATE private.image_generation_provider_daily_usage AS provider_daily
    SET request_count = greatest(provider_daily.request_count - 1,0), updated_at = now()
    WHERE provider_daily.usage_date = v_date;
    UPDATE public.image_generation_usage AS usage
    SET request_count = greatest(usage.request_count - 1,0)
    WHERE usage.user_id = p_user_id AND usage.usage_date = v_date;
    IF v_new_user THEN
      DELETE FROM public.image_generation_daily_users AS daily_users
      WHERE daily_users.usage_date = v_date AND daily_users.user_id = p_user_id
        AND daily_users.reservations = 0 AND daily_users.successful_count = 0;
    END IF;
    RETURN QUERY SELECT false,greatest(coalesce(v_count,1)-1,0),2,'provider_global_quota'::text,v_date;
    RETURN;
  END IF;

  UPDATE public.image_generation_daily_users AS daily_users
  SET reservations = daily_users.reservations + 1,
      last_reserved_at = now()
  WHERE daily_users.usage_date = v_date AND daily_users.user_id = p_user_id;

  RETURN QUERY SELECT true,v_count,2,null::text,v_date;
END;
$function$;

COMMENT ON FUNCTION private.dsai_reserve_image_generation(INTEGER) IS
  'Reserves one user image slot and one shared OpenRouter request quota slot before generation; image path is limited to 10/minute and 40/rolling 24 hours.';

COMMIT;
