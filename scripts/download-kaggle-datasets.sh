#!/usr/bin/env bash
# Downloads Kaggle datasets used for coffee_profiles seeding (see data/raw/kaggle/README.md).
# Prerequisites: pip install kaggle, ~/.kaggle/kaggle.json with API token.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/data/raw/kaggle/coffee-reviews"

if ! command -v kaggle >/dev/null 2>&1; then
  echo "kaggle CLI not found. Install with: pip install kaggle" >&2
  echo "Then place API credentials at ~/.kaggle/kaggle.json" >&2
  exit 1
fi

mkdir -p "$OUT"

echo "Downloading xinowo/coffee-reviews-feb-1997-mar-2025 ..."
kaggle datasets download -d xinowo/coffee-reviews-feb-1997-mar-2025 -p "$OUT" --unzip

echo "Done. Files: $OUT"
