# DSAI Three-Release Comparative Audit — 2026-08

## Compared archives

| Release | SHA-256 | ZIP integrity | Approximate file count | Key result |
|---|---|---:|---:|---|
| `DSAI_FINAL_A_TO_Z_RELEASE_2026-08-16.zip` | `579dd546e4954ca0d6f1e9e4c56282fa37aceb6cf380232d0ee78af2439d06f2` | Pass | 248 | Earlier release; did not yet contain the later validator/setup/migration layers |
| `DSAI_production_release_2026-08-19.zip` | `aae55f5d06fb000905ae42f874acacbfda01e8f0c36b673a797e80e006f8812d` | Pass | 340 | Added production validator, setup helper, and final handoff sequence |
| `DSAI_production_release_FINAL_2026-08-20.zip` | `5e129cc1fdd519e721ca97d370722d3f906c18f0e9c6ae5103755016e79e14ef` | Pass | 356 | Recommended release; adds environment-contract corrections, private-alpha runbook, migration helper, and regression coverage |

The archive entry check was performed with a pipefail-safe method because `grep` may close a ZIP listing pipe early and cause a false negative under `set -o pipefail`. The current release contains `deploy-genesis.sh`, `.env.production.example`, `scripts/setup-vps-env.mjs`, `scripts/validate-production-env.mjs`, and `scripts/migrate-legacy-env.mjs`.

## Improvements and regressions

The 16 August archive predates the authoritative production environment validator and therefore should not be used for the current VPS deployment. The 19 August archive introduced the primary production handoff and validation layers, but its contract still required correction around Forge defaults, file-based strictness, public CAPTCHA key classification, and validation-before-stop ordering.

The 20 August release is the recommended archive. It keeps credentials outside the ZIP, retains the provider-gated and public-production CAPTCHA boundary, adds the secret-safe legacy-process migration helper, and includes the Bengali recovery/runbook documents. No regression was found in the core build, test, accessibility, or archive-integrity checks. The remaining differences are intentional safeguards and documentation.

## Deployment-contract result

The archive is credential-free by design. A successful ZIP checksum proves only that the release was transferred without corruption; it does not prove database access, OAuth consent, Nginx/TLS, DNS, process supervision, or public route availability. The operator must populate `/etc/dsai/dsai.env` on the VPS and run the ordered bootstrap/validation sequence.

## Recommendation

Use only `DSAI_production_release_FINAL_2026-08-20.zip` with SHA-256 `5e129cc1fdd519e721ca97d370722d3f906c18f0e9c6ae5103755016e79e14ef`. Do not reuse the 16 August archive. The public launch remains **NO-GO** until the remote database, public CAPTCHA, Nginx/TLS, DNS, OAuth callback, and health-route evidence are collected. Private Controlled Alpha is acceptable only when loopback-bound as documented.
