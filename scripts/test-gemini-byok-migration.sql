-- Validate the Gemini BYOK migration against the same disposable PostgreSQL instance used by CI.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'private' AND table_name = 'user_connector_credentials' AND column_name = 'secret_version') THEN
    RAISE EXCEPTION 'BYOK_SECRET_VERSION_COLUMN_MISSING';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'private' AND table_name = 'workdesk_text_tasks' AND column_name = 'provider_consent_at') THEN
    RAISE EXCEPTION 'BYOK_CONSENT_COLUMN_MISSING';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'private' AND table_name = 'workdesk_text_tasks' AND column_name = 'provider_charge_status') THEN
    RAISE EXCEPTION 'BYOK_CHARGE_STATUS_COLUMN_MISSING';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'private' AND c.relname = 'user_connector_credentials' AND c.relrowsecurity) THEN
    RAISE EXCEPTION 'BYOK_CREDENTIAL_RLS_NOT_ENABLED';
  END IF;
END;
$$;

INSERT INTO private.user_connector_credentials
  (user_id, provider, secret_ciphertext, secret_nonce, secret_auth_tag, secret_version, secret_hint, status)
VALUES
  (1, 'gemini', repeat('x', 16), repeat('n', 16), repeat('t', 24), 2, '1234', 'connected');

INSERT INTO private.workdesk_text_tasks
  (user_id, idempotency_key, language, prompt, requested_provider, provider_consent_at, provider_charge_status)
VALUES
  (1, 'gemini-consent-ci-0001', 'bn', 'Migration consent acceptance test', 'gemini', now(), 'not_submitted');

DO $$
BEGIN
  BEGIN
    INSERT INTO private.workdesk_text_tasks
      (user_id, idempotency_key, language, prompt, requested_provider, provider_consent_at, provider_charge_status)
    VALUES
      (1, 'gemini-consent-ci-0002', 'bn', 'Migration consent rejection test', 'gemini', NULL, 'not_submitted');
    RAISE EXCEPTION 'GEMINI_CONSENT_CHECK_DID_NOT_REJECT';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;
  BEGIN
    INSERT INTO private.workdesk_text_tasks
      (user_id, idempotency_key, language, prompt, requested_provider, provider_consent_at, provider_charge_status)
    VALUES
      (1, 'gemini-charge-ci-0003', 'bn', 'Migration charge status rejection test', 'gemini', now(), 'charged');
    RAISE EXCEPTION 'GEMINI_CHARGE_STATUS_CHECK_DID_NOT_REJECT';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;
END;
$$;

DELETE FROM private.workdesk_text_tasks WHERE user_id = 1 AND idempotency_key = 'gemini-consent-ci-0001';
DELETE FROM private.user_connector_credentials WHERE user_id = 1 AND provider = 'gemini';
