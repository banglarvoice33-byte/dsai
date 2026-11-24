#!/usr/bin/env bash
set -Eeuo pipefail
: "\${SCANNER_URL:?Set SCANNER_URL}"
: "\${MALWARE_SCANNER_API_KEY:?Set MALWARE_SCANNER_API_KEY}"
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
print("PASS: no-match verdict and server-side SHA-256")
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
assert "DSAI_EICAR_Test_Signature" in p["rules"]
print("PASS: EICAR test signature rejected")
PY

code="$(curl --silent --output /dev/null --write-out '%{http_code}' \
  -H 'Authorization: Bearer wrong-token' -H 'Content-Type: application/octet-stream' \
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
