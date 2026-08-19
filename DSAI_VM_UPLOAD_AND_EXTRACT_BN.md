# DSAI production release: Google Cloud VM handoff

এই archive-টি credential-free। এতে populated `.env.production`, private key, runtime state, `node_modules`, `dist`, বা platform-managed metadata নেই। আসল secret কেবল VM-এর secure environment file বা Secret Manager-এ operator inject করবেন।

## ১. Local machine বা Cloud Shell থেকে upload

আপনার Google Cloud project, VM zone এবং local ZIP path অনুযায়ী শুধু placeholder তিনটি বদলাবেন। Password বা private key command-এ লিখবেন না।

```bash
export GCP_PROJECT_ID="YOUR_GCP_PROJECT_ID"
export GCP_ZONE="YOUR_VM_ZONE"
export VM_NAME="dsai"
export VM_USER="dulal_sarder90"
export LOCAL_ZIP="$HOME/DSAI_production_release_2026-08-19.zip"

gcloud compute scp "$LOCAL_ZIP" \
  "${VM_USER}@${VM_NAME}:~/" \
  --project="$GCP_PROJECT_ID" \
  --zone="$GCP_ZONE"
```

## ২. VM-এ archive integrity ও extraction

```bash
set -Eeuo pipefail
umask 077
APP_USER="$(whoami)"
APP_ROOT="/home/${APP_USER}/dsai"
RELEASE_DIR="${APP_ROOT}/releases/$(date -u +%Y%m%dT%H%M%SZ)"
ZIP="$HOME/DSAI_production_release_2026-08-19.zip"

command -v unzip >/dev/null || { echo "unzip required" >&2; exit 1; }
test -s "$ZIP" || { echo "release ZIP missing: $ZIP" >&2; exit 1; }
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

যদি আপনি একবারে ZIP verify, extract, bootstrap এবং পরে wrapper delete করতে চান, ZIP ও `scripts/one-time-vm-bootstrap.sh` একই VPS directory-তে রেখে চালাবেন। Wrapper local ZIP-এর SHA-256 যাচাই করে; কোনো external URL বা secret বহন করে না।

```bash
cd /home/dulal_sarder90/dsai/current
chmod +x scripts/one-time-vm-bootstrap.sh
DSAI_RELEASE_ZIP="$HOME/DSAI_production_release_2026-08-19.zip" ./scripts/one-time-vm-bootstrap.sh
```

Prompt-এ প্রথমে `DSAI-START`, environment values hidden prompt-এ এবং শেষে wrapper মুছতে `DSAI-DELETE` লিখবেন। Wrapper মুছে গেলেও release, `/etc/dsai/dsai.env` এবং runtime metadata থাকবে।

## ৫. Application environment

Bootstrap-এর পরে `node scripts/validate-production-env.mjs /etc/dsai/dsai.env` দিয়ে secret values না দেখিয়ে configuration validate করবেন। OAuth callback হবে `https://dsai.banglarvoice24news.com/api/oauth/callback` এবং provider console-এ একই URL exact match হিসেবে allowlist করতে হবে। File mode `0640` অথবা `0600` হতে হবে।

## ৬. Important gate

Archive integrity pass করলেই deployment live হয়েছে বলা যাবে না। Database connectivity, migration, process service, Nginx upstream, TLS renewal, `/healthz`, `/readyz`, `/auth/login`, protected tRPC `401`, OAuth consent/revoke এবং backup evidence আলাদাভাবে যাচাই করতে হবে।
