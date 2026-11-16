-- Explicit deny for direct clients on the private image-provider quota ledgers.
-- This temporary policy is superseded by the canonical, tracked policy migration that follows.
BEGIN;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'private'
      AND tablename = 'image_generation_provider_daily_usage'
      AND policyname = 'deny_client_access'
  ) THEN
    CREATE POLICY deny_client_access
      ON private.image_generation_provider_daily_usage
      FOR ALL TO anon, authenticated
      USING (false)
      WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'private'
      AND tablename = 'image_generation_provider_minute_usage'
      AND policyname = 'deny_client_access'
  ) THEN
    CREATE POLICY deny_client_access
      ON private.image_generation_provider_minute_usage
      FOR ALL TO anon, authenticated
      USING (false)
      WITH CHECK (false);
  END IF;
END
$$;
COMMIT;
