-- A minimal, non-sensitive DB probe for the public dsai-health Edge Function.
CREATE OR REPLACE FUNCTION public.dsai_healthcheck()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT true;
$$;

REVOKE ALL ON FUNCTION public.dsai_healthcheck() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.dsai_healthcheck() TO service_role;

COMMENT ON FUNCTION public.dsai_healthcheck() IS
  'Minimal, read-only runtime probe used by the dsai-health Edge Function; returns only database reachability.';

NOTIFY pgrst, 'reload schema';
