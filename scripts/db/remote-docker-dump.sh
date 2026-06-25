#!/usr/bin/env bash
# Выполняется на VPS. Не использует ssh heredoc — пароль только из .env через node.
set -euo pipefail

CONTAINER="${1:?container}"
ENV_FILE="${2:?env file}"
DB_NAME="${3:?db name}"
HOST_DUMP="${4:?host dump path}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TOOLS="${SCRIPT_DIR}/docker-mongo-tools.mjs"
CONTAINER_DUMP="/tmp/db-sync-dump-$(basename "${HOST_DUMP}")"

if [[ ! -f "${TOOLS}" ]]; then
  echo "Нет ${TOOLS}" >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -Fxq "${CONTAINER}"; then
  echo "Контейнер не запущен: ${CONTAINER}" >&2
  exit 1
fi

docker exec "${CONTAINER}" rm -rf "${CONTAINER_DUMP}"

node "${TOOLS}" dump \
  -c "${CONTAINER}" \
  -e "${ENV_FILE}" \
  -d "${DB_NAME}" \
  -o "${CONTAINER_DUMP}"

rm -rf "${HOST_DUMP}"
docker cp "${CONTAINER}:${CONTAINER_DUMP}/${DB_NAME}" "${HOST_DUMP}"
docker exec "${CONTAINER}" rm -rf "${CONTAINER_DUMP}"
