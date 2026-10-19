# SyntiIQ Monorepo Design

**Date:** 2026-10-19
**Status:** Approved
**Repo:** `RaulAltamirano/synti-iq` (the existing API repository)

## Goal

Develop SyntiIQ as one product from one repository and one integration branch (`dev`). The Vue app moves into that repository. The NestJS API and the Vue app stay in separate directories, with separate install, test, and build commands. The API CI stays the quality bar for the API. The web app gets one job of its own. Sonar, Discord, AI review, and Release Please stay API-only.

## Current state

Local checkouts:

```
/mnt/SSD/Projects/personal/synti-iq/api    # git repo RaulAltamirano/synti-iq
/mnt/SSD/Projects/personal/synti-iq/web    # git repo RaulAltamirano/syntiIQ
```

| Repo | Integration branch | Release branch | Tip used for this design |
| --- | --- | --- | --- |
| `synti-iq` (API) | `dev` (GitHub default) | `master` | `749764f` on both `dev` and `master` |
| `syntiIQ` (web) | none on GitHub | `master` (GitHub default) | local `master` and `dev` at `1043d0e`, one commit ahead of `origin/master` |

API workflows in `.github/workflows/`:

| Workflow | Trigger |
| --- | --- |
| `ci.yml` — CI — Quality Gate | push and pull request to `main`, `master`, `dev` |
| `pr-review.yml` — PR Review Pipeline | pull request |
| `build-docker.yml` — Docker Build | push and pull request to `main`, `master`, `dev`, and only when selected paths change |
| `release-please.yml` | push to `main` or `master` |
| `dev-commit-notify.yml` | push to `dev` |

`docs/BRANCHING_STRATEGY.md` calls the release branch `main`. The live release branch is `master`. Release Please already listens to both names. This design keeps `master` and updates the doc to match it.

The web repo has one workflow, `.github/workflows/lint.yml`, on `master` and `main`: lint, format, type-check, build, and test. `yarn quality` in the web package also builds Storybook. A pre-push hook runs `yarn quality`, and that command currently fails type-check, so `1043d0e` is not on `origin/master`.

There is no Dockerfile in the API tree. `build-docker.yml` already skips the image build when `Dockerfile` is absent.

## Decision

Use the existing `synti-iq` GitHub repository as the monorepo. Move the API project into `api/` and import the web project into `web/`. A private root `package.json` declares Yarn workspaces. Day-to-day development targets `dev`. `master` stays the release branch for the API.

Two other layouts were considered and rejected:

- Keep two repositories and share a reusable workflow. That still leaves two pull requests, two default branches, and two Husky setups.
- Copy the API quality gate, Sonar, and PR review onto the web repo. That duplicates the heavy pipeline the web app does not need.

Nx and Turborepo are out. The two apps do not share packages.

## Target layout

```
synti-iq/
├── package.json              # private, workspaces: ["api", "web"]
├── yarn.lock                 # single workspace lockfile
├── .github/workflows/        # repo-level CI
├── docs/superpowers/specs/   # this spec
├── api/                      # current NestJS tree
│   ├── package.json
│   ├── src/
│   ├── test/
│   ├── docker-compose.yaml
│   └── ...
└── web/                      # current Vue tree
    ├── package.json
    ├── src/
    └── ...
```

Root `package.json` is only the workspace declaration (`private: true`, `workspaces: ["api", "web"]`). It does not add a task runner, shared library, or extra root scripts. App commands stay the scripts already defined in each package, run from that package (`yarn --cwd api <script>` or `yarn --cwd web <script>`).

Yarn workspaces use one lockfile. `yarn install` runs at the repository root and writes `yarn.lock` there. `api/yarn.lock` and `web/yarn.lock` are removed after that root lockfile exists. CI installs once, from the root, with `yarn install --frozen-lockfile`.

## What moves

Into `api/`, from the current API repository root:

- Application and tooling: `src/`, `test/`, `scripts/`, `postman/`, `nest-cli.json`, `tsconfig*.json`, `package.json`, `sonar-project.properties`, `docker-compose.yaml`, `.eslintrc.js`, `.eslintignore`, `.prettierrc`, Postman collections, `release-please-config.json`, `.release-please-manifest.json`
- API docs that describe the NestJS app: the current `docs/` set (`BRANCHING_STRATEGY.md`, CI docs, ADRs, conventions). After the move they live at `api/docs/`
- `AGENTS.md` and `CLAUDE.md` move to `api/` because they instruct work inside the API

Stay at the repository root:

- `.github/` (workflows edited in place, not copied per app)
- This spec, at `docs/superpowers/specs/`. It does not move into `api/docs/`
- `commitlint.config.js`, so one commit message rule covers both apps
- Husky, at the root. `commit-msg` runs commitlint. `pre-commit` runs each package's lint-staged rules against the files staged in that package
- Root `package.json`, root `yarn.lock`, and a short root `README.md` that points at `api/` and `web/` and states that feature branches target `dev`

