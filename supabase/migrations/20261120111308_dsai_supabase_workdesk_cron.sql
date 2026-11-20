-- Supabase-owned pg_cron/pg_net boundary for DSAI Work Desk.
-- The durable worker schedule is added in a separate, post-provisioning migration.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;
GRANT USAGE ON SCHEMA net TO postgres;

-- The scheduled jobs run as postgres. Application roles must not read Vault
-- secrets or inspect pg_net's queued request headers.
REVOKE ALL ON TABLE vault.secrets FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE vault.decrypted_secrets FROM PUBLIC, anon, authenticated, service_role;
REVOKE USAGE ON SCHEMA net FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON EXTENSION pg_cron IS
  'Supabase-native scheduler for durable DSAI Work Desk processing.';
COMMENT ON EXTENSION pg_net IS
  'Asynchronous HTTP invocation from Supabase Cron to authenticated DSAI workers.';
