-- Historical second application recorded in Supabase migration history as 20261120112656.
-- Kept identical and idempotent: cron.schedule with the same job name replaces the existing job.
-- Update the existing production Work Desk Cron job in place; do not create a second worker.
-- The long-lived HMAC key stays in Vault; pg_net only queues a timestamp and derived signature.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM vault.decrypted_secrets
    WHERE name = 'workdesk_worker_auth'
      AND length(decrypted_secret) >= 32
  ) THEN
    RAISE EXCEPTION 'Required Vault secret workdesk_worker_auth is missing or too short';
  END IF;
END
$$;

SELECT cron.schedule(
  'dsai-workdesk-document-worker',
  '* * * * *',
  $workdesk$
    WITH signing_material AS (
      SELECT
        extract(epoch FROM clock_timestamp())::bigint::text AS ts,
        decrypted_secret AS secret
      FROM vault.decrypted_secrets
      WHERE name = 'workdesk_worker_auth'
    ),
    signed_request AS (
      SELECT
        ts,
        encode(
          extensions.hmac(
            convert_to(ts || '.GET./api/scheduled/processDocumentTasks', 'UTF8'),
            convert_to(secret, 'UTF8'),
            'sha256'
          ),
          'hex'
        ) AS signature
      FROM signing_material
    )
    SELECT net.http_get(
      url := 'https://dsai-hub.vercel.app/api/scheduled/processDocumentTasks',
      headers := jsonb_build_object(
        'x-dsai-timestamp', ts,
        'x-dsai-signature', signature
      ),
      timeout_milliseconds := 55000
    ) AS request_id
    FROM signed_request;
  $workdesk$
);
