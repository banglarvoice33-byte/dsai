# DSAI Baseline — 2026-11-21

## Execution environment

Timestamp: 2026-11-21T07:41:30Z (UTC)

The current command shell starts at `/`, not inside a repository checkout. GitHub repository content and PR state were inspected through the connected GitHub integration. A local checkout could not be created because DNS resolution for `github.com` fails in this execution environment.

| Command | Exit code | Observed result |
|---|---:|---|
| `pwd` | 0 | `/` |
| `git status --short --branch` | 128 | `fatal: not a git repository` |
| `git branch -a` | 128 | `fatal: not a git repository` |
| `git remote -v` | 128 | `fatal: not a git repository` |
| `node -v` | 0 | `v22.16.0` |
| `pnpm -v` | 127 | `pnpm: command not found` |
| `git clone --depth 1 --branch feat/lead-workdesk-acknowledgment https://github.com/banglarvoice33-byte/dsai.git /tmp/dsai` | 128 | `Could not resolve host: github.com` |

## Checks not run locally

The following commands were not run because there is no checkout and pnpm is unavailable:

- `pnpm install`
- `pnpm typecheck` / repository equivalent `pnpm run check`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm secret:scan`
- dependency audit and license check

Do not infer success from their absence. CI results must be tied to the exact branch head SHA and reported separately. The connected GitHub integration has been used to inspect source files, commit the implementation and open PR #106, but it does not provide a local shell checkout.

## CI baseline history

- CI run #897, SHA `582baee974e1d26e9b87cd76a519d2393fa6c455`: typecheck, Edge Function checks, static accessibility contract, stub audit and scanner/ClamAV tests passed; Vitest reported 1 fixture spelling mismatch among 291 tests.
- CI run #900, SHA `9d797faa9ed7a2ca9efce29ef65a7e4a1b3a15d7`: TypeScript, Edge Function checks, accessibility contract, stub audit, 291/291 Vitest tests and production build passed; browser acceptance was cancelled after a newer commit superseded that SHA.
- Subsequent changes added axe WCAG browser checks, isolated PostgreSQL migration/RLS integration and post-render server-side acknowledgment timing. Earlier CI results do not validate these later changes.
- Current branch head at the time of this baseline record predates the latest post-render timer refinements. See PR #106 and the current GitHub Actions run for exact-head status.
