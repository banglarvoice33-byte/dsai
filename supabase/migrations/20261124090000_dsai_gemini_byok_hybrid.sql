-- DSAI Gemini BYOK: backward-compatible credential envelope versioning and consent audit.
-- Existing connector ciphertext remains readable as version 1; all new writes use owner-bound version 2.
BEGIN;

ALTER TABLE private.user_connector_credentials
  ADD COLUMN IF NOT EXISTS secret_version SMALLINT NOT NULL DEFAULT 1;
ALTER TABLE private.user_connector_credentials
  ADD COLUMN IF NOT EXISTS secret_key_id TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE private.user_connector_credentials
  DROP CONSTRAINT IF EXISTS user_connector_credentials_secret_key_id_check;
ALTER TABLE private.user_connector_credentials
  ADD CONSTRAINT user_connector_credentials_secret_key_id_check
  CHECK (secret_key_id ~ '^[a-zA-Z0-9_-]{1,40}
ALTER TABLE private.user_connector_credentials
  DROP CONSTRAINT IF EXISTS user_connector_credentials_secret_version_check;
ALTER TABLE private.user_connector_credentials
  ADD CONSTRAINT user_connector_credentials_secret_version_check CHECK (secret_version IN (1, 2));

ALTER TABLE private.workdesk_text_tasks
  ADD COLUMN IF NOT EXISTS provider_consent_at TIMESTAMPTZ;
ALTER TABLE private.workdesk_text_tasks
  ADD COLUMN IF NOT EXISTS provider_charge_status TEXT NOT NULL DEFAULT 'not_applicable';
ALTER TABLE private.workdesk_text_tasks
  DROP CONSTRAINT IF EXISTS workdesk_text_tasks_provider_charge_status_check;
ALTER TABLE private.workdesk_text_tasks
  ADD CONSTRAINT workdesk_text_tasks_provider_charge_status_check
  CHECK (provider_charge_status IN ('not_applicable', 'not_submitted', 'submitted', 'unknown'));
ALTER TABLE private.workdesk_text_tasks
  DROP CONSTRAINT IF EXISTS workdesk_text_tasks_requested_provider_check;
ALTER TABLE private.workdesk_text_tasks
  ADD CONSTRAINT workdesk_text_tasks_requested_provider_check
  CHECK (requested_provider IS NULL OR requested_provider IN ('openrouter', 'gemini'));
ALTER TABLE private.workdesk_text_tasks
  DROP CONSTRAINT IF EXISTS workdesk_text_tasks_provider_consent_check;
ALTER TABLE private.workdesk_text_tasks
  ADD CONSTRAINT workdesk_text_tasks_provider_consent_check
  CHECK (
    (requested_provider = 'gemini' AND provider_consent_at IS NOT NULL)
    OR (requested_provider IS DISTINCT FROM 'gemini' AND provider_consent_at IS NULL)
  );

COMMENT ON COLUMN private.user_connector_credentials.secret_key_id IS
  'Identifier selecting the versioned DSAI connector encryption key. Keep old key IDs available until all credentials have been re-encrypted.';
COMMENT ON COLUMN private.user_connector_credentials.secret_version IS
  'Credential envelope version. Version 1 is legacy AES-256-GCM without owner AAD; version 2 binds user_id and provider as authenticated additional data.';
COMMENT ON COLUMN private.workdesk_text_tasks.provider_charge_status IS
  'BYOK provider request billing uncertainty. unknown means the provider may have accepted the request even though DSAI did not receive a definitive response.';
COMMENT ON COLUMN private.workdesk_text_tasks.provider_consent_at IS
  'Timestamp of explicit user consent to send this task to their own Gemini API project, where provider charges may apply.';

COMMIT;
);
ALTER TABLE private.user_connector_credentials
  DROP CONSTRAINT IF EXISTS user_connector_credentials_secret_version_check;
ALTER TABLE private.user_connector_credentials
  ADD CONSTRAINT user_connector_credentials_secret_version_check CHECK (secret_version IN (1, 2));

ALTER TABLE private.workdesk_text_tasks
  ADD COLUMN IF NOT EXISTS provider_consent_at TIMESTAMPTZ;
ALTER TABLE private.workdesk_text_tasks
  ADD COLUMN IF NOT EXISTS provider_charge_status TEXT NOT NULL DEFAULT 'not_applicable';
ALTER TABLE private.workdesk_text_tasks
  DROP CONSTRAINT IF EXISTS workdesk_text_tasks_provider_charge_status_check;
ALTER TABLE private.workdesk_text_tasks
  ADD CONSTRAINT workdesk_text_tasks_provider_charge_status_check
  CHECK (provider_charge_status IN ('not_applicable', 'not_submitted', 'submitted', 'unknown'));
ALTER TABLE private.workdesk_text_tasks
  DROP CONSTRAINT IF EXISTS workdesk_text_tasks_requested_provider_check;
ALTER TABLE private.workdesk_text_tasks
  ADD CONSTRAINT workdesk_text_tasks_requested_provider_check
  CHECK (requested_provider IS NULL OR requested_provider IN ('openrouter', 'gemini'));
ALTER TABLE private.workdesk_text_tasks
  DROP CONSTRAINT IF EXISTS workdesk_text_tasks_provider_consent_check;
ALTER TABLE private.workdesk_text_tasks
  ADD CONSTRAINT workdesk_text_tasks_provider_consent_check
  CHECK (
    (requested_provider = 'gemini' AND provider_consent_at IS NOT NULL)
    OR (requested_provider IS DISTINCT FROM 'gemini' AND provider_consent_at IS NULL)
  );

COMMENT ON COLUMN private.user_connector_credentials.secret_version IS
  'Credential envelope version. Version 1 is legacy AES-256-GCM without owner AAD; version 2 binds user_id and provider as authenticated additional data.';
COMMENT ON COLUMN private.workdesk_text_tasks.provider_charge_status IS
  'BYOK provider request billing uncertainty. unknown means the provider may have accepted the request even though DSAI did not receive a definitive response.';
COMMENT ON COLUMN private.workdesk_text_tasks.provider_consent_at IS
  'Timestamp of explicit user consent to send this task to their own Gemini API project, where provider charges may apply.';

COMMIT;
