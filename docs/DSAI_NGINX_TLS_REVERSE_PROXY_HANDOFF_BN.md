# DSAI Nginx Reverse Proxy ও HTTPS Handoff

এই নির্দেশনা VPS SSH terminal-এর জন্য। DSAI application আগে থেকেই `127.0.0.1:3011`-এ চলতে হবে। ফোনে `127.0.0.1:3011` খোলা যাবে না; ফোনের `127.0.0.1` ফোনকেই বোঝায়। Public browser-এর জন্য domain ব্যবহার করতে হবে।

## ১. DNS ও local upstream আগে যাচাই

```bash
set -Eeuo pipefail
DOMAIN='dsai.banglarvoice24news.com'
APP_PORT='3011'

printf 'DNS:\n'
getent hosts "$DOMAIN" || true
printf '\nLOCAL_HEALTH:\n'
curl -fsS "http://127.0.0.1:${APP_PORT}/healthz"
printf '\nLOCAL_LOGIN_STATUS=' 
curl -sS -o /dev/null -w '%{http_code}\n' "http://127.0.0.1:${APP_PORT}/auth/login"
```

`getent hosts`-এ VPS-এর public IP বা সঠিক DNS address দেখা এবং local health-এ `status:ok` পাওয়া দরকার। DNS না মিললে Certbot চালাবেন না। Domain-এর A record-এ VPS public IPv4 এবং প্রয়োজনে AAAA record-এ সঠিক IPv6 থাকতে হবে; ভুল AAAA record থাকলে IPv6 client-এ certificate বা site failure হতে পারে।

## ২. Nginx install, backup এবং HTTP reverse proxy

```bash
set -Eeuo pipefail
DOMAIN='dsai.banglarvoice24news.com'
APP_PORT='3011'
SITE="/etc/nginx/sites-available/${DOMAIN}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

sudo apt-get update
sudo apt-get install -y nginx

if sudo test -e "$SITE"; then
  sudo cp -a "$SITE" "${SITE}.bak.${STAMP}"
  printf 'BACKUP=%s\n' "${SITE}.bak.${STAMP}"
fi

sudo tee "$SITE" >/dev/null <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}
NGINX

sudo ln -sfn "$SITE" "/etc/nginx/sites-enabled/${DOMAIN}"
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
curl -I "http://${DOMAIN}/auth/login"
```

এখানে SPA history fallback application server-এ proxy করা হয়েছে। Nginx-এর `try_files` দিয়ে static file খোঁজার বদলে backend-কে route দেওয়া হয়েছে, যাতে `/auth/login` সরাসরি browser refresh-এও application পায়।

## ৩. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status verbose
```

যদি Cloud provider firewall/security rule থাকে, TCP `80` এবং `443` public inbound allow করতে হবে। Application port `3011` public inbound হিসেবে খুলবেন না; এটি loopback-only থাকবে।

## ৪. HTTPS certificate ও HTTP redirect

DNS এবং HTTP proxy test pass হওয়ার পরে Certbot চালান:

```bash
set -Eeuo pipefail
DOMAIN='dsai.banglarvoice24news.com'
CERTBOT_EMAIL='eventai@banglarvoice24news.com'

sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx \
  -d "$DOMAIN" \
  --redirect \
  --agree-tos \
  --no-eff-email \
  --email "$CERTBOT_EMAIL"
sudo nginx -t
sudo systemctl reload nginx
```

Certbot সফল হলে `http://dsai.banglarvoice24news.com` HTTPS-এ redirect এবং `https://dsai.banglarvoice24news.com` certificate সহ open হওয়ার কথা। Email address নিজের নিয়ন্ত্রিত address না হলে command-এ সেটি পরিবর্তন করুন।

## ৫. Public smoke test

```bash
set -Eeuo pipefail
DOMAIN='dsai.banglarvoice24news.com'

printf 'HTTPS_ROOT='; curl -sS -o /dev/null -w '%{http_code}\n' "https://${DOMAIN}/"
printf 'HTTPS_LOGIN='; curl -sS -o /dev/null -w '%{http_code}\n' "https://${DOMAIN}/auth/login"
printf 'HTTPS_HEALTH='; curl -sS -o /dev/null -w '%{http_code}\n' "https://${DOMAIN}/healthz"
printf '\nCERTIFICATE:\n'
openssl s_client -connect "${DOMAIN}:443" -servername "$DOMAIN" </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
printf '\nNGINX_STATUS:\n'
sudo systemctl --no-pager --full status nginx | sed -n '1,20p'
```

`HTTPS_LOGIN=200`, valid certificate dates, `nginx` active status এবং browser-এ domain open হওয়া প্রত্যাশিত ফল। `/healthz` public রাখা নিরাপত্তা নীতির সঙ্গে সামঞ্জস্যপূর্ণ না হলে public health status না-ও দিতে পারে; সে ক্ষেত্রে local health এবং Nginx access log দিয়ে যাচাই করবেন।

## ৬. Certificate renewal test

```bash
sudo certbot renew --dry-run
```

## ৭. Nginx failure diagnostics

```bash
sudo nginx -t
sudo journalctl -u nginx -n 100 --no-pager
sudo tail -n 100 /var/log/nginx/error.log
sudo tail -n 100 /var/log/nginx/access.log
curl -v "http://127.0.0.1:3011/auth/login"
```

যদি local curl pass করে কিন্তু public domain fail করে, সমস্যা Nginx/DNS/TLS/firewall স্তরে। যদি local curl-ও fail করে, সমস্যা application process বা port `3011`-এ।

## ৮. Safe rollback

```bash
set -Eeuo pipefail
DOMAIN='dsai.banglarvoice24news.com'
SITE="/etc/nginx/sites-available/${DOMAIN}"
LATEST_BACKUP="$(find /etc/nginx/sites-available -maxdepth 1 -type f -name "${DOMAIN}.bak.*" -printf '%T@ %p\n' 2>/dev/null | sort -nr | awk 'NR==1{sub(/^[^ ]+ /,""); print}')"

test -n "$LATEST_BACKUP"
sudo cp -a "$LATEST_BACKUP" "$SITE"
sudo nginx -t
sudo systemctl reload nginx
printf 'ROLLED_BACK_TO=%s\n' "$LATEST_BACKUP"
```

এই sequence application process বন্ধ করে না। Nginx config পরিবর্তনের আগে backup নেয় এবং `nginx -t` ব্যর্থ হলে reload করে না। Public DNS, certificate, OAuth callback allowlist এবং external VPS state remote operator evidence ছাড়া এখানে সত্যায়িত বলে দাবি করা যাবে না।
