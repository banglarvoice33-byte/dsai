# DSAI Final Terminal Command Matrix

এই নথিটি DSAI-কে Google Cloud VPS-এ নিরাপদে deploy করার পূর্ণ command flow। এতে কোনো real secret value লেখা নেই। `GCP_PROJECT_ID`, `GCP_ZONE`, `VM_NAME`, `VM_USER` এবং database/OAuth/CAPTCHA/Forge secret VM-এ operator নিজে বসাবেন। Secret chat, shell history, Git repository, screenshot বা browser console-এ দেবেন না।

## ১. কোন তথ্য operator দেবেন এবং কোন তথ্য server নিজে তৈরি করবে

| তথ্য | উৎস | কীভাবে ব্যবহৃত হবে |
|---|---|---|
| GCP project, zone, VM name, SSH user | Operator | `gcloud compute scp` upload |
| Static external IP ও DNS access | Operator/GCP | Domain A record ও Nginx/TLS |
| `DATABASE_URL` | Operator-এর managed MySQL/TiDB | Hidden prompt; `.env.production` |
| `JWT_SECRET` | Operator-generated server secret | Hidden prompt; session signing |
| OAuth values | Operator/provider console | Hidden prompt; exact callback validation |
| CAPTCHA site key/secret/hostname | Operator/Turnstile console | Hidden/visible prompt; production login gate |
| Forge URL/key | Operator/approved provider | Hidden prompt; AI/runtime provider gate |
| Hostname, FQDN, Node path, pnpm path | VPS | `bootstrap-dsai-vm.sh` automatically detects |
| Application root, release path, log path, runtime metadata | VPS/bootstrap | Automatically created under `/home/<user>/dsai`, `/etc/dsai`, `/var/log/dsai` |
| Port | Bootstrap/deploy script | Automatically written to `.env.production` and `.dsai-runtime/port` |

## ২. Local machine বা Cloud Shell: variables সেট করুন

শুধু non-secret metadata এখানে বসবে।

```bash
set -Eeuo pipefail
export GCP_PROJECT_ID="YOUR_GCP_PROJECT_ID"
export GCP_ZONE="YOUR_VM_ZONE"
export VM_NAME="dsai"
export VM_USER="YOUR_VM_SSH_USER"
export LOCAL_ZIP="$HOME/DSAI_production_release_FINAL_2026-08-20.zip"
export LOCAL_MANIFEST="$HOME/DSAI_production_release_FINAL_2026-08-20.integrity.txt"
export EXPECTED_SHA256="PASTE_SHA256_FROM_DSAI_production_release_FINAL_2026-08-20.integrity.txt"

test -s "$LOCAL_ZIP"
test -s "$LOCAL_MANIFEST"
sha256sum "$LOCAL_ZIP"
test "$(sha256sum "$LOCAL_ZIP" | awk '{print $1}')" = "$EXPECTED_SHA256"
```

Hash mismatch হলে upload বন্ধ করুন। নতুন release তৈরি না হওয়া পর্যন্ত পুরোনো ZIP ব্যবহার করবেন না।

## ৩. VPS-এ ZIP upload

```bash
gcloud compute scp "$LOCAL_ZIP" "$LOCAL_MANIFEST" \
  "${VM_USER}@${VM_NAME}:~/" \
  --project="$GCP_PROJECT_ID" \
  --zone="$GCP_ZONE"
```

## ৪. VPS-এ checksum, ZIP integrity এবং extraction

```bash
gcloud compute ssh "${VM_USER}@${VM_NAME}" \
  --project="$GCP_PROJECT_ID" \
  --zone="$GCP_ZONE" \
  --command='bash -s' <<'REMOTE'
set -Eeuo pipefail
umask 077
ZIP="$HOME/DSAI_production_release_FINAL_2026-08-20.zip"
MANIFEST="$HOME/DSAI_production_release_FINAL_2026-08-20.integrity.txt"
EXPECTED="PASTE_SHA256_FROM_DSAI_production_release_FINAL_2026-08-20.integrity.txt"
APP_ROOT="$HOME/dsai"
RELEASE_DIR="$APP_ROOT/releases/$(date -u +%Y%m%dT%H%M%SZ)"

test -s "$ZIP"
test -s "$MANIFEST"
ACTUAL="$(sha256sum "$ZIP" | awk '{print $1}')"
printf 'SHA256=%s\n' "$ACTUAL"
test "$ACTUAL" = "$EXPECTED"
unzip -tq "$ZIP"
mkdir -p "$RELEASE_DIR"
unzip -q "$ZIP" -d "$RELEASE_DIR"

test -f "$RELEASE_DIR/package.json"
test -f "$RELEASE_DIR/pnpm-lock.yaml"
test -f "$RELEASE_DIR/deploy-genesis.sh"
test -f "$RELEASE_DIR/.env.production.example"
test -f "$RELEASE_DIR/scripts/bootstrap-dsai-vm.sh"
test -f "$RELEASE_DIR/scripts/validate-production-env.mjs"

if find "$RELEASE_DIR" -type f \( -name '.env' -o -name '.env.production' -o -iname '*.pem' -o -iname '*.key' \) -print -quit | grep -q .; then
  echo 'Forbidden secret file found; stopping.' >&2
  exit 1
fi

ln -sfn "$RELEASE_DIR" "$APP_ROOT/current"
printf 'CURRENT=%s\n' "$APP_ROOT/current"
REMOTE
```

