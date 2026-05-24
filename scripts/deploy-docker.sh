#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.example and fill in values."
  exit 1
fi

docker compose pull 2>/dev/null || true
docker compose build --pull
docker compose up -d

echo "Waiting for API health check..."
for i in {1..30}; do
  if curl -fsS http://127.0.0.1:5000/api/health >/dev/null 2>&1; then
    echo "API is up."
    docker compose ps
    exit 0
  fi
  sleep 2
done

echo "API did not become healthy in time. Logs:"
docker compose logs --tail=80 api
exit 1
