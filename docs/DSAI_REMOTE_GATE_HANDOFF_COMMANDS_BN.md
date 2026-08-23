# DSAI Remote Gate Handoff — নিরাপদ কমান্ড

**উদ্দেশ্য:** DSAI-এর project-side কাজ শেষ হওয়ার পরে target VPS-এ operator নিজে public deployment gates যাচাই করবেন। এই কমান্ডগুলো secret value, environment file content, token, cookie বা private key print করে না। এগুলো configuration পরিবর্তন করে না।

## ১. Release ও environment boundary

Verified credential-free release extract করার পরে project directory-তে গিয়ে প্রথমে protected environment file-এর metadata যাচাই করুন:

```bash
cd /home/dulal_sarder90/dsai/current
printf 'CURRENT=%s\n' "$(pwd)"
test -s /etc/dsai/dsai.env
stat -c 'ENV_MODE=%a ENV_OWNER=%U ENV_GROUP=%G ENV_PATH=%n' /etc/dsai/dsai.env
node scripts/validate-production-env.mjs /etc/dsai/dsai.env
find . -type f \( -name '.env' -o -name '.env.local' -o -name '.env.production' -o -name '*.pem' -o -name '*.key' \) -print -quit | grep -q . && { echo 'IN_TREE_SECRET_ARTIFACT=FAIL'; exit 1; } || echo 'IN_TREE_SECRET_ARTIFACT=PASS'
```

`ENV_MODE=600` ছাড়া validation pass হিসেবে গ্রহণ করবেন না। `validate-production-env.mjs` কোনো secret value print করার কথা নয়। কোনো value বা full environment output chat-এ পাঠাবেন না।

## ২. Service, local health, and process supervision

```bash
systemctl is-active --quiet dsai.service && echo 'SYSTEMD_ACTIVE=PASS' || echo 'SYSTEMD_ACTIVE=FAIL'
systemctl is-enabled --quiet dsai.service 2>/dev/null && echo 'SYSTEMD_ENABLED=PASS' || echo 'SYSTEMD_ENABLED=FAIL'
PORT_FILE=.dsai-runtime/port
PORT="$(cat "$PORT_FILE")"
printf 'PORT=%s\n' "$PORT"
curl -fsS "http://127.0.0.1:${PORT}/healthz" >/dev/null && echo 'LOCAL_HEALTH=PASS' || echo 'LOCAL_HEALTH=FAIL'
curl -fsS "http://127.0.0.1:${PORT}/readyz" >/dev/null && echo 'LOCAL_READY=PASS' || echo 'LOCAL_READY=FAIL'
curl -fsS -o /dev/null "http://127.0.0.1:${PORT}/auth/login" && echo 'LOCAL_LOGIN=PASS' || echo 'LOCAL_LOGIN=FAIL'
```

`LOCAL_READY=PASS` কেবল তখনই meaningful যখন `/readyz` target database-এ non-mutating readiness probe সফল করেছে।

## ৩. Nginx, firewall, DNS, and HTTPS edge

```bash
nginx -t && echo 'NGINX_CONFIG=PASS' || echo 'NGINX_CONFIG=FAIL'
systemctl is-active --quiet nginx && echo 'NGINX_ACTIVE=PASS' || echo 'NGINX_ACTIVE=FAIL'
command -v ufw >/dev/null 2>&1 && ufw status | grep -q '^Status: active' && echo 'FIREWALL=PASS' || echo 'FIREWALL=FAIL'
getent hosts dsai.banglarvoice24news.com >/dev/null && echo 'DNS=PASS' || echo 'DNS=FAIL'
for route in / /auth/login /lead-composer /try-first /creative-studio /scholarship; do
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "https://dsai.banglarvoice24news.com${route}")"
  printf 'PUBLIC_%s=%s\n' "${route#/}" "$code"
  test "$code" = 200 || exit 1
done
openssl s_client -connect dsai.banglarvoice24news.com:443 -servername dsai.banglarvoice24news.com </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```

Nginx configuration, DNS target, certificate hostname, and upstream port must be reviewed together. A successful DNS lookup alone does not prove that traffic reaches the intended VPS.

## ৪. OAuth callback click-through

Use the final HTTPS domain in the OAuth provider configuration. Confirm the exact callback path from the application/provider contract, then test a fresh login in a clean browser session and a returning session. Record only:

```text
OAUTH_NEW_LOGIN=PASS|FAIL
OAUTH_RETURNING_SESSION=PASS|FAIL
OAUTH_CALLBACK_HOST_MATCH=PASS|FAIL
```

Do not paste authorization codes, cookies, state values, access tokens, client secrets, or provider screenshots containing credentials.

## ৫. Single non-secret gate report

After the individual checks, the bundled report can summarize the public gates:

```bash
cd /home/dulal_sarder90/dsai/current
DSAI_DOMAIN=dsai.banglarvoice24news.com DSAI_PORT_FILE=.dsai-runtime/port bash scripts/remote-production-gate-report.sh
```

Send only the named result lines and `PASS_COUNT`/`FAIL_COUNT`. A complete report is still not a substitute for a real OAuth click-through, restore drill, provider staging test, or real-device review.

## Stop conditions

Stop public promotion when the environment file is missing or readable by group/world, `/readyz` fails, Nginx points to the wrong port, DNS or TLS targets the wrong edge, OAuth callback host does not match, rollback has not been rehearsed, backups have not been restored in a drill, or any provider action lacks consent, idempotency, rate limiting, audit logging, and human approval.
