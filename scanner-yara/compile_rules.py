#!/usr/bin/env python3
"""Compile a reproducible, licence-aware subset of Neo23x0 Signature-Base."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import yara

SOURCE = Path("/opt/signature-base/yara")
OUTPUT = Path("/app/rules.yarc")
MANIFEST = Path("/app/rules-manifest.json")
LOCAL_RULES = Path("/app/local-rules")
MIN_RULES = 100

external_file = SOURCE / "external-variable-rules.txt"
excluded_external = {
    line.strip()
    for line in external_file.read_text(encoding="utf-8").splitlines()
    if line.strip() and not line.lstrip().startswith("#")
}

rule_files = sorted(
    path for path in SOURCE.rglob("*")
    if path.is_file() and path.suffix.lower() in {".yar", ".yara"}
)
filepaths: dict[str, str] = {}
namespace_to_source: dict[str, str] = {}
excluded: list[dict[str, str]] = []
source_rule_count = 0

for path in rule_files:
    relative = path.relative_to(SOURCE).as_posix()
    if path.name in excluded_external:
        excluded.append({"path": relative, "reason": "requires scanner-specific external variables"})
        continue

    source = path.read_text(encoding="utf-8", errors="strict")
    # Repository default is DRL 1.1; explicit per-rule alternative licences are excluded.
    declared_licenses = re.findall(
        r"""(?im)^\s*license\s*=\s*["']([^"']+)["']""", source
    )
    incompatible = [
        license_name for license_name in declared_licenses
        if not ("DRL" in license_name.upper() and "1.1" in license_name)
    ]
    if incompatible:
        excluded.append({"path": relative, "reason": "explicit non-DRL-1.1 rule licence"})
        continue

    source_rule_count += len(
        re.findall(r"\brule\s+(?:(?:private|global)\s+)*[A-Za-z_]\w*", source)
    )
    namespace = f"signature_base_{len(filepaths):04d}"
    filepaths[namespace] = str(path)
    namespace_to_source[namespace] = relative

if not filepaths:
    raise SystemExit("No compatible Signature-Base rules were selected")

local_rule = LOCAL_RULES / "eicar_test.yar"
filepaths["dsai_test_signatures"] = str(local_rule)
rules = yara.compile(filepaths=filepaths, includes=True, error_on_warning=False)

compiled_rule_count = source_rule_count + len(
    re.findall(
        r"\brule\s+(?:(?:private|global)\s+)*[A-Za-z_]\w*",
        local_rule.read_text(encoding="utf-8"),
    )
)
if compiled_rule_count < MIN_RULES:
    raise SystemExit(f"Only {compiled_rule_count} rules compiled; minimum is {MIN_RULES}")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
rules.save(str(OUTPUT))
manifest = {
    "engine": "yara-python",
    "yaraVersion": yara.__version__,
    "signatureBaseCommit": "fffcaa4d3931d791a2553f01457966144418a316",
    "signatureBaseRepository": "https://github.com/Neo23x0/signature-base",
    "license": "Detection Rule License 1.1; explicit alternative rule licences excluded",
    "compiledRuleFiles": len(filepaths),
    "ruleSources": namespace_to_source,
    "compiledRuleCount": compiled_rule_count,
    "excludedFiles": excluded,
    "compiledRulesSha256": hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),
}
MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print(json.dumps({key: value for key, value in manifest.items() if key != "excludedFiles"}, indent=2))
print(f"Excluded {len(excluded)} scanner-specific or incompatible rule files")
