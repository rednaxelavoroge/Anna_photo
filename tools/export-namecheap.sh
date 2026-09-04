#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p .export-stash
restore() {
  if [ -d .export-stash/admin ]; then mv .export-stash/admin src/app/admin; fi
  if [ -d .export-stash/api ]; then mv .export-stash/api src/app/api; fi
  if [ -f .export-stash/middleware.ts ]; then mv .export-stash/middleware.ts src/middleware.ts; fi
}
trap restore EXIT
mv src/app/admin src/app/api .export-stash
if [ -f src/middleware.ts ]; then mv src/middleware.ts .export-stash/; fi
export NAMECHEAP_EXPORT=1
npx next build
rm -f annamanasaryan-com.zip
(cd out && zip -r ../annamanasaryan-com.zip .)
