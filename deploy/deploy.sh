#!/usr/bin/env bash
# Redeploy the site from master. Run from wherever the repo is checked out — by hand or by the
# GitHub Actions workflow in .github/workflows/deploy.yml after every push:
#   ./deploy/deploy.sh            (PM2 app name defaults to "atin"; override with PM2_APP=name)
# Steps: pull → install deps if the lock file changed → migrate → sync bundled images and approved
# publications → build → zero-downtime PM2 reload. A full catalogue re-import (--replace) stays manual.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PM2_APP="${PM2_APP:-atin}"
cd "$APP_DIR"

echo "==> Pulling master"
before="$(git rev-parse HEAD)"
git pull --ff-only
after="$(git rev-parse HEAD)"
echo "    $before -> $after"

if [ ! -d node_modules ] || ! git diff --quiet "$before" "$after" -- package-lock.json; then
  echo "==> Installing dependencies (lock file changed)"
  # Not --omit=dev: the build needs typescript and tsx (the prebuild copy-compliance check).
  npm ci
else
  echo "==> Dependencies unchanged, skipping install"
fi

echo "==> Applying database migrations"
npm run db:migrate

echo "==> Syncing catalogue images and approved publications"
npm run db:seed -- --images-only
npm run db:seed -- --publish-approved

echo "==> Building"
npm run build

echo "==> Reloading PM2 (zero downtime)"
pm2 reload "$PM2_APP" --update-env

echo "==> Done. Recent logs:"
pm2 logs "$PM2_APP" --lines 10 --nostream
