# DSAI VPS Root-Session Execution Block

এই নথির commandগুলো আপনার VPS-এর **মূল SSH terminal session** থেকে চালানোর জন্য সাজানো। এখানে “root session” বলতে VPS-এ লগইন করার পর আপনার user-এর home directory বোঝানো হয়েছে; Linux `root` user হওয়া বাধ্যতামূলক নয়। আগের transcript অনুযায়ী user `dulal_sarder90`, host prompt `dsai`, application workspace `/home/dulal_sarder90/apps/dsai-platform`, observed IP `34.92.112.34`, domain `dsai.banglarvoice24news.com`, এবং TLS path `/etc/letsencrypt/live/dsai.banglarvoice24news.com/`।

কোনো password, private key, database password, OAuth secret, CAPTCHA secret, Forge key বা payment credential command-এ লিখবেন না। Bootstrap script এগুলো hidden prompt-এ নেবে।

## ১. Local computer থেকে release upload

এই অংশটি আপনার নিজের computer বা Cloud Shell-এ চলবে, VPS terminal-এ নয়। `dsai` SSH alias না হলে `VPS_HOST`-এ `34.92.112.34` বসান।

```bash
set -Eeuo pipefail
export VPS_HOST="dsai"
export VPS_USER="dulal_sarder90"
export LOCAL_ZIP="$HOME/DSAI_production_release_FINAL_2026-08-20.zip"
export LOCAL_MANIFEST="$HOME/DSAI_production_release_FINAL_2026-08-20.integrity.txt"

test -s "$LOCAL_ZIP"
test -s "$LOCAL_MANIFEST"
sha256sum "$LOCAL_ZIP"
scp "$LOCAL_ZIP" "$LOCAL_MANIFEST" "${VPS_USER}@${VPS_HOST}:~/"
```

## ২. VPS-এর মূল SSH terminal-এ শুরু করুন

প্রথমে VPS-এ লগইন করুন। এরপর নিচের block-টি **একবারে** চালান। এটি `$HOME` থেকে শুরু করে প্রত্যেকটি directory নিজে তৈরি করবে এবং প্রতিটি গুরুত্বপূর্ণ ধাপে `cd` করবে।

```bash
set -Eeuo pipefail
umask 077

# Confirm the actual VPS identity without printing secrets.
printf 'USER='; whoami
printf 'HOST='; hostname
printf 'HOME=%s\n' "$HOME"

# All deployment paths are explicit and user-owned.
export APP_USER="dulal_sarder90"
export APP_ROOT="/home/dulal_sarder90/dsai"
export ZIP="$HOME/DSAI_production_release_FINAL_2026-08-20.zip"
export MANIFEST="$HOME/DSAI_production_release_FINAL_2026-08-20.integrity.txt"
export EXPECTED_SHA256="$(awk -F= '/^SHA256=/{print $2}' "$MANIFEST")"

# Start in the main host directory and verify the uploaded files.
cd "$HOME"
test -s "$ZIP"
test -s "$MANIFEST"
test -n "$EXPECTED_SHA256"
ACTUAL_SHA256="$(sha256sum "$ZIP" | awk '{print $1}')"
printf 'RELEASE_SHA256=%s\n' "$ACTUAL_SHA256"
test "$ACTUAL_SHA256" = "$EXPECTED_SHA256"
unzip -tq "$ZIP"

# Create the deployment directory tree before extracting anything.
mkdir -p "$APP_ROOT/releases" "$APP_ROOT/shared" "$APP_ROOT/backups" "$APP_ROOT/logs" "$APP_ROOT/run"

# Extract into one timestamped release directory and switch current atomically.
export RELEASE_DIR="$APP_ROOT/releases/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$RELEASE_DIR"
unzip -q "$ZIP" -d "$RELEASE_DIR"
cd "$RELEASE_DIR"

test -f package.json
test -f pnpm-lock.yaml
test -f deploy-genesis.sh
test -f .env.production.example
test -f scripts/bootstrap-dsai-vm.sh
test -f scripts/validate-production-env.mjs

if find . -type f \( -name '.env' -o -name '.env.production' -o -iname '*.pem' -o -iname '*.key' \) -print -quit | grep -q .; then
  echo 'Forbidden populated secret file found; stopping.' >&2
  exit 1
fi

ln -sfn "$RELEASE_DIR" "$APP_ROOT/current"
cd "$APP_ROOT/current"
printf 'CURRENT=%s\n' "$APP_ROOT/current"
```

## ৩. Hidden environment bootstrap

এখনও `$APP_ROOT/current` directory-তেই থাকুন এবং এই command চালান। Prompt এলে secret value screen বা shell history-তে লিখবেন না; prompt-এর hidden input ব্যবহার করুন।

```bash
cd /home/dulal_sarder90/dsai/current
chmod 700 scripts/bootstrap-dsai-vm.sh
./scripts/bootstrap-dsai-vm.sh
```

Bootstrap-এর পরে protected files তৈরি হয়েছে কিনা দেখুন, কিন্তু value দেখবেন না:

```bash
cd /home/dulal_sarder90/dsai/current
printf 'ENV_MODE='; stat -c '%a' .env.production
printf 'DSAI_ENV_MODE='; sudo stat -c '%a' /etc/dsai/dsai.env 2>/dev/null || true
printf 'RUNTIME_FILES=\n'; find /etc/dsai "$HOME/dsai/.dsai-runtime" -maxdepth 1 -type f -printf '%p\n' 2>/dev/null | sort
```

## ৪. Environment validation এবং application deployment

Validator `PASS` না দিলে build বা start করবেন না।

```bash
cd /home/dulal_sarder90/dsai/current
node scripts/validate-production-env.mjs /etc/dsai/dsai.env
chmod 600 .env.production
bash deploy-genesis.sh
```

