#!/usr/bin/env bash
# Redeploy the site after pushing to master. Run it from wherever the repo is checked out:
#   ./deploy/deploy.sh            (PM2 app name defaults to "atin"; override with PM2_APP=name)
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PM2_APP="${PM2_APP:-atin}"
cd "$APP_DIR"

echo "==> Pulling master"
git pull --ff-only

echo "==> Installing dependencies"
# Not --omit=dev: the build needs typescript and tsx (the prebuild copy-compliance check).
npm ci

echo "==> Applying database migrations"
npm run db:migrate

echo "==> Building"
npm run build

echo "==> Reloading PM2 (zero downtime)"
pm2 reload "$PM2_APP" --update-env

echo "==> Done. Recent logs:"
pm2 logs "$PM2_APP" --lines 20 --nostream
