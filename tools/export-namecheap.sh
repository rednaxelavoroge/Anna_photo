#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p .export-stash
restore() {
  if [ -d .export-stash/admin ]; then mv .export-stash/admin src/app/admin; fi
  if [ -d .export-stash/api ]; then mv .export-stash/api src/app/api; fi
}
trap restore EXIT
mv src/app/admin src/app/api .export-stash
export NAMECHEAP_EXPORT=1
npx next build
rm -f annamanasaryan-com.zip
(cd out && zip -r ../annamanasaryan-com.zip .)
