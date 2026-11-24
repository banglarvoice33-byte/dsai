-- Make the intentional server-only access boundary explicit for tables that
-- are written only through trusted backend/service-role connections.
-- RLS already denied browser access by default; these restrictive policies
-- document and preserve that deny boundary without granting new privileges.

DROP POLICY IF EXISTS server_only_deny_browser ON private.user_connector_credentials;
CREATE POLICY server_only_deny_browser
  ON private.user_connector_credentials AS RESTRICTIVE
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS server_only_deny_browser ON private.user_connector_rate_limits;
CREATE POLICY server_only_deny_browser
  ON private.user_connector_rate_limits AS RESTRICTIVE
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS server_only_deny_browser ON public.ai_usage_logs;
CREATE POLICY server_only_deny_browser
  ON public.ai_usage_logs AS RESTRICTIVE
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS server_only_deny_browser ON public.usage_counters;
CREATE POLICY server_only_deny_browser
  ON public.usage_counters AS RESTRICTIVE
  FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);
