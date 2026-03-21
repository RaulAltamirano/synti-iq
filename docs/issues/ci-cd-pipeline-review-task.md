TITLE: chore(ci): review and document CI/CD pipeline changes
LABELS: documentation, chore

---

<!-- Use English strictly for all content below. See docs/issues/README.md -->

## Overview

Consolidate documentation of all CI/CD pipeline changes (workflows, scripts, Discord integrations, GitHub App for issues) and verify the setup is correct. This task serves as a reference for developers and AI agents working on pipeline maintenance or troubleshooting.

## Summary of CI/CD Changes (Review)

### Workflows

| Workflow                | Purpose                                               | Triggers                                                      |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------------- |
| `ci.yml`                | Quality gate: audit, lint, format, build, test:cov    | PR/push to main, master, dev (paths-ignore: docs, .md)        |
| `pr-review.yml`         | SonarCloud, AI review (Gemini), Discord notifications | PR opened/sync/closed (paths-ignore: docs, .md)               |
| `build-docker.yml`      | Build Docker image (Dockerfile present)               | PR/push when src/, Dockerfile, package.json, yarn.lock change |
| `dev-commit-notify.yml` | Discord notification on push to dev                   | Push to dev branch                                            |

### Key CI Improvements (per docs/CI_CD_AUDIT_BEFORE_AFTER.md)

- **Audit in pr-review**: `yarn audit --level high` added to pr-review (was only in ci.yml)
- **Parallel jobs**: ci.yml and pr-review.yml run `quality-fast` (audit, lint, format) and `quality-build` (build, test:cov) in parallel
- **Full test suite**: `yarn test:cov` now includes `jest --config scripts/jest.config.js` (scripts tests)
- **Coverage fallback**: `coverage-comment` job in ci.yml posts coverage on fork PRs when pr-review does not run
- **Branch protection**: Documented in docs/PR_REVIEW_PIPELINE.md — require CI + PR Review for main, master, dev

### Scripts

| Script                         | Purpose                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `create-github-issue.js`       | Create GitHub issues from drafts; supports GitHub App (GH_APP_ID, GH_INSTALLATION_ID, GH_APP_PRIVATE_KEY) or gh CLI |
| `pr-review.js`                 | AI review via Gemini; posts comment on PR                                                                           |
| `discord-notify.js`            | PR closed (merge/reject) embed                                                                                      |
| `discord-notify-new-pr.js`     | New/updated PR notification                                                                                         |
| `discord-notify-commit.js`     | Commit + comments on PR synchronize                                                                                 |
| `discord-notify-dev-commit.js` | Direct push to dev notification                                                                                     |
| `discord-notify-ci-passed.js`  | CI success notification                                                                                             |
| `discord-notify-ci-failed.js`  | CI failure notification                                                                                             |
| `generate-close-roast.js`      | Roast on PR close via Gemini                                                                                        |

### Removed

- `issue-notify.yml` — deleted (no longer used)
- `discord-notify-new-issue.js` — deleted

### Required Secrets (GitHub Actions)

| Secret                                                  | Used By                                               |
| ------------------------------------------------------- | ----------------------------------------------------- |
| `SONAR_TOKEN`                                           | pr-review (SonarCloud)                                |
| `GEMINI_API_KEY`                                        | pr-review (AI review, roast)                          |
| `DISCORD_WEBHOOK`                                       | ci, pr-review, dev-commit-notify                      |
| `GH_APP_ID`, `GH_INSTALLATION_ID`, `GH_APP_PRIVATE_KEY` | Optional: for `yarn issue:create` in CI (local: .env) |

### Documentation

- `docs/CI_CD_AUDIT_BEFORE_AFTER.md` — Before/after score, gaps addressed
- `docs/PR_REVIEW_PIPELINE.md` — Flow, branch protection, secrets, troubleshooting
- `docs/SONAR_QUALITY_GATE.md` — SonarCloud issues, Quality Gate, local scan
- `docs/issues/README.md` — Issue creation flow, GitHub App bot
- `.env.example` — CI/CD and GitHub App variables

## Steps

1. Verify all workflows run successfully on a test PR (main, master, dev)
2. Confirm required secrets are documented in .env.example and PR_REVIEW_PIPELINE.md
3. Ensure branch protection rules reference both CI — Quality Gate and PR Review Pipeline
4. Update docs/DEVELOPMENT_WORKFLOW.md if CI/CD flow has changed (issue → branch → PR → merge)
5. Add ADR or update existing ADR if pipeline architecture decisions should be recorded

## Acceptance criteria

- [ ] All four workflows (ci, pr-review, build-docker, dev-commit-notify) are documented with purpose and triggers
- [ ] Required secrets (SONAR_TOKEN, GEMINI_API_KEY, DISCORD_WEBHOOK) are listed in docs/PR_REVIEW_PIPELINE.md and .env.example
- [ ] GitHub App variables (GH_APP_ID, GH_INSTALLATION_ID, GH_APP_PRIVATE_KEY) documented for local and CI use
- [ ] Branch protection recommendations (require both CI and PR Review) are clear in docs
- [ ] docs/CI_CD_AUDIT_BEFORE_AFTER.md reflects current state; score and gaps are accurate
- [ ] No orphan references to deleted workflows (issue-notify) in docs or scripts

## Technical context

- **Affected files:** `.github/workflows/*.yml`, `scripts/discord-*.js`, `scripts/create-github-issue.js`, `scripts/pr-review.js`, `docs/PR_REVIEW_PIPELINE.md`, `docs/CI_CD_AUDIT_BEFORE_AFTER.md`, `.env.example`
- **Dependencies:** Node 20.19, Yarn, SonarCloud, Gemini API, Discord webhooks
- **Constraints:** Fork PRs do not receive secrets — Discord/AI/Sonar jobs skip; coverage-comment provides fallback for fork PRs

## Out of scope

- Adding new workflows or integrations
- Changing SonarCloud Quality Gate rules
- Modifying Discord embed format (unless broken)

## Resources

- [docs/PR_REVIEW_PIPELINE.md](../PR_REVIEW_PIPELINE.md)
- [docs/CI_CD_AUDIT_BEFORE_AFTER.md](../CI_CD_AUDIT_BEFORE_AFTER.md)
- [docs/SONAR_QUALITY_GATE.md](../SONAR_QUALITY_GATE.md)
- [docs/issues/README.md](./README.md)
- [AGENTS.md](../../AGENTS.md)
