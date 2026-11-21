-- Supabase-owned pg_cron/pg_net boundary for DSAI Work Desk.
-- The durable worker schedule is added in a separate, post-provisioning migration.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;
GRANT USAGE ON SCHEMA net TO postgres;
-- Best-effort revokes for application roles. Supabase owns these schemas as
-- supabase_admin; platform-managed grants may remain. HMAC keeps the long-lived
-- signing secret out of pg_net request headers regardless of queue visibility.
-- The scheduled job runs as postgres. Supabase-managed ACLs can retain Vault
-- read access for service_role/supabase_read_only_user and pg_net schema access
-- for application roles; treat those roles as privileged secret holders.
-- Never place the long-lived Vault key in pg_net headers: only a short-lived
-- timestamp-bound HMAC signature is allowed in the request queue.
REVOKE ALL ON TABLE vault.secrets FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON TABLE vault.decrypted_secrets FROM PUBLIC, anon, authenticated, service_role;
REVOKE USAGE ON SCHEMA net FROM PUBLIC, anon, authenticated, service_role;
COMMENT ON EXTENSION pg_cron IS 'Supabase-native scheduler for durable DSAI Work Desk processing.';
COMMENT ON EXTENSION pg_net IS 'Asynchronous HTTP invocation from Supabase Cron to authenticated DSAI workers.';
