-- Make the intentional server-only access boundary explicit for tables that
-- are written only through trusted backend/service-role connections.
-- RLS already denied browser access by default; these restrictive policies
-- document and preserve that deny boundary without granting new privileges.

DO $migration$
DECLARE
  target_table regclass;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'private.user_connector_credentials'::regclass,
    'private.user_connector_rate_limits'::regclass,
    'public.ai_usage_logs'::regclass,
    'public.usage_counters'::regclass
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS server_only_deny_browser ON %s', target_table);
    EXECUTE format(
      'CREATE POLICY server_only_deny_browser ON %s AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
      target_table
    );
  END LOOP;
END
$migration$;
