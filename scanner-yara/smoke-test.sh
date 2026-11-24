#!/usr/bin/env bash
set -Eeuo pipefail
: "${SCANNER_URL:?Set SCANNER_URL}"
: "${MALWARE_SCANNER_API_KEY:?Set MALWARE_SCANNER_API_KEY}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

curl --fail --silent --show-error "$SCANNER_URL/healthz" > "$tmp/health.json"
python - "$tmp/health.json" <<'PY'
import json, sys
p=json.load(open(sys.argv[1], encoding="utf-8"))
assert p["ready"] is True and p["engine"] == "yara"
assert p["rulesCount"] >= 100
print("PASS: YARA readiness and compiled rule manifest")
PY

printf '%s' 'ordinary DSAI benign test content' > "$tmp/clean.bin"
code="$(curl --silent --output "$tmp/clean.json" --write-out '%{http_code}' \
  -H "Authorization: Bearer $MALWARE_SCANNER_API_KEY" \
  -H 'Content-Type: application/octet-stream' --data-binary @"$tmp/clean.bin" \
  "$SCANNER_URL/scan")"
test "$code" = "200"
python - "$tmp/clean.json" <<'PY'
import json, sys
p=json.load(open(sys.argv[1], encoding="utf-8"))
assert p["clean"] is True and p["engine"] == "yara" and p["verdict"] == "no_match"
assert len(p["sha256"]) == 64
assert p["peakRssBytes"] > 0
print("PASS: no-match verdict, SHA-256 and peak RSS measurement")
PY

# Exercise a near-limit real scan (not just the 413 size guard).
python - "$tmp/large.bin" <<'PY'
payload = b"DSAI neutral large-file memory test payload.\\n"
remaining = 9 * 1024 * 1024
with open(sys.argv[1], "wb") as output:
    while remaining:
        chunk = payload[:remaining]
        output.write(chunk)
        remaining -= len(chunk)
PY
code="$(curl --silent --output "$tmp/large.json" --write-out '%{http_code}' \
  -H "Authorization: Bearer $MALWARE_SCANNER_API_KEY" \
  -H 'Content-Type: application/octet-stream' --data-binary @"$tmp/large.bin" \
  "$SCANNER_URL/scan")"
test "$code" = "200"
python - "$tmp/large.json" <<'PY'
import json, sys
p=json.load(open(sys.argv[1], encoding="utf-8"))
assert p["clean"] is True and p["engine"] == "yara" and p["verdict"] == "no_match"
assert p["peakRssBytes"] > 0
print(f"PASS: 9 MiB real scan; peak process RSS={p['peakRssBytes']} bytes; duration={p['durationMs']} ms")
PY

printf '%s' 'EICAR-STANDARD-ANTIVIRUS-TEST-FILE' > "$tmp/eicar.bin"
code="$(curl --silent --output "$tmp/eicar.json" --write-out '%{http_code}' \
  -H "Authorization: Bearer $MALWARE_SCANNER_API_KEY" \
  -H 'Content-Type: application/octet-stream' --data-binary @"$tmp/eicar.bin" \
  "$SCANNER_URL/scan")"
test "$code" = "422"
python - "$tmp/eicar.json" <<'PY'
import json, sys
p=json.load(open(sys.argv[1], encoding="utf-8"))
assert p["clean"] is False and p["engine"] == "yara"
assert any(rule.get("rule") == "DSAI_EICAR_Test_Signature" for rule in p["rules"])
print("PASS: EICAR test signature rejected")
PY

invalid_token="wrong-token"
auth_header_name="Authorization"
auth_header_value="Bearer $invalid_token"
code="$(curl --silent --output /dev/null --write-out '%{http_code}' \
  -H "$auth_header_name: $auth_header_value" -H 'Content-Type: application/octet-stream' \
  --data-binary @"$tmp/clean.bin" "$SCANNER_URL/scan")"
test "$code" = "401"
echo "PASS: invalid bearer token rejected"

dd if=/dev/zero of="$tmp/oversize.bin" bs=1048576 count=10 status=none
printf 'x' >> "$tmp/oversize.bin"
code="$(curl --silent --output /dev/null --write-out '%{http_code}' \
  -H "Authorization: Bearer $MALWARE_SCANNER_API_KEY" \
  -H 'Content-Type: application/octet-stream' --data-binary @"$tmp/oversize.bin" \
  "$SCANNER_URL/scan")"
test "$code" = "413"
echo "PASS: 10 MiB upload limit enforced"
