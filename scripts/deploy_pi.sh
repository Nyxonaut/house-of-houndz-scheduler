#!/usr/bin/env bash
set -euo pipefail

# Deploy the House of Houndz stack on Raspberry Pi using Docker Compose.

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_DIR"

docker compose build
docker compose up -d

echo "Deployment triggered. Check docker compose logs for status."

