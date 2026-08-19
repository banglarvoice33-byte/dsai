# DSAI deployment command matrix

**উদ্দেশ্য:** clean-room VPS deployment-এ কোন command কোন কাজ করে, কী পরিবর্তন করে, কীভাবে যাচাই করা হয়, এবং কোন ধাপ operator gate—তা এক জায়গায় রাখা। এই document-এ কোনো secret value নেই।

## Recommended order

| ক্রম | Command বা operation | কাজ | পরিবর্তনের ধরন | যাচাই |
|---:|---|---|---|---|
| 1 | `ssh dulal_sarder90@<server-ip>` | VPS-এ নিরাপদ shell session | none | `whoami`, `hostname` |
| 2 | ZIP upload/download | verified release archive VPS-এ আনা | file write | SHA-256 match |
| 3 | `unzip -tq <archive>` | archive integrity পরীক্ষা | none | non-zero হলে stop |
| 4 | `sha256sum <archive>` | release identity যাচাই | none | expected hash match |
| 5 | `./scripts/bootstrap-dsai-vm.sh` | `/etc/dsai`, app, log, release ও runtime directories এবং protected env structure তৈরি | filesystem write | permissions, variable names only |
| 6 | hidden prompt / Secret Manager injection | `DATABASE_URL`, `JWT_SECRET`, OAuth ও provider values local secure store-এ রাখা | secret write | validator without printing values |
| 7 | `node scripts/validate-production-env.mjs /etc/dsai/dsai.env` | env names, strength, file permissions ও provider contract যাচাই | none | pass/fail |
| 8 | `bash deploy-genesis.sh` | locked install, build, dynamic port, graceful previous stop, launch এবং local API/SPA health | package/process write | `/healthz` এবং `/auth/login` |
| 9 | database migration | schema migration apply | database write | migration output ও read-only health |
| 10 | systemd service | process restart-on-failure ও boot persistence | privileged service write | `systemctl status dsai` |
| 11 | Nginx reverse proxy | 80/443 থেকে internal app port-এ proxy, `/api/*` ও SPA history fallback | privileged proxy write | `nginx -t`, curl |
| 12 | TLS/renewal | HTTPS certificate ও renewal | certificate/service write | `openssl`/curl expiry check |
| 13 | route smoke | public, protected, admin ও callback validation | none | expected HTTP status table |
| 14 | OAuth consent/revoke | real provider login, callback, session, revoke | external side effect | user/operator evidence |
| 15 | rollback | previous release/service restore | filesystem/service write | previous health pass |

## One-command installer contract

`bash deploy-genesis.sh` Linux server-এ missing Node/curl prerequisite থাকলে apt দিয়ে install করার চেষ্টা করতে পারে, pnpm ব্যবহার বা pinned fallback প্রস্তুত করে, `.dsai-runtime`-এ PID/port/log রাখে, `DSAI_START_PORT` থেকে `DSAI_END_PORT` পর্যন্ত free port খোঁজে, `.env.production`-এ selected `PORT` লেখে, frozen dependency install ও production build চালায়, এবং local `/healthz` ও `/auth/login` দুটোই 200 না হলে fail করে। এটি নিজে DNS, OAuth allowlist, database service, mailbox, Nginx, TLS, provider account বা legal entity তৈরি করে না।

Default port range হলো `3010–3099`; project-specific bootstrap workflow-এর internal port হিসেবে `3011` রাখা যায়। Nginx বাইরে 80/443 রাখবে। একই server-এ অন্য service থাকলে `DSAI_START_PORT` ও `DSAI_END_PORT` explicit করে দেওয়া উচিত।

## Safe environment contract

Production env file protected permission-এ থাকবে। Required names হলো `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL` এবং `VITE_OAUTH_PORTAL_URL`। Optional Forge, owner, CAPTCHA, analytics, provider এবং notification values কেবল প্রয়োজন হলে যোগ হবে। Secret কখনো ZIP, Git, browser, public form, screenshot, chat বা shell history-তে রাখা যাবে না।

Environment validation configuration shape ও permission পরীক্ষা করে; এটি provider credential সত্যিই কার্যকর, OAuth callback allowlisted, database reachable বা billing active—এসব প্রমাণ করে না। সেই evidence আলাদা staging/live test-এ লাগবে।

## Manual VPS command sequence

```bash
ssh <user>@<server-ip>
mkdir -p "$HOME/dsai/releases" "$HOME/dsai/shared" "$HOME/dsai/backups" "$HOME/dsai/logs" "$HOME/dsai/run"
sha256sum "$HOME/DSAI_production_release_2026-08-19.zip"
unzip -tq "$HOME/DSAI_production_release_2026-08-19.zip"
mkdir -p "$HOME/dsai/releases/$(date -u +%Y%m%dT%H%M%SZ)"
unzip -q "$HOME/DSAI_production_release_2026-08-19.zip" -d "$HOME/dsai/releases/$(date -u +%Y%m%dT%H%M%SZ)"
```

Release directory timestamp একবারই calculate করে variable-এ রাখা উত্তম; guide-এর one-time wrapper এই race/duplication এড়ায়।

```bash
chmod 700 "$HOME/DSAI_one_time_vps_bootstrap.sh"
DSAI_RELEASE_ZIP="$HOME/DSAI_production_release_2026-08-19.zip" "$HOME/DSAI_one_time_vps_bootstrap.sh"
```

## Validation status

| Gate | Current status |
|---|---|
| Source/tests/typecheck/build/accessibility | Verified in sandbox |
| Credential-free ZIP and secret scan | Verified |
| Bootstrap shell syntax and local wrapper checksum | Verified |
| VPS archive upload | Operator action pending |
| Real database connection/migration | Pending |
| Application process and systemd | Pending |
| Custom-domain Nginx upstream and SPA fallback | Previously observed external 404; pending VPS correction |
| TLS renewal | Certificate existed in previous preflight; live renewal evidence pending |
| `/healthz`, `/readyz`, `/auth/login` on VPS | Pending |
| Real OAuth consent/callback/revoke | Provider allowlist and user consent pending |
| Backup/restore drill | Contract documented; live drill pending |

## Operational safety

Commands that install packages, write `/etc`, apply database migrations, restart services, modify Nginx/TLS or invoke provider actions are not read-only. They must be run by the authorized VPS operator after confirming the target host and a backup/rollback point. No command in this matrix proves legal ownership, corporate incorporation, source authorship, valuation or third-party rights; those require records, agreements and professional review.
