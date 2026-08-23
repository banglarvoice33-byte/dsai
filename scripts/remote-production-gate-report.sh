#!/usr/bin/env bash
set -u

DOMAIN="${DSAI_DOMAIN:-dsai.banglarvoice24news.com}"
PORT="${DSAI_PORT:-3011}"
APP_URL="http://127.0.0.1:${PORT}"

pass=0
fail=0
report() {
  local name="$1" status="$2" detail="${3:-}"
  printf '%-28s %s %s\n' "$name" "$status" "$detail"
  if [[ "$status" == PASS* ]]; then pass=$((pass + 1)); else fail=$((fail + 1)); fi
}

printf 'DSAI_REMOTE_GATE_REPORT domain=%s port=%s\n' "$DOMAIN" "$PORT"

if systemctl is-active --quiet dsai.service; then report systemd PASS active; else report systemd FAIL inactive-or-missing; fi
if systemctl is-enabled --quiet dsai.service 2>/dev/null; then report systemd_boot PASS enabled; else report systemd_boot FAIL disabled-or-missing; fi
if nginx -t >/tmp/dsai-nginx-test.out 2>&1; then report nginx_config PASS; else report nginx_config FAIL "$(tr '\n' ' ' </tmp/dsai-nginx-test.out | cut -c1-160)"; fi
if systemctl is-active --quiet nginx; then report nginx_service PASS active; else report nginx_service FAIL inactive-or-missing; fi
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q '^Status: active'; then report firewall PASS active; else report firewall FAIL inactive-or-missing; fi
if curl -fsS --max-time 10 "${APP_URL}/healthz" >/tmp/dsai-health.out 2>&1; then report local_health PASS; else report local_health FAIL; fi
if curl -fsS --max-time 10 "${APP_URL}/readyz" >/tmp/dsai-ready.out 2>&1; then report local_ready PASS; else report local_ready FAIL; fi
if curl -fsS --max-time 10 -o /dev/null "${APP_URL}/auth/login"; then report local_login PASS; else report local_login FAIL; fi
if getent hosts "$DOMAIN" >/tmp/dsai-dns.out 2>&1; then report dns PASS "$(tr '\n' ' ' </tmp/dsai-dns.out | cut -c1-120)"; else report dns FAIL; fi
if curl -fsSIL --max-time 15 "https://${DOMAIN}/" >/tmp/dsai-public-root.out 2>&1; then report public_root PASS; else report public_root FAIL; fi
if curl -fsSIL --max-time 15 "https://${DOMAIN}/auth/login" >/tmp/dsai-public-login.out 2>&1; then report public_login PASS; else report public_login FAIL; fi
if curl -fsSIL --max-time 15 "https://${DOMAIN}/lead-composer" >/tmp/dsai-public-lead.out 2>&1; then report public_lead PASS; else report public_lead FAIL; fi
if openssl s_client -connect "${DOMAIN}:443" -servername "$DOMAIN" </dev/null >/tmp/dsai-tls.out 2>&1; then report tls PASS; else report tls FAIL; fi

printf 'PASS_COUNT=%s FAIL_COUNT=%s\n' "$pass" "$fail"
if (( fail > 0 )); then exit 1; fi
printf 'DSAI_REMOTE_GATES=PASS\n'
