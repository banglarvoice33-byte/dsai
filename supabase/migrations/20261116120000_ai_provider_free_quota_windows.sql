-- Global account-level quota windows for free-only provider routing.
-- Counts are reserved before outbound requests; failed attempts consume quota too.
BEGIN;

CREATE TABLE IF NOT EXISTS private.ai_provider_quota_windows (
  provider TEXT NOT NULL CHECK (provider IN ('openrouter', 'cloudflare')),
  window_kind TEXT NOT NULL CHECK (window_kind IN ('minute', 'day')),
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, window_kind, window_start)
);

ALTER TABLE private.ai_provider_quota_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.ai_provider_quota_windows FORCE ROW LEVEL SECURITY;

REVOKE ALL ON private.ai_provider_quota_windows FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON private.ai_provider_quota_windows TO service_role;

CREATE POLICY ai_provider_quota_windows_deny_client
  ON private.ai_provider_quota_windows
  FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

COMMENT ON TABLE private.ai_provider_quota_windows IS
  'Server-only global provider request quota windows; reserves a request before outbound API calls, including failed attempts.';

COMMIT;
