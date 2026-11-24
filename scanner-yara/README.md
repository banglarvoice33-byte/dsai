# DSAI YARA Scanner

A small, authenticated, stateless YARA scanning service for the DSAI quarantine pipeline.

## Engine and rules

- `yara-python==4.5.4`; compiled rules load once at process startup.
- Neo23x0/signature-base is pinned to commit `fffcaa4d3931d791a2553f01457966144418a316`.
- Files listed in `yara/external-variable-rules.txt` are excluded because they require LOKI/THOR-specific external variables.
- Explicit per-rule licences other than DRL 1.1 are excluded. DRL 1.1 is a custom attribution license; do not describe the bundled rules as OSI-certified open source without a separate legal review. The YARA engine itself is open source. Preserve per-rule author, source and license attribution.
- A harmless EICAR test-string rule is included for repeatable integration tests.
- Compiled rules and provenance are baked into the image; no runtime rule download is required.

## API

- `GET /healthz` and `GET /readyz`: readiness and rule-manifest metadata.
- `POST /scan` with `Authorization: Bearer <MALWARE_SCANNER_API_KEY>` and `Content-Type: application/octet-stream`.

The scanner accepts at most 10 MiB, one scan at a time, streams request bytes into a temporary file, has a bounded YARA timeout, and does not log filenames, bytes, hashes, tokens or user identity. It does not unpack archives, emulate files, execute samples, or claim heuristic/behavioral coverage.

A `200` response means **no loaded YARA rule matched**. It does not prove that a file is benign or virus-free. `422` means at least one rule matched. `503` means the engine could not complete the scan; callers must keep the file quarantined.

## Render Free limitations

Render Free web services have 512 MiB RAM but only 0.1 CPU, sleep after 15 minutes without inbound traffic, and can take about one minute to wake. Their filesystems are ephemeral and 750 free instance-hours are shared across the workspace. DSAI's Vercel Hobby functions have a 60-second ceiling, so a cold-start scan may time out; uploads remain quarantined and must be retried. This is a controlled low-cost pilot, not an availability-guaranteed production security boundary. For production uploads, use an always-on 0.5 CPU / 512 MiB service (Render Starter is currently $7/month) or equivalent. This change does not select or purchase a paid plan.

## Deployment variables

- `MALWARE_SCANNER_API_KEY`: random secret of at least 32 characters.
- `PORT`: supplied by Render; defaults to 8080.
- `MAX_SCAN_BYTES`: defaults to 10 MiB.
- `YARA_SCAN_TIMEOUT`: defaults to 12 seconds.
- `MAX_CONCURRENT_SCANS`: must remain 1 on 512 MiB.

## Local build

The Docker build intentionally performs no GitHub network access. Fetch the exact immutable upstream rule source on the host first (CI performs the equivalent pinned checkout):

```bash
mkdir -p scanner-yara/vendor
if [ ! -d scanner-yara/vendor/signature-base/.git ]; then
  git clone --filter=blob:none --no-checkout https://github.com/Neo23x0/signature-base.git scanner-yara/vendor/signature-base
fi
git -C scanner-yara/vendor/signature-base fetch --depth 1 origin fffcaa4d3931d791a2553f01457966144418a316
git -C scanner-yara/vendor/signature-base checkout --detach fffcaa4d3931d791a2553f01457966144418a316

docker build -f scanner-yara/Dockerfile -t dsai-yara-scanner .
docker run --rm -p 8080:8080 \
  -e MALWARE_SCANNER_API_KEY="$(openssl rand -hex 32)" \
  dsai-yara-scanner
```

Run `SCANNER_URL=http://127.0.0.1:8080 MALWARE_SCANNER_API_KEY=... scanner-yara/smoke-test.sh`.


## CI resource measurement

The first real Docker run compiled 2,049 rules and produced a 143,291,734-byte image (143.29 MB decimal). Idle container memory was 24.87 MiB under a 512 MiB cgroup limit. The integration suite now also scans a deterministic 9 MiB byte stream and reports the process peak RSS; use that scan-time measurement, not the idle sample, when deciding whether the 512 MiB plan has sufficient headroom.
