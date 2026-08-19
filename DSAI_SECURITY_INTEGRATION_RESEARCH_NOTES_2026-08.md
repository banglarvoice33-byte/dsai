# DSAI Security and Integration Research Notes

## OWASP File Upload guidance

Source: [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html). Relevant principles include segregating upload/storage hosts where possible, storing outside the webroot, validating extensions and content rather than trusting the Content-Type header, generating filenames, enforcing file-size limits, authorizing uploads, scanning with antivirus or a sandbox, using content disarm and reconstruction where appropriate, protecting against CSRF and keeping libraries updated. DSAI should keep all unscanned objects quarantined and prevent downstream processing until a positive scan verdict.

## Google Calendar

Source: [Google Calendar API scopes](https://developers.google.com/workspace/calendar/api/auth). Google documents separate scopes for availability (`calendar.freebusy`), read-only calendars/events, event read/write, and broader calendar access. The integration should request the narrowest scope required by the selected workflow, explain it at consent time, and avoid broad all-calendar permissions when a free/busy or owned-events scope is sufficient. Public applications using sensitive user-data scopes may require provider verification.

## HubSpot CRM

Source: [HubSpot Webhooks API guide](https://developers.hubspot.com/docs/api-reference/latest/webhooks/guide). HubSpot requires a secure HTTPS webhook endpoint, app-level subscription configuration, OAuth installation, and object-specific scopes. Webhooks can reduce polling and provide object lifecycle events, including creation, property change, deletion, restore and privacy deletion. DSAI should verify webhook authenticity, deduplicate event delivery, persist provider event IDs, handle retries and rate limits, and map provider privacy deletion events to its own deletion workflow.

## Design implications

The architecture should use a provider-neutral adapter boundary, encrypted token storage, least-privilege scopes, explicit user consent, dry-run previews, idempotency keys, an outbox/inbox event pattern, webhook signature verification, retry with backoff, dead-letter visibility, operator disable switches and audit events. No adapter should be enabled in production until its credentials, callback URL, privacy terms, data map, rate limits, deletion behavior and rollback test are documented.
