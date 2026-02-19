#!/bin/bash
# auto-commit.sh — auto-commits changes to memory/ directory (async)

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0

# Only commit if there are changes in memory/
if ! git diff --quiet memory/ 2>/dev/null || git ls-files --others --exclude-standard memory/ | grep -q .; then
  git add memory/ 2>/dev/null && git commit -m "memory: auto-save session changes" --no-gpg-sign 2>/dev/null || true
fi
