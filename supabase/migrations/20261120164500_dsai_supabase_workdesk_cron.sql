-- Move durable Work Desk processing from Vercel Hobby daily Cron to Supabase-native pg_cron.
-- pg_net invokes authenticated Vercel workers. HMAC signatures are sent, never the long-lived secret.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;
GRANT USAGE ON SCHEMA net TO postgres;

-- The scheduled jobs run as postgres. Do not let the application service role
-- read Vault secrets or pg_net's queued request headers.
REVOKE ALL ON TABLE vault.secrets FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE vault.decrypted_secrets FROM PUBLIC, anon, authenticated, service_role;
REVOKE USAGE ON SCHEMA net FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON EXTENSION pg_cron IS
  'Supabase-native scheduler for durable DSAI Work Desk processing.';
COMMENT ON EXTENSION pg_net IS
  'Asynchronous HTTP invocation from Supabase Cron to authenticated DSAI workers.';
