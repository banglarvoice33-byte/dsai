# Connector credential encryption key rotation

DSAI connector credentials use AES-256-GCM. Envelope version 2 authenticates the owner ID and provider as AAD. Version 1 remains readable for backward compatibility.

## Key configuration

- Legacy key: `DSAI_CONNECTOR_ENCRYPTION_KEY` (64 hexadecimal characters, 32 random bytes).
- Active key ID: `DSAI_CONNECTOR_ACTIVE_KEY_ID` (1–40 characters: letters, digits, `_`, `-`). Defaults to `legacy`.
- Additional key: `DSAI_CONNECTOR_ENCRYPTION_KEY_<KEY_ID>` (64 hexadecimal characters). For example, key ID `K2` uses `DSAI_CONNECTOR_ENCRYPTION_KEY_K2`.

Never put key material in source control, build logs, issue comments, or browser environment variables. Keep all old key variables available until every row encrypted with them has been rotated and verified.

## Rotation procedure

1. Generate a cryptographically random 32-byte key in an approved secret manager; encode as 64 hex characters.
2. Add `DSAI_CONNECTOR_ENCRYPTION_KEY_K2` to the server-only Vercel Production environment (and the intended staging environment separately).
3. Keep `DSAI_CONNECTOR_ENCRYPTION_KEY` unchanged. Set `DSAI_CONNECTOR_ACTIVE_KEY_ID=K2`.
4. Redeploy the server so new connector writes use key ID `K2`.
5. Run `pnpm connectors:rotate-keys` from a trusted operator environment with the production `DATABASE_URL`, `DSAI_CONNECTOR_ACTIVE_KEY_ID=K2`, `DSAI_CONNECTOR_ENCRYPTION_KEY_K2`, and the old `DSAI_CONNECTOR_ENCRYPTION_KEY` injected from the secret manager.
6. Confirm the command reports `failed: 0` and `rotated` covers the remaining legacy rows. Re-run until `rotated: 0` and all rows are `secret_version=2` with `secret_key_id='K2'`.
7. Verify a small set of existing connectors through the authenticated Test Connection action.
8. Only after confirming no rows reference the old key ID, remove the old key from runtime environments. Retain an encrypted offline recovery copy according to the organization's key-retention policy.

## Operational safety

- The rotation runner processes at most 1,000 rows per batch and uses an optimistic ciphertext match so it cannot overwrite a credential changed concurrently.
- Decryption failures are counted but never print credential values or ciphertext.
- If any row fails, the command exits non-zero. Do not remove the old key; investigate and retry.
- A key rotation is not complete merely because the new key is active. Verify database rows and provider connector tests first.
- The `legacy` key ID maps to the original `DSAI_CONNECTOR_ENCRYPTION_KEY` variable, preserving existing ciphertext compatibility.

