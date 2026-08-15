# Backend Integration Checklist

- [x] Inspect the current static frontend routes, calls, and deployment assumptions.
- [x] Add a supported backend/database/user foundation without breaking the existing design.
- [x] Define the first API and data contracts for waitlist, UAA cases, and Creative Studio requests.
- [x] Connect frontend CTAs/forms to backend persistence with loading, success, and error states.
- [x] Connect UAA case creation/listing and Creative Studio request submission to protected tRPC procedures.
- [x] Add environment and launch documentation, including migration and secret requirements.
- [x] Run typecheck, build, API smoke tests, and browser verification.
- [ ] Save an integrated checkpoint and deliver the launch-ready package.
- [x] Connect actual frontend flows for UAA case creation/listing and Creative Studio request submission, replacing advertised placeholder actions.
- [x] Add live no-write API smoke verification for waitlist validation and the unauthenticated protected-route check; avoid seeding test records.
- [x] Render the authenticated UAA case list with title, status, created time, and loading/empty/error states instead of only a count.
- [x] Update the authenticated UAA case list to display created date and time, then re-run validation.