## ৫. Server-generated metadata এবং hidden environment bootstrap

```bash
gcloud compute ssh "${VM_USER}@${VM_NAME}" \
  --project="$GCP_PROJECT_ID" \
  --zone="$GCP_ZONE" \
  --command='cd "$HOME/dsai/current" && chmod +x scripts/bootstrap-dsai-vm.sh && ./scripts/bootstrap-dsai-vm.sh'
```

Bootstrap prompt-এ নিচের নিয়ম অনুসরণ করুন। `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` এবং `CAPTCHA_SECRET_KEY`-এর value hidden prompt-এ দিন। `VITE_CAPTCHA_SITE_KEY`, `CAPTCHA_ALLOWED_HOSTNAME`, `CAPTCHA_VERIFY_URL`, `DSAI_REQUIRE_FORGE`, `DSAI_CONTACT_EMAIL`, `OWNER_OPEN_ID` এবং `OWNER_NAME` প্রয়োজন অনুযায়ী দিন। Blank রেখে production CAPTCHA বা strict Forge চালু করলে validator ইচ্ছাকৃতভাবে fail করবে।

Bootstrap নিজে hostname, FQDN, Node path, pnpm path, application root, application port, release directory এবং runtime metadata সংগ্রহ করে লিখবে:

```text
/etc/dsai/runtime.conf       # non-secret runtime metadata
/etc/dsai/dsai.env            # protected environment
/home/<user>/dsai/current/.env.production
/home/<user>/dsai/releases/*
/home/<user>/dsai/logs
/home/<user>/dsai/run
/var/log/dsai
```

## ৬. Secret না দেখিয়ে environment validate করুন

```bash
gcloud compute ssh "${VM_USER}@${VM_NAME}" \
  --project="$GCP_PROJECT_ID" \
  --zone="$GCP_ZONE" \
  --command='cd "$HOME/dsai/current" && node scripts/validate-production-env.mjs /etc/dsai/dsai.env'
```

Validator-এর `PASS` না পাওয়া পর্যন্ত application start করবেন না। এটি MySQL URL, HTTPS OAuth URL, JWT length, CAPTCHA, Forge strictness, placeholder এবং file permissions পরীক্ষা করে; কোনো secret value print করে না।

## ৭. Application build, start এবং local health checks

```bash
gcloud compute ssh "${VM_USER}@${VM_NAME}" \
  --project="$GCP_PROJECT_ID" \
  --zone="$GCP_ZONE" \
  --command='cd "$HOME/dsai/current" && chmod 600 .env.production && bash deploy-genesis.sh && PORT="$(cat .dsai-runtime/port)" && curl -fsS "http://127.0.0.1:${PORT}/healthz" && curl -fsS "http://127.0.0.1:${PORT}/readyz" && curl -fsS -o /dev/null -w "root:%{http_code}\n" "http://127.0.0.1:${PORT}/" && curl -fsS -o /dev/null -w "login:%{http_code}\n" "http://127.0.0.1:${PORT}/auth/login"'
```

Expected result হলো `healthz` success, database-ready অবস্থায় `readyz` success, এবং `root:200` ও `login:200`। `login` 200 না হলে Nginx-এ যাওয়ার আগে local production build ঠিক করুন।

## ৮. Nginx SPA routing এবং reverse proxy

Nginx configuration edit করার আগে backup নিন:

```bash
sudo cp -a /etc/nginx/sites-available/dsai /etc/nginx/sites-available/dsai.bak.$(date -u +%Y%m%dT%H%M%SZ) 2>/dev/null || true
PORT="$(cat "$HOME/dsai/current/.dsai-runtime/port")"
printf 'Detected DSAI upstream port: %s\n' "$PORT"
```

`/etc/nginx/sites-available/dsai`-এ final domain-এর server block-এ একই upstream port ব্যবহার করুন। Minimum routing contract:

