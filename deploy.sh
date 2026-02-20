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
sudo docker-compose -f docker-compose.prod.yml down
sudo docker-compose -f docker-compose.prod.yml up -d --build --remove-orphans

echo "Post-deploy checks..."
echo "- App canonical URL"
curl -I -s https://lifesync.pl/finsync/ | head -n 1
echo "- Subdomain redirect"
curl -I -s https://finsync.lifesync.pl/ | grep -E "HTTP/|Location:"
echo "- API health"
curl -I -s https://lifesync.pl/api/health | head -n 1
