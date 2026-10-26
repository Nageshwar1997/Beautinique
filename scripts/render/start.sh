#!/bin/sh
# Render start of bq-live (Start Command: sh scripts/render/start.sh; backend/bundle/README.md "Render").
# node itself, with the flags of backend/bundle's start script (change both together): Render's npm 11
# cannot run scripts in this repo, npm would cost ~40-50 MB of the 512, and exec hands Render's SIGTERM
# straight to the app, so it stops gracefully.
set -eu
cd "$(dirname "$0")/../../backend/bundle"

exec node --enable-source-maps --max-old-space-size=300 --import ./dist/instrument.js dist/start.js
