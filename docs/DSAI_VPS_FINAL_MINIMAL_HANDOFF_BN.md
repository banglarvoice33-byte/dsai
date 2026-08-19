# DSAI Final Minimal VPS Handoff

## Local upload

Local computer থেকে archive ও manifest upload করতে হবে। VPS terminal-এ `scp` চালালে কাজ নাও করবে, কারণ `scp` source file local machine-এ থাকতে হয়। VPS-এ SSH করে প্রথমে file দুটির অস্তিত্ব যাচাই করতে হবে।

## Extraction-only block

এই block application start করে না; কেবল checksum verify, ZIP test, timestamped extraction এবং `current` symlink তৈরি করে।

```bash
set -Eeuo pipefail
umask 077
cd "$HOME"
APP_ROOT="$HOME/dsai"
ZIP="$HOME/DSAI_production_release_FINAL_2026-08-20.zip"
MANIFEST="$HOME/DSAI_production_release_FINAL_2026-08-20.integrity.txt"
test -s "$ZIP" && test -s "$MANIFEST"
EXPECTED="$(awk -F= '/^SHA256=/{print $2}' "$MANIFEST")"
ACTUAL="$(sha256sum "$ZIP" | awk '{print $1}')"
printf 'EXPECTED=%s\nACTUAL=%s\n' "$EXPECTED" "$ACTUAL"
test "$EXPECTED" = "$ACTUAL"
unzip -tq "$ZIP"
mkdir -p "$APP_ROOT/releases" "$APP_ROOT/shared" "$APP_ROOT/backups" "$APP_ROOT/logs" "$APP_ROOT/run"
RELEASE_DIR="$APP_ROOT/releases/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$RELEASE_DIR"
unzip -q "$ZIP" -d "$RELEASE_DIR"
test -f "$RELEASE_DIR/package.json" -a -f "$RELEASE_DIR/deploy-genesis.sh"
ln -sfn "$RELEASE_DIR" "$APP_ROOT/current"
cd "$APP_ROOT/current"
printf 'EXTRACTED=%s\nCURRENT=%s\n' "$RELEASE_DIR" "$(pwd)"
```

## Guarded continuation

Extraction pass না করলে পরের command চালানো যাবে না। Extraction pass হলে `./scripts/bootstrap-dsai-vm.sh` অথবা legacy migration helper চালাতে হবে; তারপর `node scripts/validate-production-env.mjs /etc/dsai/dsai.env`। Validation pass না হওয়া পর্যন্ত `bash deploy-genesis.sh` চালানো যাবে না। এই ordering পুরোনো process অপ্রয়োজনীয়ভাবে বন্ধ হওয়া ঠেকায়।

## Path reconciliation

Authoritative নতুন path হলো `$HOME/dsai/current`; পুরোনো `/home/dulal_sarder90/apps/dsai-platform` থাকলে সেটি overwrite করা যাবে না। আগে `readlink -f`, `find`, `du -sh`, এবং `ps` দিয়ে diagnosis করতে হবে। নতুন `dsai` root timestamped releases ব্যবহার করে এবং rollback-এর জন্য আগের release রেখে দেয়।

## Unzip failure diagnosis

`unzip` fail হলে application start বা old process stop করা যাবে না। প্রথমে `df -h`, `df -i`, `ls -l "$ZIP"`, `unzip -tq "$ZIP"`, `unzip -Z1 "$ZIP" | head`, এবং `id` চালাতে হবে। Permission, disk, incomplete upload, অথবা checksum mismatch আলাদা করতে হবে। ZIP corrupt হলে local archive পুনরায় upload করতে হবে; remote archive edit করা যাবে না।

## Bootstrap failure recovery

`DATABASE_URL is required` মানে required environment value তৈরি হয়নি; এটি deployment success নয় এবং সাধারণত legacy process নিজে থেকে বন্ধ করে না। Hidden prompt-এর label shell command হিসেবে টাইপ করা যাবে না। `/etc/dsai/dsai.env` থাকলে `stat -c '%a %U %G'` দিয়ে mode/owner যাচাই করে `chmod 600` করতে হবে। Legacy process থেকে safe migration-এর জন্য:

```bash
cd "$HOME/dsai/current"
DSAI_ENV_FILE=/etc/dsai/dsai.env node scripts/migrate-legacy-env.mjs 30628 --private-alpha
node scripts/validate-production-env.mjs /etc/dsai/dsai.env
```

এই private-alpha command কেবল loopback-bound Controlled Alpha-এর জন্য। Public production-এর আগে live Turnstile site key, secret এবং active hostname provision করতে হবে; public mode-এ `--private-alpha` ব্যবহার করা যাবে না।

## Final go/no-go

Local extraction, environment validation, database readiness, process supervision, Nginx upstream, TLS, DNS, `/auth/login`, OAuth callback allowlist এবং rollback evidence একসঙ্গে pass না করা পর্যন্ত public launch **NO-GO**। এই document operator-ready command handoff; remote VPS execution-এর প্রমাণ নয়।
