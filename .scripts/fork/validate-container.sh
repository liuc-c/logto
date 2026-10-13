#!/usr/bin/env bash
set -euo pipefail
# Use only a disposable local database. No deployment credentials are accepted.
container_engine=${CONTAINER_ENGINE:-docker}
image=${1:?Usage: validate-container.sh IMAGE}
name="logto-fork-test-${RANDOM}"
root=$(cd "$(dirname "$0")/../.." && pwd)
log_dir="$root/logs/fork-container"
mkdir -p "$log_dir"
cleanup() {
  "$container_engine" logs "$name-app" > "$log_dir/app.log" 2>&1 || true
  "$container_engine" rm -f "$name-app" "$name-db" >/dev/null 2>&1 || true
  "$container_engine" network rm "$name" >/dev/null 2>&1 || true
}
trap cleanup EXIT
"$container_engine" network create "$name" >/dev/null
"$container_engine" run -d --name "$name-db" --network "$name" --network-alias postgres \
  -e POSTGRES_PASSWORD=acceptance-only -e POSTGRES_DB=logto \
  postgres:18-alpine >/dev/null
for attempt in {1..60}; do
  if "$container_engine" exec "$name-db" pg_isready -U postgres -d logto >/dev/null; then break; fi
  sleep 1
done
"$container_engine" run --rm --network "$name" \
  -e DB_URL=postgresql://postgres:acceptance-only@postgres:5432/logto \
  --entrypoint sh "$image" -c 'npm run cli -- db seed' > "$log_dir/seed.log" 2>&1
"$container_engine" exec -i "$name-db" psql -v ON_ERROR_STOP=1 -U postgres -d logto \
  < "$root/.scripts/fork/fixtures.sql" > "$log_dir/fixtures.log"
"$container_engine" run -d --name "$name-app" --network "$name" \
  -p 127.0.0.1:3301:3001 -p 127.0.0.1:3302:3002 \
  -e DB_URL=postgresql://postgres:acceptance-only@postgres:5432/logto \
  -e ENDPOINT=http://localhost:3301 -e ADMIN_ENDPOINT=http://localhost:3302 \
  -e TRUST_PROXY_HEADER=1 "$image" >/dev/null
wait_for_app() {
  for attempt in {1..90}; do
    if curl --fail --silent http://localhost:3301/oidc/.well-known/openid-configuration >/dev/null; then return; fi
    sleep 1
  done
  "$container_engine" logs "$name-app"
  return 1
}
wait_for_app
export INTEGRATION_TESTS_LOGTO_URL=http://localhost:3301
export INTEGRATION_TESTS_LOGTO_CONSOLE_URL=http://localhost:3302
pnpm --filter @logto/integration-tests test:only --runInBand --config jest.config.fork.js
"$container_engine" restart "$name-app" >/dev/null
wait_for_app
FORK_VERIFY_RESTART=1 pnpm --filter @logto/integration-tests test:only --runInBand --config jest.config.fork.js