```nginx
server {
    listen 80;
    server_name dsai.banglarvoice24news.com;

    location / {
        proxy_pass http://127.0.0.1:3011;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

`3011` শুধু উদাহরণ। বাস্তবে `.dsai-runtime/port`-এ যে port লেখা আছে সেটিই ব্যবহার করুন। DSAI server নিজেই SPA history fallback দেবে; Nginx-এর কাজ হলো `/`, `/auth/login`, `/try-first`, `/creative-studio`, `/scholarship`, `/api` এবং `/readyz` একই upstream-এ পাঠানো। Nginx config পরিবর্তনের পর:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## ৯. DNS এবং TLS যাচাই

```bash
DOMAIN="dsai.banglarvoice24news.com"
getent ahosts "$DOMAIN"
dig +short A "$DOMAIN"
curl -I --max-time 10 "https://$DOMAIN/"
openssl s_client -connect "${DOMAIN}:443" -servername "$DOMAIN" </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
```

A record অবশ্যই intended VM/static IP-তে যেতে হবে। Certificate-এর `subjectAltName`-এ domain থাকতে হবে এবং `notAfter` ভবিষ্যতের তারিখ হতে হবে। Certificate না থাকলে আগে certbot/managed certificate configure করুন; application debug করে TLS সমস্যা সমাধান করা যাবে না।

## ১০. Final public route checks

```bash
for path in / /auth/login /try-first /creative-studio /scholarship /privacy /governance /healthz /readyz; do
  code="$(curl -k -sS -o /tmp/dsai-route-body -w '%{http_code}' "https://dsai.banglarvoice24news.com${path}")"
  printf '%-18s %s\n' "$path" "$code"
done
```

`/`, `/auth/login`, `/try-first`, `/creative-studio`, `/scholarship`, `/privacy` এবং `/governance`-এ `200` প্রত্যাশিত। `/healthz` ও `/readyz` machine-readable success দিতে হবে। কোনো route-এ `Not Found` এলে DNS, Nginx upstream, application port এবং SPA fallback ক্রমানুসারে পরীক্ষা করুন।

## ১১. OAuth callback এবং protected-route checks

OAuth provider console-এ exact callback URL allowlist করুন:

```text
https://dsai.banglarvoice24news.com/api/oauth/callback
```

তারপর non-secret HTTP checks:

```bash
curl -sS -o /dev/null -w 'oauth-invalid-state:%{http_code}\n' \
  'https://dsai.banglarvoice24news.com/api/oauth/callback?code=test&state=invalid'

curl -sS -o /dev/null -w 'protected-api:%{http_code}\n' \
  'https://dsai.banglarvoice24news.com/api/trpc/workspace.list'
```

Invalid state-এর জন্য 403-এর মতো rejection এবং unauthenticated protected API-এর জন্য 401 প্রত্যাশিত। Actual login, returning session, logout এবং revoke test operator-এর connected browser/provider console দিয়ে করতে হবে; code বা curl দিয়ে সফল OAuth session বানানো যাবে না।

## ১২. Rollback

নতুন release fail করলে current symlink ও process state না মুছে আগের release শনাক্ত করুন:

```bash
ls -la "$HOME/dsai/releases"
readlink -f "$HOME/dsai/current"
```

তারপর আগের release symlink করে একই validation চালান:

```bash
PREVIOUS_RELEASE="/home/$USER/dsai/releases/PASTE_PREVIOUS_RELEASE_TIMESTAMP"
 test -f "$PREVIOUS_RELEASE/package.json"
ln -sfn "$PREVIOUS_RELEASE" "$HOME/dsai/current"
cd "$HOME/dsai/current"
node scripts/validate-production-env.mjs /etc/dsai/dsai.env
bash deploy-genesis.sh
```

কোনো release directory বা `/etc/dsai` environment destructiveভাবে delete করবেন না। Backup এবং restore evidence ছাড়া database drop/migration rollback চালাবেন না।

## ১৩. Secure cleanup

Integrity check এবং extraction সফল হওয়ার পর local/VPS ZIP সরানো যেতে পারে; environment file রাখা হবে:

```bash
rm -f "$HOME/DSAI_production_release_FINAL_2026-08-20.zip" \
      "$HOME/DSAI_production_release_FINAL_2026-08-20.integrity.txt"
chmod 640 /etc/dsai/dsai.env
chmod 600 "$HOME/dsai/current/.env.production"
```

শুধু wrapper ব্যবহার করলে wrapper-এর শেষ confirmation-এ `DSAI-DELETE` লিখলে wrapper নিজে মুছে যাবে। `.env.production`, `/etc/dsai/dsai.env`, database credentials, OAuth secret বা CAPTCHA secret কখনো delete করবেন না যদি service চালু রাখতে চান।

## Final status

এই command matrix application, release package, server metadata এবং environment file তৈরির জন্য প্রস্তুত। কিন্তু DNS provider, Google Cloud VM, database, OAuth console, CAPTCHA console, Nginx host এবং TLS authority-তে বাস্তব operator access ছাড়া remote deployment “সম্পন্ন” বলা যাবে না। Final release hash সবসময় আলাদা integrity manifest থেকে copy করুন; project document-এর ভিতরে hash hardcode করা হয়নি যাতে archive self-reference না তৈরি করে।

## References

[1]: ./DSAI_FINAL_GO_LIVE_READINESS_AUDIT_2026-08.md "Final DSAI go-live readiness audit"
[2]: ./DSAI_VM_UPLOAD_AND_EXTRACT_BN.md "Bengali VPS upload and extraction guide"
[3]: ./scripts/bootstrap-dsai-vm.sh "VPS bootstrap script"
[4]: ./scripts/validate-production-env.mjs "Production environment validator"
[5]: ./deploy-genesis.sh "One-command application deployment script"
