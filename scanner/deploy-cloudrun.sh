#!/usr/bin/env bash
# Deploy DSAI's open-source ClamAV scanner to Google Cloud Run.
# Requires: gcloud CLI, openssl, curl, and an authenticated GCP project with billing enabled.
set -Eeuo pipefail

PROJECT_ID="${1:-${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project 2>/dev/null || true)}}"
REGION="${2:-${CLOUD_RUN_REGION:-us-central1}}"
SERVICE="dsai-malware-scanner"
REPOSITORY="dsai-scanner"
SECRET="dsai-malware-scanner-api-key"
RUNTIME_SA="dsai-scanner-runtime"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"

if [[ -z "$PROJECT_ID" || "$PROJECT_ID" == "(unset)" ]]; then
  echo "ERROR: Set GOOGLE_CLOUD_PROJECT or pass the GCP project ID as argument 1." >&2
  exit 2
fi
for command in gcloud openssl curl sed; do
  command -v "$command" >/dev/null 2>&1 || { echo "ERROR: Missing required command: $command" >&2; exit 2; }
done
gcloud auth list --filter=status:ACTIVE --format='value(account)' | grep -q . || {
  echo "ERROR: Authenticate first with: gcloud auth login" >&2; exit 2;
}

echo "== Enable required APIs =="
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com --project "$PROJECT_ID"

echo "== Create Artifact Registry repository if absent =="
if ! gcloud artifacts repositories describe "$REPOSITORY" --location "$REGION" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$REPOSITORY" --repository-format=docker --location "$REGION" --description="DSAI ClamAV scanner gateway" --project "$PROJECT_ID"
fi

echo "== Create least-privilege runtime service account if absent =="
SA_EMAIL="$RUNTIME_SA@$PROJECT_ID.iam.gserviceaccount.com"
if ! gcloud iam service-accounts describe "$SA_EMAIL" --project "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$RUNTIME_SA" --display-name="DSAI malware scanner runtime" --project "$PROJECT_ID"
fi

echo "== Create scanner API secret if absent (key is never printed) =="
if ! gcloud secrets describe "$SECRET" --project "$PROJECT_ID" >/dev/null 2>&1; then
  SCANNER_KEY="$(openssl rand -hex 32)"
  printf '%s' "$SCANNER_KEY" | gcloud secrets create "$SECRET" --replication-policy=automatic --data-file=- --project "$PROJECT_ID"
  unset SCANNER_KEY
else
  echo "Existing Secret Manager secret retained; no rotation performed."
fi
gcloud secrets add-iam-policy-binding "$SECRET" --member="serviceAccount:$SA_EMAIL" --role="roles/secretmanager.secretAccessor" --project "$PROJECT_ID" --quiet >/dev/null

echo "== Build the scanner gateway image =="
if git -C "$REPO_ROOT" rev-parse --short HEAD >/dev/null 2>&1; then
  IMAGE_TAG="$(git -C "$REPO_ROOT" rev-parse --short HEAD)"
else
  IMAGE_TAG="$(date -u +%Y%m%d%H%M%S)"
fi
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/scanner:$IMAGE_TAG"
gcloud builds submit "$SCRIPT_DIR" --tag "$IMAGE" --project "$PROJECT_ID" --region "$REGION"

echo "== Deploy Cloud Run service =="
TEMP_YAML="$(mktemp)"
trap 'rm -f "$TEMP_YAML"' EXIT
sed -e "s|SCANNER_IMAGE_PLACEHOLDER|$IMAGE|g" -e "s|PROJECT_ID_PLACEHOLDER|$PROJECT_ID|g" "$SCRIPT_DIR/cloudrun-service.yaml" > "$TEMP_YAML"
gcloud run services replace "$TEMP_YAML" --project "$PROJECT_ID" --region "$REGION" --quiet

SERVICE_URL="$(gcloud run services describe "$SERVICE" --project "$PROJECT_ID" --region "$REGION" --format='value(status.url)')"
if [[ -z "$SERVICE_URL" ]]; then
  echo "ERROR: Cloud Run did not return a service URL." >&2
  exit 1
fi

echo "== Verify scanner readiness (ClamAV must answer PING) =="
curl --fail --silent --show-error --retry 12 --retry-delay 5 --retry-all-errors --max-time 300 "$SERVICE_URL/healthz"
echo
echo
echo "CLOUD_RUN_SCANNER_URL=$SERVICE_URL/scan"
echo "Set Vercel project 'dsai' environment variables for Production and Preview:"
echo "  MALWARE_SCANNER_URL=$SERVICE_URL/scan"
echo "  MALWARE_SCANNER_API_KEY=<retrieve privately with the command below>"
echo
echo "Retrieve the API key locally (never paste it into chat or commit it):"
echo "  gcloud secrets versions access latest --secret=$SECRET --project=$PROJECT_ID"
echo "Add that value as an Encrypted Vercel environment variable named MALWARE_SCANNER_API_KEY."
echo "Then redeploy the Vercel Preview and Production environments. Keep upload disabled until EICAR and clean-file tests pass."
