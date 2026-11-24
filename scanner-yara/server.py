#!/usr/bin/env python3
"""Authenticated, bounded YARA HTTP scanner; uploads are never persisted."""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import resource
import sys
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlsplit

import yara

PORT = int(os.getenv("PORT", "8080"))
API_KEY = os.getenv("MALWARE_SCANNER_API_KEY", "")
MAX_BYTES = int(os.getenv("MAX_SCAN_BYTES", str(10 * 1024 * 1024)))
SCAN_TIMEOUT = int(os.getenv("YARA_SCAN_TIMEOUT", "12"))
MAX_CONCURRENCY = int(os.getenv("MAX_CONCURRENT_SCANS", "1"))
RULES_PATH = Path(os.getenv("YARA_RULES_PATH", "/app/rules.yarc"))
MANIFEST_PATH = Path(os.getenv("YARA_MANIFEST_PATH", "/app/rules-manifest.json"))

if len(API_KEY) < 32:
    raise RuntimeError("MALWARE_SCANNER_API_KEY must contain at least 32 characters")
if not 1 <= MAX_BYTES <= 10 * 1024 * 1024:
    raise RuntimeError("MAX_SCAN_BYTES must be between 1 byte and 10 MiB")
if not 1 <= SCAN_TIMEOUT <= 30:
    raise RuntimeError("YARA_SCAN_TIMEOUT must be between 1 and 30 seconds")
if MAX_CONCURRENCY != 1:
    raise RuntimeError("The 512 MiB deployment is intentionally limited to one concurrent scan")
if not RULES_PATH.is_file() or not MANIFEST_PATH.is_file():
    raise RuntimeError("Compiled YARA rules or manifest are missing")

RULES = yara.load(str(RULES_PATH))
MANIFEST = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
if int(MANIFEST.get("compiledRuleCount", 0)) < 100:
    raise RuntimeError("Compiled rule count is below the production safety threshold")

SCAN_SLOT = threading.BoundedSemaphore(MAX_CONCURRENCY)


def rule_attribution(match) -> dict:
    """Retain per-rule authorship and a stable source link as required by DRL 1.1."""
    metadata = getattr(match, "meta", {}) or {}
    namespace = getattr(match, "namespace", "")
    source_path = MANIFEST.get("ruleSources", {}).get(namespace)
    if namespace == "dsai_test_signatures":
        source_url = "https://github.com/banglarvoice33-byte/dsai/tree/main/scanner-yara/rules/eicar_test.yar"
    elif source_path:
        commit = MANIFEST["signatureBaseCommit"]
        source_url = f"https://github.com/Neo23x0/signature-base/blob/{commit}/{source_path}"
    else:
        source_url = "https://github.com/Neo23x0/signature-base"

    author = metadata.get("author")
    reference = metadata.get("reference")
    license_name = metadata.get("license") or ("DSAI project terms" if namespace == "dsai_test_signatures" else "DRL-1.1")
    details = {"rule": str(match.rule), "sourceUrl": source_url, "license": str(license_name)[:80]}
    if isinstance(author, (str, int, float)):
        details["author"] = str(author)[:200]
    elif isinstance(author, (list, tuple)):
        details["author"] = ", ".join(str(value) for value in author)[:200]
    if isinstance(reference, str):
        details["reference"] = reference[:500]
    return details


def peak_rss_bytes() -> int:
    """Return process peak resident memory; Linux reports KiB, macOS reports bytes."""
    peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    return int(peak if sys.platform == "darwin" else peak * 1024)


def json_bytes(payload: dict) -> bytes:
    return json.dumps(payload, separators=(",", ":"), ensure_ascii=True).encode("utf-8")