Into `web/`, from `RaulAltamirano/syntiIQ`:

- The Vue app as it exists at local commit `1043d0e`, including its `package.json`, `src/`, `tests/`, configs, and its own `AGENTS.md` / `CLAUDE.md`. Its `yarn.lock` is only an input to the root lockfile and is not kept under `web/`

Gitignored local files stay local and are never committed: `api/.env`, `api/keys/`, `node_modules/`, `dist/`.

`release-please-config.json` package path changes from `"."` to `"api"`. The manifest path changes with it. Release Please still runs only on push to `master` (and `main`, if that branch appears later).

## History

Preserve both histories in `synti-iq`.

- API history keeps its commits. The move of the API tree into `api/` is a git move on `dev`, so blame follows the files.
- Web history is imported with a directory prefix `web/` (subtree or an equivalent filter that rewrites paths). Do not squash `syntiIQ` into one commit.

The GitHub repo `RaulAltamirano/syntiIQ` stays online. This change does not delete or archive it. New feature work does not land there. Its README can later say the app lives in `synti-iq` under `web/`; that note is optional and is not required for the migration to be done.

## Branching

One integration branch: `dev`. Feature branches are cut from `dev` and merged back with a pull request, using the existing name format `<issue>-<type>-<slug>`.

`master` is the release branch. It receives the API by a pull request from `dev`. Do not rename `master` to `main` in this change. Do not develop features directly on `master`.

`api/docs/BRANCHING_STRATEGY.md` is updated so the release branch name is `master`, matching the repository and Release Please. The rest of that strategy (feature lifecycle, no force-push, pull request before merge) stays.

The web app uses the same `dev` branch. There is no second long-lived web branch.

## CI

Workflows stay in `.github/workflows/` of `synti-iq`. Dependency install is one root step (`yarn install --frozen-lockfile`). Lint, test, and build steps use `working-directory: api` or `working-directory: web`. Path filters decide which jobs run.

Always, on pull request and on push to `dev` and `master`:

- Secrets scan (gitleaks) on the whole repo
- Commitlint for the pull request title and commits (existing API commitlint config, moved to the repo root so one config covers both apps)

When `api/**`, root `package.json`, root `yarn.lock`, or `.github/workflows/**` change:

- The existing API quality gate: audit, lint, format, build, tests with coverage
- The existing PR review pipeline (Sonar, AI review, Discord), scoped at the API working directory
- Docker build path filters updated from `src/**` to `api/src/**`, plus root `yarn.lock`, `api/Dockerfile`, and `api/.dockerignore`. The missing-Dockerfile skip stays

When `web/**`, root `package.json`, root `yarn.lock`, or `.github/workflows/**` change:

- One web job, same checks as today's `lint.yml`: lint, format check, type-check, build, and test, after the root install
- This job does not run Storybook, Sonar, Discord, AI review, audit of the API, or Docker

`dev-commit-notify.yml` still listens only to `dev`.

Do not add a second copy of `quality-fast` for the web. Do not merge `ci.yml` and `pr-review.yml` in this change. That overlap already exists and is left as-is, aside from working directories and path filters.

The web job is not a required status check until `yarn type-check` passes in `web/`. Fixing the current Vue type errors is a follow-up, not part of the move. Until that follow-up, a web-only pull request may show the web job failing without blocking merge on that check. API required checks stay the ones already named for the API quality gate.

## Local workspace

After the migration, `/mnt/SSD/Projects/personal/synti-iq` is a single clone of `RaulAltamirano/synti-iq`. The nested `api/` and `web/` git repositories are replaced by directories inside that clone. Personal projects stay under `/mnt/SSD/Projects/personal/`. Nothing is placed under `work/`.

## Out of scope

- Fixing the existing Vue TypeScript errors
- Making the web job a required branch-protection check
- Deleting or archiving `RaulAltamirano/syntiIQ`
- Adding a Dockerfile
- Nx, Turborepo, or a shared UI/API package
- Rewriting `pr-review.yml` to remove its duplicated quality steps
- Renaming `master` to `main`
- Changing runtime behavior of the API or the web app
- Committing `.env` or JWT keys

## Success criteria

- `RaulAltamirano/synti-iq` contains `api/` and `web/`, and `dev` is the branch that contains that layout
- `git log --follow` on a moved API file still shows API history, and `web/` commits include the imported `syntiIQ` history
- `yarn install --frozen-lockfile` at the repo root succeeds, and `yarn --cwd api build` succeeds
- `yarn --cwd web` can list its scripts after that single install
- A pull request that only touches `web/**` does not run the API test job or Docker build
- A pull request that only touches `api/**` does not run the web job
- Secrets scan still runs for both
- Release Please config points at `api` and still triggers only from `master` / `main`
- `api/docs/BRANCHING_STRATEGY.md` names `master` as the release branch and `dev` as the integration branch for both apps
- `RaulAltamirano/syntiIQ` is unchanged on GitHub
