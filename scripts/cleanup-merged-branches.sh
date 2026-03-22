#!/usr/bin/env bash
# cleanup-merged-branches.sh
# Deletes all branches (local and remote) that have been merged into main.
# Usage: ./scripts/cleanup-merged-branches.sh [--dry-run]
#
# Pass --dry-run to preview what would be deleted without actually deleting.

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "=== DRY RUN mode – no branches will be deleted ==="
fi

DEFAULT_BRANCH="main"

echo ""
echo "Fetching latest refs from origin …"
git fetch --all --prune

echo ""
echo "=== Remote branches merged into $DEFAULT_BRANCH ==="
REMOTE_MERGED=$(git branch -r --merged "origin/$DEFAULT_BRANCH" \
  | grep -v "origin/$DEFAULT_BRANCH" \
  | grep -v "origin/$(git symbolic-ref --short HEAD 2>/dev/null || echo '')" \
  | sed 's|origin/||' \
  | tr -d ' ' || true)

if [[ -z "$REMOTE_MERGED" ]]; then
  echo "  (none)"
else
  echo "$REMOTE_MERGED" | while IFS= read -r branch; do
    echo "  $branch"
    if [[ "$DRY_RUN" == false ]]; then
      git push origin --delete "$branch" 2>&1 && echo "    → deleted on remote" || echo "    → failed to delete on remote (see error above)"
    fi
  done
fi

echo ""
echo "=== Local branches merged into $DEFAULT_BRANCH ==="
# Use the remote tracking ref as the merge base when the local branch doesn't exist.
MERGE_BASE_REF="$DEFAULT_BRANCH"
if ! git rev-parse --verify "$DEFAULT_BRANCH" &>/dev/null; then
  MERGE_BASE_REF="origin/$DEFAULT_BRANCH"
fi

LOCAL_MERGED=$(git branch --merged "$MERGE_BASE_REF" \
  | grep -v "^\*" \
  | grep -v "^  $DEFAULT_BRANCH$" \
  | tr -d ' ' || true)

if [[ -z "$LOCAL_MERGED" ]]; then
  echo "  (none)"
else
  echo "$LOCAL_MERGED" | while IFS= read -r branch; do
    echo "  $branch"
    if [[ "$DRY_RUN" == false ]]; then
      git branch -d "$branch" 2>&1 && echo "    → deleted locally" || echo "    → failed to delete locally (see error above)"
    fi
  done
fi

echo ""
echo "Done."
