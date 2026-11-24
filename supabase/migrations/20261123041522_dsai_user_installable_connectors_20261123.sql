-- Per-user connector credential storage and install/test rate limits.
-- The application encrypts secret payloads with AES-256-GCM before insertion.
CREATE TABLE IF NOT EXISTS private.user_connector_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('openrouter', 'gemini', 'openai', 'xai')),
  secret_ciphertext text NOT NULL,
  secret_nonce text NOT NULL,
  secret_auth_tag text NOT NULL,
  secret_hint varchar(4) NOT NULL,
  status text NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'degraded')),
  last_tested_at timestamptz,
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_connector_credentials_user_provider_unique UNIQUE (user_id, provider),
  CONSTRAINT user_connector_credentials_ciphertext_length CHECK (length(secret_ciphertext) BETWEEN 16 AND 8192),
  CONSTRAINT user_connector_credentials_nonce_length CHECK (length(secret_nonce) = 16),
  CONSTRAINT user_connector_credentials_tag_length CHECK (length(secret_auth_tag) = 24)
);

CREATE INDEX IF NOT EXISTS user_connector_credentials_user_updated_idx
  ON private.user_connector_credentials (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS private.user_connector_rate_limits (
  user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0 CHECK (request_count BETWEEN 0 AND 5),
  PRIMARY KEY (user_id, window_start)
);

ALTER TABLE private.user_connector_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.user_connector_credentials FORCE ROW LEVEL SECURITY;
ALTER TABLE private.user_connector_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.user_connector_rate_limits FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE private.user_connector_credentials, private.user_connector_rate_limits FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE private.user_connector_credentials, private.user_connector_rate_limits TO service_role;

ALTER TABLE private.workdesk_text_tasks
  ADD COLUMN IF NOT EXISTS requested_provider text;
ALTER TABLE private.workdesk_text_tasks
  DROP CONSTRAINT IF EXISTS workdesk_text_tasks_requested_provider_check;
ALTER TABLE private.workdesk_text_tasks
  ADD CONSTRAINT workdesk_text_tasks_requested_provider_check
  CHECK (requested_provider IS NULL OR requested_provider = 'openrouter');

COMMENT ON TABLE private.user_connector_credentials IS
  'Server-only per-user provider credentials. Secret payload is AES-256-GCM encrypted; never expose ciphertext or plaintext through client APIs.';
COMMENT ON COLUMN private.workdesk_text_tasks.requested_provider IS
  'Optional owner-selected personal connector. Currently restricted to the OpenRouter free route.';
