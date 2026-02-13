#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/opt/budget-saas"

if [ ! -d "$ROOT_DIR/.git" ]; then
  echo "Repo not found at $ROOT_DIR"
  exit 1
fi

cd "$ROOT_DIR"

git fetch origin
if git show-ref --verify --quiet refs/heads/main; then
  git checkout main
else
  git checkout -b main
fi

git reset --hard origin/main
sudo docker-compose up -d --build