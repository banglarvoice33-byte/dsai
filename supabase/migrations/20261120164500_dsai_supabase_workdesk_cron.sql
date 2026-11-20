-- Move durable Work Desk processing from Vercel Hobby daily Cron to Supabase-native pg_cron.
-- Supabase owns the schedule; pg_net invokes the authenticated Vercel worker.
-- The bearer secret is stored separately in Supabase Vault and is never committed here.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

GRANT USAGE ON SCHEMA cron TO postgres;
GRANT USAGE ON SCHEMA net TO postgres;

COMMENT ON EXTENSION pg_cron IS
  'Supabase-native scheduler for durable DSAI Work Desk processing.';
COMMENT ON EXTENSION pg_net IS
  'Asynchronous HTTP invocation from Supabase Cron to authenticated DSAI workers.';
