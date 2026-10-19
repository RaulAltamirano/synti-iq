#!/usr/bin/env sh
# Resolves the commitlint --from base ref for local validation.
# Matches CI logic: feature branches → origin/dev, hotfix branches → origin/main.
# Override: COMMITLINT_FROM=origin/main yarn validate:commits

set -e

if [ -n "$COMMITLINT_FROM" ]; then
  echo "$COMMITLINT_FROM"
  exit 0
fi

PROD="origin/main"
BASE_PROD=$(git merge-base HEAD "$PROD" 2>/dev/null || true)
BASE_DEV=$(git merge-base HEAD origin/dev 2>/dev/null || true)

if [ -z "$BASE_PROD" ] || [ -z "$BASE_DEV" ]; then
  echo "origin/dev"
  exit 0
fi

# If we branched from production, merge-base(HEAD, prod) is closer to HEAD.
if git merge-base --is-ancestor "$BASE_DEV" "$BASE_PROD" 2>/dev/null; then
  echo "$PROD"
elif git merge-base --is-ancestor "$BASE_PROD" "$BASE_DEV" 2>/dev/null; then
  echo "origin/dev"
else
  echo "origin/dev"
fi
