-- Remove a temporary duplicate deny policy added during the live production remediation.
-- Keep the canonical policies introduced by 20261116130000_image_generation_provider_quota_deny_client.sql.
BEGIN;
DROP POLICY IF EXISTS deny_client_access ON private.image_generation_provider_daily_usage;
DROP POLICY IF EXISTS deny_client_access ON private.image_generation_provider_minute_usage;
COMMIT;