Deploy script শেষ হলে local application port নিজে পড়ুন এবং health/route পরীক্ষা করুন:

```bash
cd /home/dulal_sarder90/dsai/current
PORT="$(cat .dsai-runtime/port)"
printf 'APP_PORT=%s\n' "$PORT"
curl -fsS "http://127.0.0.1:${PORT}/healthz"
curl -fsS "http://127.0.0.1:${PORT}/readyz"
curl -fsS -o /dev/null -w 'LOCAL_ROOT=%{http_code}\n' "http://127.0.0.1:${PORT}/"
curl -fsS -o /dev/null -w 'LOCAL_LOGIN=%{http_code}\n' "http://127.0.0.1:${PORT}/auth/login"
```

Expected local result হলো `healthz` success, database-ready অবস্থায় `readyz` success, `LOCAL_ROOT=200`, এবং `LOCAL_LOGIN=200`। Local login 200 না হলে Nginx পরিবর্তন করবেন না; আগে application environment/build ঠিক করুন।

## ৫. Nginx SPA/reverse-proxy correction

প্রথমে current configuration backup ও diagnosis করুন। এই অংশে `sudo` দরকার হবে।

```bash
cd /home/dulal_sarder90/dsai/current
PORT="$(cat .dsai-runtime/port)"
sudo mkdir -p /var/backups/dsai-nginx
sudo nginx -T > "/var/backups/dsai-nginx/nginx-before-$(date -u +%Y%m%dT%H%M%SZ).conf"
sudo grep -RInE 'server_name dsai\.banglarvoice24news\.com|proxy_pass|listen 80|listen 443|ssl_certificate|location /' /etc/nginx 2>/dev/null || true
```

যদি পুরোনো server block একই `server_name`-এর জন্য অন্য port, যেমন `3010` বা `3011`, ব্যবহার করে থাকে, আগে backup রেখে তার enabled symlink/operator configuration disable করুন। Blind delete করবেন না। এরপর dedicated config লিখুন:

```bash
cd /home/dulal_sarder90/dsai/current
PORT="$(cat .dsai-runtime/port)"
sudo tee /etc/nginx/sites-available/dsai.banglarvoice24news.com.conf >/dev/null <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name dsai.banglarvoice24news.com;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dsai.banglarvoice24news.com;

    ssl_certificate /etc/letsencrypt/live/dsai.banglarvoice24news.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dsai.banglarvoice24news.com/privkey.pem;

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:PORT_PLACEHOLDER;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINX
sudo sed -i "s/PORT_PLACEHOLDER/${PORT}/" /etc/nginx/sites-available/dsai.banglarvoice24news.com.conf
sudo ln -sfn /etc/nginx/sites-available/dsai.banglarvoice24news.com.conf /etc/nginx/sites-enabled/dsai.banglarvoice24news.com.conf
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

`nginx -t` fail করলে restart করবেন না। Error output সংরক্ষণ করে configuration সংশোধন করুন। একই hostname-এর পুরোনো enabled block থাকলে `nginx -T` দেখে authorized operator backup রেখে disable করবেন; অন্য site-এর config মুছবেন না।

## ৬. Public DNS, TLS, SPA route এবং OAuth checks

```bash
cd /home/dulal_sarder90/dsai/current
getent ahostsv4 dsai.banglarvoice24news.com | awk 'NR==1{print "DNS=" $1}'
openssl s_client -connect dsai.banglarvoice24news.com:443 -servername dsai.banglarvoice24news.com </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
curl -fsS -o /dev/null -w 'PUBLIC_ROOT=%{http_code}\n' https://dsai.banglarvoice24news.com/
curl -fsS -o /dev/null -w 'PUBLIC_LOGIN=%{http_code}\n' https://dsai.banglarvoice24news.com/auth/login
curl -fsS -o /dev/null -w 'PUBLIC_PRIVACY=%{http_code}\n' https://dsai.banglarvoice24news.com/privacy
curl -fsS -o /dev/null -w 'PUBLIC_READY=%{http_code}\n' https://dsai.banglarvoice24news.com/readyz
```

OAuth callback allowlist-এ exact URL রাখতে হবে:

```text
https://dsai.banglarvoice24news.com/api/oauth/callback
```

OAuth first login, returning session, logout/re-login, protected API `401`, এবং admin authorization বাস্তব browser-এ পরীক্ষা না করা পর্যন্ত live OAuth verified বলা যাবে না। কোনো access token বা secret output পাঠাবেন না।

## ৭. Rollback

নতুন release খারাপ হলে previous release directory-তে `current` symlink ফেরত দিয়ে deploy script চালান:

```bash
set -Eeuo pipefail
cd /home/dulal_sarder90/dsai
ls -1dt releases/*
export PREVIOUS_RELEASE="$(ls -1dt releases/* | sed -n '2p')"
test -n "$PREVIOUS_RELEASE"
ln -sfn "$PREVIOUS_RELEASE" current
cd /home/dulal_sarder90/dsai/current
bash deploy-genesis.sh
```

Rollback-এর আগে `PREVIOUS_RELEASE` output দেখে authorized operator নিশ্চিত করবেন যে এটি সত্যিই আগের healthy release।

## শেষ সীমা

এই block-এ folder, `cd`, checksum, extraction, bootstrap, validation, deploy, health, Nginx, TLS, public route এবং OAuth checks-এর কোনো ধাপ বাদ নেই। এটি VPS-এ চালানোর জন্য প্রস্তুত, কিন্তু এই sandbox থেকে আপনার VPS-এ SSH command নিজে চালানো হয়নি। তাই command output না পাওয়া পর্যন্ত deployment বা `Not Found` correction সম্পন্ন হয়েছে বলে ঘোষণা করা যাবে না।
