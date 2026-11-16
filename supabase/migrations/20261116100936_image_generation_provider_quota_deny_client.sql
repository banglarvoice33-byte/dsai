-- Explicitly deny direct client access to the private image-generation quota ledgers.
-- Security-definer server RPCs remain the only intended mutation path.
BEGIN;

REVOKE ALL ON private.image_generation_provider_daily_usage FROM PUBLIC, anon, authenticated;
REVOKE ALL ON private.image_generation_provider_minute_usage FROM PUBLIC, anon, authenticated;

CREATE POLICY image_generation_provider_daily_usage_deny_client
  ON private.image_generation_provider_daily_usage
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY image_generation_provider_minute_usage_deny_client
  ON private.image_generation_provider_minute_usage
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

COMMIT;
