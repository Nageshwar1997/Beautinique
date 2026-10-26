#!/bin/sh
# Render build of bq-live (Build Command: sh scripts/render/build.sh; backend/bundle/README.md "Render").
# Render's npm 11 refuses this repo (the root devEngines asks for npm 12: EBADDEVENGINES) and its global
# npm folder is read-only (EROFS), so npm 12 goes into .npm12 inside the checkout and does the rest.
set -eu
cd "$(dirname "$0")/../.."

npm install --prefix .npm12 --no-audit --no-fund npm@12.2.0
.npm12/node_modules/.bin/npm ci
.npm12/node_modules/.bin/npm run build -- --for bundle
