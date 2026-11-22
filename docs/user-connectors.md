# User-installable WorkDesk connectors

## Supported connectors

- OpenRouter: credential validation and owner-scoped WorkDesk execution through the `openrouter/free` route.
- Gemini: credential validation and secure storage. WorkDesk execution remains disabled until a verified no-charge policy is available for the account.
- OpenAI and xAI: credential validation and secure storage only. These paid API providers are not used by DSAI's Free-only WorkDesk execution.

Credential validation uses provider metadata/list endpoints only. It does not submit prompts or generate content.

## Encryption key

Set `DSAI_CONNECTOR_ENCRYPTION_KEY` to a randomly generated 32-byte key encoded as 64 hexadecimal characters in both Vercel Preview and Production. Keep the values separate between environments. Do not commit the value, add it to client-side variables, or print it in logs.

Example generation command (run in a trusted local terminal):

```bash
openssl rand -hex 32
```

The key is required to encrypt new credentials and decrypt saved credentials. Back it up in an owner-controlled password manager. Rotating it requires a controlled re-encryption migration; replacing it directly makes existing connector secrets unreadable.

## User flow

1. User opens WorkDesk → Marketplace → Connectors.
2. User creates an API key at the provider's official key-management page.
3. DSAI tests the key against a fixed provider metadata endpoint.
4. On success, DSAI stores an AES-256-GCM encrypted payload in `private.user_connector_credentials`.
5. The browser receives only provider metadata, a four-character hint, and status.
6. For OpenRouter only, the WorkDesk composer can explicitly select the user's own connector. The worker decrypts it server-side and pins the model to `openrouter/free`.
7. Test and disconnect actions are owner-scoped. Disconnect deletes the stored credential row.

## Security boundaries

- No arbitrary endpoint URLs; all provider URLs are fixed in server code.
- Provider tests use GET metadata endpoints, an 8-second timeout, and reject redirects.
- Raw keys and provider response bodies are never returned or logged.
- RLS is forced and browser roles have no privileges on the credential table.
- The API key is write-only from the UI; it is not re-displayed after connect.
- Free-tier availability and provider quotas are not guaranteed by DSAI. The UI distinguishes Free route from account-dependent and paid APIs.
