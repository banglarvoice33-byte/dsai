# DSAI Privacy and Changelog Visual Verification — 2026-08-15

Desktop and mobile full-page captures were taken for `/privacy`, `/changelog`, and `/admin/changelog`.

The Privacy Policy presents the implemented data categories, purpose, AI/human-review boundary, API-key safety, retention limitations, third-party provider boundary, sensitive-data warning and email request path. The Changelog shows a clear empty state when no published records exist and explains that drafts remain private. The admin page shows the draft form and public-record control panel; it was captured in an authenticated admin preview, while backend authorization tests separately cover regular-user rejection.

The mobile captures stack the policy sections, changelog empty state and admin form without visible horizontal overflow. The changelog manager preserves readable fields, category selection and publish controls at the narrow viewport.
