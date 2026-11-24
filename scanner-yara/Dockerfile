# Build YARA and the pinned upstream rules in a disposable stage.
FROM python:3.12-slim-bookworm AS build
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_NO_CACHE_DIR=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /build
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY scanner-yara/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
# CI/local build tooling checks out the exact upstream commit before docker build.
# Never fetch mutable or network-dependent rule sources inside BuildKit.
COPY scanner-yara/vendor/signature-base/yara /opt/signature-base/yara
COPY scanner-yara/vendor/signature-base/LICENSE /opt/signature-base/LICENSE
COPY scanner-yara/compile_rules.py /app/compile_rules.py
COPY scanner-yara/rules /app/local-rules
RUN python /app/compile_rules.py

FROM python:3.12-slim-bookworm AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8080 \
    YARA_RULES_PATH=/app/rules.yarc YARA_MANIFEST_PATH=/app/rules-manifest.json \
    MAX_SCAN_BYTES=10485760 YARA_SCAN_TIMEOUT=12 MAX_CONCURRENT_SCANS=1
WORKDIR /app
COPY --from=build /usr/local /usr/local
COPY --from=build /app/rules.yarc /app/rules.yarc
COPY --from=build /app/rules-manifest.json /app/rules-manifest.json
COPY --from=build /opt/signature-base/LICENSE /app/SIGNATURE-BASE-LICENSE
COPY scanner-yara/server.py /app/server.py
RUN groupadd --system --gid 10001 scanner \
    && useradd --system --uid 10001 --gid scanner --home-dir /nonexistent --shell /usr/sbin/nologin scanner \
    && chown -R scanner:scanner /app
USER 10001:10001
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:' + os.getenv('PORT', '8080') + '/healthz', timeout=3)"
CMD ["python", "/app/server.py"]
