#!/usr/bin/env bash
# Redeploy the site after pushing to master. Run on the server as the app user:
#   /var/www/atin/app/deploy/deploy.sh
set -euo pipefail

APP_DIR="/var/www/atin/app"
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
pm2 reload atin --update-env

echo "==> Done. Recent logs:"
pm2 logs atin --lines 20 --nostream
