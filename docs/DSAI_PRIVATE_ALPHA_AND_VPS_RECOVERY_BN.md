# DSAI Controlled Alpha ও VPS Recovery Runbook

## ১. Controlled Alpha-এর সীমা

No-CAPTCHA কেবল private loopback staging-এর জন্য অনুমোদিত। Environment-এ `DSAI_RUNTIME_MODE=controlled-alpha`, `DSAI_PRIVATE_ALPHA=true`, এবং `DSAI_PRIVATE_ALPHA_BIND=127.0.0.1` থাকতে হবে। এই process-কে public Nginx, public IP, অথবা internet-facing reverse proxy-তে expose করা যাবে না। Public production-এ CAPTCHA fail-closed থাকবে।

## ২. Artifact-first VPS sequence

রিলিজ না থাকলে preflight বা service command চালানো যাবে না। প্রথমে ZIP এবং manifest home directory-তে upload করতে হবে; এরপর checksum যাচাই, `unzip -tq`, timestamped release extraction, `current` symlink, bootstrap, environment validation, build/start এবং local health check চলবে। এই ক্রমের বাইরে কোনো preflight বা `deploy-genesis.sh` command চালানো উচিত নয়।

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
test "$EXPECTED" = "$ACTUAL"
unzip -tq "$ZIP"
mkdir -p "$APP_ROOT/releases" "$APP_ROOT/shared" "$APP_ROOT/backups" "$APP_ROOT/logs" "$APP_ROOT/run"
RELEASE_DIR="$APP_ROOT/releases/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$RELEASE_DIR"
unzip -q "$ZIP" -d "$RELEASE_DIR"
test -f "$RELEASE_DIR/package.json" -a -f "$RELEASE_DIR/deploy-genesis.sh"
ln -sfn "$RELEASE_DIR" "$APP_ROOT/current"
cd "$APP_ROOT/current"
./scripts/bootstrap-dsai-vm.sh
node scripts/validate-production-env.mjs /etc/dsai/dsai.env
bash deploy-genesis.sh
PORT="$(cat .dsai-runtime/port)"
curl -fsS "http://127.0.0.1:${PORT}/healthz"
curl -fsS -o /dev/null -w 'LOGIN=%{http_code}\n' "http://127.0.0.1:${PORT}/auth/login"
```

## ৩. Bootstrap failure recovery

`DATABASE_URL is required` মানে bootstrap সফলভাবে environment file লিখতে পারেনি বা required value পাওয়া যায়নি; এটি নিজে থেকে পুরোনো process বন্ধ করে না। Prompt label-কে shell command হিসেবে টাইপ করা যাবে না। Bootstrap আবার চালিয়ে secret prompt-এ value দিতে হবে, অথবা আগে থেকে provisioned `/etc/dsai/dsai.env` থাকলে তার permission `600` এবং ownership যাচাই করতে হবে। Secret chat-এ বা shell history-তে লেখা যাবে না।

## ৪. Legacy process safeguard

নতুন environment validation সফল না হওয়া পর্যন্ত `deploy-genesis.sh` পুরোনো process stop করবে না। Failed extraction, checksum mismatch, missing database URL, invalid public CAPTCHA, বা wrong bind policy হলে command থেমে যাবে এবং legacy service অক্ষত থাকবে। Rollback-এর জন্য `current` symlink আগের verified release-এ ফেরাতে হবে; destructive delete করা যাবে না।

## ৫. Go/no-go

Private Alpha go হলো কেবল loopback health এবং local SPA route pass করলে। Public production go-এর জন্য database, process supervision, Nginx upstream, DNS, TLS, public `/auth/login`, OAuth callback allowlist, CAPTCHA provider verification, backup/rollback এবং field-performance evidence আলাদাভাবে pass করতে হবে। এই runbook remote execution-এর প্রমাণ নয়; এটি operator-এর copy-paste handoff।
