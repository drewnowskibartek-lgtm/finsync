#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/opt/budget-saas"

if [ ! -d "$ROOT_DIR/.git" ]; then
  echo "Repo not found at $ROOT_DIR"
  exit 1
fi

cd "$ROOT_DIR"
git pull
sudo docker-compose up -d --build
