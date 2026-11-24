# DSAI production remediation evidence — 2026-11-24

Repository: `banglarvoice33-byte/dsai`
Branch: `main`
Production origin: `https://dsai-hub.vercel.app`
Architecture: React 19, Wouter, Vite 7, Express + tRPC, Vercel; static build output `dist/public`.

## Evidence ledger

### P0 — baseline and backend

- (V) Source uses Wouter route registration in `client/src/App.tsx`; this is not a Next.js App Router project.
- (V) The public router metadata is `PUBLIC_PAGE_METADATA` in `client/src/App.tsx`, updated client-side by the route effect.
- (V) `client/public/sitemap.xml`, `client/public/robots.txt`, and the base Organization JSON-LD in `client/index.html` exist.
- (V) No public Contact-message mutation was found in `server/routers.ts`; the inspected router includes waitlist and privacy-deletion mutations, neither of which is a general Contact-message endpoint.
- (G) A verified DSAI-owned email, phone number, or other contact channel has not been supplied or verified. The Contact page therefore intentionally has no form and publishes no invented contact details.
- (G) Raw-HTML production curl checks and route HTTP checks have not yet been completed from this execution environment; DNS resolution to the production host failed here. This is an environment verification gap, not proof of a production route failure.

### P1 — public routes and content

- (V) Added Wouter routes `/about` and `/contact` with lazy-loaded page components.
- (V) Added both paths to `PUBLIC_PAGE_METADATA`.
- (V) Added both URLs to `client/public/sitemap.xml`.
- (V) About content is limited to source-verifiable product capabilities, responsible-use statements, and the verified React 19 / Wouter / Vite 7 / Express / tRPC stack.
- (V) Contact page states that no verified contact channel or message form is currently published.
- (V) The homepage footer and CTA no longer publish the previously unverified email strings.
- (V) The Terms page now directs visitors to the Contact status page instead of publishing an unverified email.
- (V) The Organization JSON-LD no longer contains unverified email/contactPoint fields and its JSON syntax was parsed successfully after editing.
- (G) `client/src/pages/Privacy.tsx` still contains the legacy contact email. It was intentionally not edited because the governing instructions explicitly prohibit modifying `/privacy`. The privacy page and its behavior remain unchanged.

### P2 — SEO and rendering

- (V) Route metadata and canonical URLs remain client-side SPA updates; no SSR/Next.js migration was made.
- (V) The static base HTML retains its existing Bengali title and description.
- (V) The sitemap includes `/about` and `/contact`.
- (G) Route-specific raw HTML metadata and production canonical tags have not yet been verified with curl or a crawler. No claim is made that client-side metadata is equivalent to server-rendered metadata.

### P3 — navigation

- (V) Desktop primary navigation contains Home, Learn, Privacy, and Contact.
- (V) Mobile and tablet primary navigation keeps those four destinations visible; the remaining public destinations stay in the expandable menu.
- (V) The expandable menu implements Escape dismissal, focus trapping, body scroll locking, outside-pointer dismissal, and a visible close control.
- (G) Keyboard-only and touch-device walkthroughs have not yet been run against the deployed UI.

### P4 — forms and data states

- (V) No Contact form was created because no Contact backend mutation exists.
- (V) Existing homepage waitlist and other forms were not repurposed as a Contact channel.
- (G) End-to-end form tests for existing unrelated flows were not part of this change and remain outside this remediation slice.

### P5 — accessibility and performance

- (V) Added the existing static accessibility contract to the production build command: `pnpm run check:a11y`.
- (V) Mobile menu controls use a 40px minimum control box; visible focus treatment and reduced-motion rules are present in the existing stylesheet and new navigation rules.
- (G) The accessibility script has not yet reported a result for the final commit.
- (G) No Lighthouse run has been completed for the final production deployment. LCP, INP, and CLS values are therefore intentionally not reported.

## Changed files

- `client/src/App.tsx`
- `client/src/pages/About.tsx` (new)
- `client/src/pages/Contact.tsx` (new)
- `client/src/pages/Home.tsx`
- `client/src/pages/Terms.tsx`
- `client/index.html`
- `client/public/sitemap.xml`
- `client/src/index.css`
- `package.json`

Untouched by this remediation: `client/src/pages/Privacy.tsx`, `client/src/pages/Learn.tsx`, `client/public/robots.txt`, `vercel.json`, existing homepage Bengali narrative/content sections, and backend schemas.

## Verification commands

Run from the repository root:

```bash
# TypeScript + production bundle + Vercel server bundle
pnpm run build

# Static accessibility contract
pnpm run check:a11y

# Full repository verification (install, typecheck, a11y, tests, build)
pnpm run verify

# Contact backend audit — must remain empty for a public Contact mutation
grep -rnEi 'contact|sendEmail|sendMail|contactUs' server/ --include='*.ts'

# Confirm new routes and metadata
grep -nE 'About|Contact|"/about"|"/contact"' client/src/App.tsx

# Confirm sitemap URLs
grep -nE 'dsai-hub.vercel.app/(about|contact)' client/public/sitemap.xml

# Production route status and raw HTML
URL="https://dsai-hub.vercel.app"
for path in / /about /contact /privacy /learn; do
  printf '%s ' "$path"
  curl -sSL -o /dev/null -w 'HTTP %{http_code}\n' "$URL$path"
done
curl -sSL "$URL/" | grep -oE '<title>[^<]*</title>'
curl -sSL "$URL/" | grep -c 'application/ld+json'
```

## Release state

- Production commits were pushed directly to `main` with the user's explicit Production Only authorization.
- Final Vercel production build and live route verification are pending; no successful production behavior is claimed until Vercel reports READY and the live routes are checked.
- No Lighthouse metrics or manual accessibility walkthrough results are claimed without evidence.
