TITLE: [TASK] Husky v10 and commitlint base-branch fixes
LABELS: chore, documentation

---

<!-- Use English strictly for all content below. See docs/issues/README.md -->

## Overview

Fix Husky deprecation warnings for v10 compatibility and resolve the `validate:commits` script inconsistency: local validation previously hardcoded `origin/dev` as the base branch, causing incorrect validation for hotfix branches (which target `main` per the branching strategy). CI correctly uses the dynamic PR base; this task aligns local behavior with CI.

## Summary of changes (from chat session)

### 1. Husky hooks — v10 compatibility

- **Problem:** Husky v9 shows deprecation: lines `#!/usr/bin/env sh` and `. "$(dirname -- "$0")/_/husky.sh"` will fail in v10.
- **Change:** Removed both lines from `.husky/pre-commit` and `.husky/commit-msg`.
- **Files:** `.husky/pre-commit`, `.husky/commit-msg`

### 2. Dynamic commitlint base branch

- **Problem:** `validate:commits` hardcoded `--from origin/dev`. Hotfix branches (branch from `main`, target `main`) would validate against the wrong base, creating inconsistency with CI which uses `origin/${{ github.event.pull_request.base.ref }}`.
- **Change:**
  - Added `scripts/commitlint-from-base.sh` — infers base from merge-base: feature branches → `origin/dev`, hotfix branches → `origin/main`.
  - Updated `package.json`: `"validate:commits": "commitlint --from $(sh scripts/commitlint-from-base.sh) --to HEAD"`
  - Supports `COMMITLINT_FROM` env override: `COMMITLINT_FROM=origin/main yarn validate:commits`
- **Files:** `scripts/commitlint-from-base.sh`, `package.json`
- **Note:** Production branch is `origin/main` only (no `master` fallback).

### 3. Documentation

- `docs/DEVELOPMENT_WORKFLOW.md` — Added note for local validation and `COMMITLINT_FROM` override under the Commits section.

## Steps (if reopening or auditing)

1. Verify `.husky/pre-commit` and `.husky/commit-msg` contain only the command (no shebang or husky.sh source).
2. Run `yarn validate:commits` on a feature branch — should resolve `origin/dev`.
3. Run `COMMITLINT_FROM=origin/main yarn validate:commits` — should validate against `origin/main`.
4. Confirm docs/DEVELOPMENT_WORKFLOW.md documents the override.

## Acceptance criteria

- [ ] Husky hooks are v10-ready (no deprecated lines in pre-commit, commit-msg).
- [ ] `validate:commits` uses dynamic base inferred from merge-base (feature → dev, hotfix → main).
- [ ] `COMMITLINT_FROM` override allows explicit base for hotfix validation.
- [ ] `scripts/commitlint-from-base.sh` exists and returns `origin/dev` or `origin/main`.
- [ ] docs/DEVELOPMENT_WORKFLOW.md documents local validation and override.
- [ ] CI and local validation use consistent logic (dynamic base by branch type).

## Technical context

- **Affected files:** `.husky/pre-commit`, `.husky/commit-msg`, `scripts/commitlint-from-base.sh`, `package.json`, `docs/DEVELOPMENT_WORKFLOW.md`
- **Dependencies:** Husky v9+, commitlint, Git (merge-base)
- **References:** [docs/BRANCHING_STRATEGY.md](../BRANCHING_STRATEGY.md) — Hotfix branches target `main`; [.github/workflows/ci.yml](../../.github/workflows/ci.yml) — commitlint uses `origin/${{ github.event.pull_request.base.ref }}`

## Out of scope

- Migration to Husky v10 (when released).
- Supporting `origin/master` in commitlint (explicitly main-only per request).

## Resources

- [docs/DEVELOPMENT_WORKFLOW.md](../DEVELOPMENT_WORKFLOW.md)
- [docs/BRANCHING_STRATEGY.md](../BRANCHING_STRATEGY.md)
- [commitlint — linking PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