class Handler(BaseHTTPRequestHandler):
    def setup(self) -> None:
        super().setup()
        self.connection.settimeout(20)

    server_version = "DSAI-YARA"
    sys_version = ""

    def log_message(self, _format: str, *_args) -> None:
        # Never log filenames, bytes, hashes, authorization headers or user identity.
        return

    def send_json(self, status: int, payload: dict) -> None:
        body = json_bytes(payload)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(body)
        self.close_connection = True

    def do_GET(self) -> None:
        path = urlsplit(self.path).path
        if path not in {"/healthz", "/readyz"}:
            self.send_json(404, {"error": "not_found"})
            return
        self.send_json(200, {
            "status": "ok",
            "ready": True,
            "engine": "yara",
            "yaraVersion": yara.__version__,
            "rulesVersion": MANIFEST["signatureBaseCommit"],
            "rulesCount": MANIFEST["compiledRuleCount"],
            "apiKeyConfigured": True,
        })

    def do_POST(self) -> None:
        if urlsplit(self.path).path != "/scan":
            self.send_json(404, {"error": "not_found"})
            return

        supplied = self.headers.get("Authorization", "")
        expected = "Bearer " + API_KEY
        if not hmac.compare_digest(supplied.encode("utf-8"), expected.encode("utf-8")):
            self.send_json(401, {"error": "unauthorized"})
            return

        content_type = self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
        if content_type != "application/octet-stream":
            self.send_json(415, {"error": "binary_body_required"})
            return
        if self.headers.get("Content-Encoding", "identity").lower() != "identity":
            self.send_json(415, {"error": "content_encoding_not_supported"})
            return
        try:
            content_length = int(self.headers.get("Content-Length", ""))
        except ValueError:
            self.send_json(411, {"error": "content_length_required"})
            return
        if content_length < 1:
            self.send_json(400, {"error": "empty_file"})
            return
        if content_length > MAX_BYTES:
            self.send_json(413, {"error": "file_too_large", "maxBytes": MAX_BYTES})
            return
        if not SCAN_SLOT.acquire(blocking=False):
            self.send_json(429, {"error": "scanner_busy", "retryable": True})
            return

        started = time.monotonic()
        digest = hashlib.sha256()
        received = 0
        try:
            # A TemporaryFile is removed on close; nothing persists across requests.
            with tempfile.TemporaryFile(mode="w+b") as sample:
                while received < content_length:
                    chunk = self.rfile.read(min(64 * 1024, content_length - received))
                    if not chunk:
                        self.send_json(400, {"error": "incomplete_request_body"})
                        return
                    received += len(chunk)
                    digest.update(chunk)
                    sample.write(chunk)
                sample.flush()

                try:
                    matches = RULES.match(
                        filepath=f"/proc/self/fd/{sample.fileno()}",
                        timeout=SCAN_TIMEOUT,
                        which_callbacks=yara.CALLBACK_MATCHES,
                    )
                except yara.TimeoutError:
                    self.send_json(503, {"error": "scan_timeout", "retryable": True})
                    return
                except Exception:
                    self.send_json(503, {"error": "scan_engine_error", "retryable": True})
                    return

            sha256 = digest.hexdigest()
            elapsed_ms = int((time.monotonic() - started) * 1000)
            if matches:
                self.send_json(422, {
                    "clean": False,
                    "engine": "yara",
                    "verdict": "signature_match",
                    "sha256": sha256,
                    "rulesVersion": MANIFEST["signatureBaseCommit"],
                    "rules": [rule_attribution(match) for match in matches[:50]],
                    "durationMs": elapsed_ms,
                    "peakRssBytes": peak_rss_bytes(),
                })
                return

            # No match is not proof that the uploaded file is benign or virus-free.
            self.send_json(200, {
                "clean": True,
                "engine": "yara",
                "verdict": "no_match",
                "sha256": sha256,
                "rulesVersion": MANIFEST["signatureBaseCommit"],
                "rulesCount": MANIFEST["compiledRuleCount"],
                "durationMs": elapsed_ms,
                "peakRssBytes": peak_rss_bytes(),
            })
        finally:
            SCAN_SLOT.release()


class Server(HTTPServer):
    # Synchronous request handling guarantees at most one in-flight scan and avoids unbounded threads.
    allow_reuse_address = True


if __name__ == "__main__":
    Server(("0.0.0.0", PORT), Handler).serve_forever(poll_interval=0.5)
