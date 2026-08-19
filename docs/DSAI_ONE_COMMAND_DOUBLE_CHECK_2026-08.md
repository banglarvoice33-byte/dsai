# DSAI One-Command Deployment Double-Check — 2026-08

## Critical finding

The first generated self-extracting bundle passed syntax, executable-mode, checksum-header, and secret-pattern checks, but its payload extraction path had not been executed. Static inspection found that the generator emitted the shell variable text `${MARKER}` as the payload delimiter instead of the literal line `__DSAI_ARCHIVE_BELOW__`. The wrapper therefore could decode an empty payload and fail before deployment. This was a real packaging defect, not a documentation issue.

The generator was corrected to emit the literal marker, and regression coverage now executes the extraction pipeline with `awk` and `base64`, then runs `unzip -tq` against the extracted payload. The focused regression suite passes after the correction.

## Double-check matrix

| Area | Result | Evidence |
|---|---|---|
| Embedded release checksum | Pass after regeneration | Header checksum is compared with extracted payload and release manifest |
| Marker extraction | Corrected and test-covered | Literal `__DSAI_ARCHIVE_BELOW__` is required and extracted payload passes ZIP test |
| Secret exclusion | Pass | No real `.env`, private key, credential artifact, or secret assignment in bundle/archive |
| File mode | Pass | Bundle is generated with mode `700`; environment migration writes mode `600` atomically |
| Existing environment path | Pass by code review | Bundle uses `DSAI_ENV_FILE` and validator reads file values |
| Legacy PID migration | Pass by code review/tests | Allowlisted process environment only; values are never printed |
| Public CAPTCHA | Fail-closed | Public mode requires live Turnstile values and hostname |
| Private Alpha | Restricted | No-CAPTCHA requires Controlled Alpha and loopback bind `127.0.0.1` |
| Previous process safety | Pass by code review/tests | Deployment validates environment before `stop_previous` |
| Rollback | Documented, not automatic | Timestamped releases and `current` symlink permit operator rollback; remote process supervision remains external |
| Full VPS runtime | Not verified here | This sandbox cannot provide the user’s VPS database, process, Nginx/TLS, DNS, or OAuth evidence |

## What was missed previously

The main omission was **not executing the self-extraction path itself**. A valid header checksum and a syntactically valid shell script are insufficient evidence for a self-extracting artifact. The corrected test now exercises the delimiter, base64 decode, and ZIP integrity path. A second limitation remains: a full bundle launch requires a real or disposable runtime environment and process lifecycle; public VPS evidence still requires operator execution.

## Revised release decision

The previous `.run` file must not be used. A new bundle must be generated from the corrected generator after the credential-free release ZIP is rebuilt. The revised bundle is acceptable for operator testing only after its embedded payload hash matches the final ZIP and the extraction regression passes. Public production remains gated on database, process supervision, Nginx/TLS, DNS, OAuth, CAPTCHA, and public-route evidence.
