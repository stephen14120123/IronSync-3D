#!/bin/bash
set -e

DB_HOST="${SPRING_DATASOURCE_URL#*://}"
DB_HOST="${DB_HOST%%[:\?]*}"
DB_HOST="${DB_HOST:-mysql}"

DB_PORT="${SPRING_DATASOURCE_URL#*://${DB_HOST}:}"
DB_PORT="${DB_PORT%%[^0-9]*}"
DB_PORT="${DB_PORT:-3306}"

echo "[entrypoint] Waiting for database at $DB_HOST:$DB_PORT..."
for i in $(seq 1 30); do
  if (echo > "/dev/tcp/$DB_HOST/$DB_PORT") 2>/dev/null; then
    echo "[entrypoint] Database is ready."
    break
  fi
  echo "[entrypoint] Attempt $i/30: not ready yet..."
  sleep 2
done

exec java -jar "$@"
