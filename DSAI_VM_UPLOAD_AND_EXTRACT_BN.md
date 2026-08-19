# DSAI production release: VPS handoff

এই archive-টি credential-free। এতে populated `.env.production`, private key, runtime state, `node_modules`, `dist`, বা platform-managed metadata নেই। আসল secret কেবল VM-এর secure environment file বা Secret Manager-এ operator inject করবেন।

## ১. Local machine থেকে VPS-এ upload

এই handoff-এ GCP-specific command ব্যবহার করা হবে না। আগের VPS session evidence অনুযায়ী পরিচিত তথ্য হলো: SSH user `dulal_sarder90`, VPS hostname/prompt `dsai`, application path `/home/dulal_sarder90/apps/dsai-platform`, web domain `dsai.banglarvoice24news.com`, Node `v20.20.2`, pnpm `10.34.5`, Nginx `1.18.0`, এবং observed public IPv4 `34.92.112.34`। Hostname `dsai` local SSH alias হিসেবে কাজ না করলে operator নিজের VPS-এর reachable IP বা DNS hostname-টি শুধু `VPS_HOST`-এ বসাবেন। Password বা private key command-এ লিখবেন না।

```bash
set -Eeuo pipefail
export VPS_HOST="dsai"
export VPS_USER="dulal_sarder90"
export VPS_APP_DIR="/home/dulal_sarder90/apps/dsai-platform"
export LOCAL_ZIP="$HOME/DSAI_production_release_FINAL_2026-08-20.zip"
export LOCAL_MANIFEST="$HOME/DSAI_production_release_FINAL_2026-08-20.integrity.txt"

test -s "$LOCAL_ZIP"
test -s "$LOCAL_MANIFEST"
scp "$LOCAL_ZIP" "$LOCAL_MANIFEST" "${VPS_USER}@${VPS_HOST}:~/"
```

## ২. VPS-এ archive integrity ও extraction

```bash
set -Eeuo pipefail
umask 077
APP_USER="$(whoami)"
APP_ROOT="/home/dulal_sarder90/dsai"
RELEASE_DIR="${APP_ROOT}/releases/$(date -u +%Y%m%dT%H%M%SZ)"
ZIP="$HOME/DSAI_production_release_FINAL_2026-08-20.zip"
EXPECTED_SHA256="$(awk -F= '/^SHA256=/{print $2}' "$HOME/DSAI_production_release_FINAL_2026-08-20.integrity.txt")"

command -v unzip >/dev/null || { echo "unzip required" >&2; exit 1; }
command -v sha256sum >/dev/null || { echo "sha256sum required" >&2; exit 1; }
test -s "$ZIP" || { echo "release ZIP missing: $ZIP" >&2; exit 1; }
ACTUAL_SHA256="$(sha256sum "$ZIP" | awk '{print $1}')"
test -n "$EXPECTED_SHA256" && test "$ACTUAL_SHA256" = "$EXPECTED_SHA256"
unzip -tq "$ZIP"
mkdir -p "$RELEASE_DIR"
unzip -q "$ZIP" -d "$RELEASE_DIR"

test -f "$RELEASE_DIR/package.json"
test -f "$RELEASE_DIR/pnpm-lock.yaml"
test -f "$RELEASE_DIR/deploy-genesis.sh"
test -f "$RELEASE_DIR/.env.production.example"

if find "$RELEASE_DIR" -type f \( -name '.env' -o -name '.env.production' -o -iname '*.pem' -o -iname '*.key' \) | grep -q .; then
  echo "forbidden secret file found" >&2
  exit 1
fi

ln -sfn "$RELEASE_DIR" "$APP_ROOT/current"
printf 'Release extracted: %s\nCurrent symlink: %s\n' "$RELEASE_DIR" "$APP_ROOT/current"
```

## ৩. VM metadata ও environment bootstrap

Archive extract করার পরে project root থেকে এই script চালাবেন। এটি `/home/<user>/dsai`, `/etc/dsai`, logs, backups, releases এবং runtime directories তৈরি করে; hostname, Node path, pnpm path, domain এবং port নিজে শনাক্ত করে; secret prompt-এ input নেয় এবং `/etc/dsai/dsai.env` ও `.env.production`-এ mode `0640` সহ লেখে। Secret value chat বা shell history-তে দেবেন না।

```bash
cd /home/dulal_sarder90/dsai/current
chmod +x scripts/bootstrap-dsai-vm.sh
./scripts/bootstrap-dsai-vm.sh
```

## ৪. One-time wrapper (optional)

যদি আপনি একবারে ZIP verify, extract, bootstrap এবং পরে wrapper delete করতে চান, ZIP ও `scripts/one-time-vm-bootstrap.sh` একই VPS directory-তে রেখে চালাবেন। Wrapper local ZIP-এর SHA-256 যাচাই করে; কোনো external URL বা secret বহন করে না। Archive hash wrapper-এর মধ্যে hardcode করা নেই, তাই চালানোর আগে integrity manifest-এর 64-character SHA-256 `DSAI_EXPECTED_SHA256` হিসেবে দিতে হবে।

```bash
cd /home/dulal_sarder90/dsai/current
chmod +x scripts/one-time-vm-bootstrap.sh
export DSAI_RELEASE_ZIP="$HOME/DSAI_production_release_FINAL_2026-08-20.zip"
export DSAI_EXPECTED_SHA256="PASTE_SHA256_FROM_INTEGRITY_MANIFEST"
./scripts/one-time-vm-bootstrap.sh
```

Prompt-এ প্রথমে `DSAI-START`, environment values hidden prompt-এ এবং শেষে wrapper মুছতে `DSAI-DELETE` লিখবেন। Wrapper মুছে গেলেও release, `/etc/dsai/dsai.env` এবং runtime metadata থাকবে।

## ৫. Application environment

Bootstrap-এর পরে `node scripts/validate-production-env.mjs /etc/dsai/dsai.env` দিয়ে secret values না দেখিয়ে configuration validate করবেন। OAuth callback হবে `https://dsai.banglarvoice24news.com/api/oauth/callback` এবং provider console-এ একই URL exact match হিসেবে allowlist করতে হবে। File mode `0640` অথবা `0600` হতে হবে।

## ৬. Important gate

Archive integrity pass করলেই deployment live হয়েছে বলা যাবে না। Database connectivity, migration, process service, Nginx upstream, TLS renewal, `/healthz`, `/readyz`, `/auth/login`, protected tRPC `401`, OAuth consent/revoke এবং backup evidence আলাদাভাবে যাচাই করতে হবে।

## ৭. সম্পূর্ণ root-session command block

Folder creation, explicit `cd`, archive extraction, checksum, current symlink, hidden bootstrap, environment validation, deployment, health, Nginx, TLS, public route এবং OAuth checks একসঙ্গে দেখতে [`DSAI_VPS_ROOT_EXECUTION_BLOCK_BN.md`](./DSAI_VPS_ROOT_EXECUTION_BLOCK_BN.md) অনুসরণ করুন। এই block-টি VPS-এর মূল SSH terminal থেকে চালানোর জন্য তৈরি; এতে কোনো secret value নেই।
