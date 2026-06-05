#!/usr/bin/env bash
# OBS-T13 — metricas de negocio do certificate-service (SPEC secao 6).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

CONTAINER="${METRICS_VERIFY_CONTAINER:-coast-academy-certificate}"
CURL_IMAGE="${CURL_IMAGE:-curlimages/curl:8.11.1}"
PROM_URL="${PROM_URL:-http://localhost:9090}"

curl_in_container() {
  local url="$1"
  docker run --rm --network "container:${CONTAINER}" "$CURL_IMAGE" \
    -sf --max-time 10 "$url" 2>/dev/null
}

metric_value() {
  local query="$1"
  curl --max-time 10 -sf "${PROM_URL}/api/v1/query" \
    --data-urlencode "query=${query}" 2>/dev/null \
    | grep -oE '"value":\[[^]]*,"[^"]*"\]' \
    | sed -n 's/.*,"\([^"]*\)".*/\1/p' \
    | head -1 || echo ""
}

echo "==> prereqs"
docker ps --format '{{.Names}}' | grep -qx "$CONTAINER" || {
  echo "ERRO: ${CONTAINER} nao esta rodando"
  exit 1
}
echo "  OK  ${CONTAINER}"

echo ""
echo "==> /metrics expoe metricas de negocio (OBS-T13)"
metrics=$(curl_in_container "http://127.0.0.1:3000/metrics" || echo "")
for name in certificate_issued_total certificate_pdf_upload_failures_total certificate_pdf_generation_seconds; do
  if echo "$metrics" | grep -q "# TYPE ${name}"; then
    echo "  OK  TYPE ${name}"
  else
    echo "ERRO: metrica ${name} ausente — rebuild certificate-service:"
    echo "  ./infra/scripts/coast-academy-compose.sh build certificate-service"
    echo "  ./infra/scripts/coast-academy-compose.sh up -d --force-recreate certificate-service"
    exit 1
  fi
done

echo ""
echo "==> Prometheus scrape certificate-service"
issued_before=$(metric_value 'certificate_issued_total{service="certificate-service"}')
pdf_gen_before=$(metric_value 'certificate_pdf_generation_seconds_count{service="certificate-service"}')
echo "  certificate_issued_total=${issued_before:-0}"
echo "  certificate_pdf_generation_seconds_count=${pdf_gen_before:-0}"

echo ""
echo "==> dispara geracao PDF (preview-pdf)"
if [[ -n "${AUTH_TOKEN:-}" ]]; then
  code=$(curl --max-time 60 -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    http://localhost/api/certificates/preview-pdf || echo "000")
  echo "  GET /api/certificates/preview-pdf -> HTTP ${code}"
  if [[ "$code" != "200" ]]; then
    echo "ERRO: preview-pdf falhou (esperado 200 com AUTH_TOKEN valido)"
    exit 1
  fi
  sleep 5
  pdf_gen_after=$(metric_value 'certificate_pdf_generation_seconds_count{service="certificate-service"}')
  echo "  certificate_pdf_generation_seconds_count=${pdf_gen_after:-0}"
  if [[ -n "$pdf_gen_after" && -n "$pdf_gen_before" ]] && awk "BEGIN {exit !($pdf_gen_after > $pdf_gen_before)}"; then
    echo "  OK  histogram de geracao PDF incrementou"
  elif [[ -z "$pdf_gen_before" && -n "$pdf_gen_after" ]] && awk "BEGIN {exit !($pdf_gen_after > 0)}"; then
    echo "  OK  histogram de geracao PDF com observacoes"
  else
    echo "ERRO: certificate_pdf_generation_seconds_count nao incrementou"
    exit 1
  fi
else
  echo "  AVISO: AUTH_TOKEN=<jwt> para validar geracao PDF via preview-pdf"
fi

echo ""
echo "==> emissao de certificado (opcional)"
if [[ -n "${AUTH_TOKEN:-}" && -n "${CERT_VERIFY_ATTEMPT_ID:-}" ]]; then
  issued_before_issue="$issued_before"
  code=$(curl --max-time 60 -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"attemptId\":\"${CERT_VERIFY_ATTEMPT_ID}\"}" \
    http://localhost/api/certificates/issue || echo "000")
  echo "  POST /api/certificates/issue -> HTTP ${code}"
  sleep 5
  issued_after=$(metric_value 'certificate_issued_total{service="certificate-service"}')
  echo "  certificate_issued_total=${issued_after:-0}"
  if [[ "$code" == "201" || "$code" == "200" ]]; then
    if [[ -n "$issued_after" && -n "$issued_before_issue" ]] \
      && awk "BEGIN {exit !($issued_after > $issued_before_issue)}"; then
      echo "  OK  certificate_issued_total incrementou"
    else
      echo "ERRO: emissao OK mas certificate_issued_total nao incrementou"
      exit 1
    fi
  elif [[ "$code" == "400" ]]; then
    echo "  AVISO: attempt ja tinha certificado — counter pode nao subir (idempotente)"
  else
    echo "  AVISO: issue retornou HTTP ${code} — confira attempt Prova Final aprovado"
  fi
elif [[ -z "${AUTH_TOKEN:-}" ]]; then
  echo "  AVISO: AUTH_TOKEN + CERT_VERIFY_ATTEMPT_ID para validar certificate_issued_total"
elif [[ -z "${CERT_VERIFY_ATTEMPT_ID:-}" ]]; then
  echo "  AVISO: CERT_VERIFY_ATTEMPT_ID=<uuid> para validar certificate_issued_total"
fi

echo ""
echo "OK: OBS-T13 — metricas de certificado expostas"
echo "  Grafana -> Coast Academy Overview -> Certificados (negocio)"
echo "  Prometheus: certificate_issued_total, certificate_pdf_upload_failures_total, certificate_pdf_generation_seconds"
