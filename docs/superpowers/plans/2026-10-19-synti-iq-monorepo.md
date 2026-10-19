# SyntiIQ Monorepo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. When the user asks for SDD / Claude CLI execution, run one end-to-end `claude-by-path` implementer from the target repo instead of Cursor Task coding agents.

**Goal:** Turn `RaulAltamirano/synti-iq` into a Yarn workspaces monorepo with `api/` (NestJS) and `web/` (Vue), one `dev` branch, and path-filtered CI.

**Architecture:** Restructure the existing API git repository in place: move the NestJS tree into `api/`, import `syntiIQ` history under `web/`, add a root workspace `package.json` + single `yarn.lock`, keep `.github/` at the repo root, then relocate the local clone so `/mnt/SSD/Projects/personal/synti-iq` is the git root.

**Tech Stack:** Yarn 1 workspaces, NestJS (api), Vue 3 + Vite (web), GitHub Actions, Release Please, SonarCloud (api only)

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-19-synti-iq-monorepo-design.md` (after Task 1 this path is at the repo root; until then it lives under the current API checkout at `docs/superpowers/specs/…`)
- Integration branch: `dev`. Release branch: `master`. Do not rename `master` to `main`.
- Do not delete or archive `RaulAltamirano/syntiIQ`.
- Do not commit `api/.env`, `api/keys/`, or other secrets.
- Do not fix Vue TypeScript errors; the web CI job may fail type-check and must not be a required status check yet.
- Do not add Nx, Turborepo, a shared package, or a Dockerfile.
- Do not merge `ci.yml` and `pr-review.yml`; only update working directories, installs, path filters, and add the web job.
- Conventional Commits only (`feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `ci`, `perf`, `build`); header max 72 chars.
- Do not add narrative/ticket comments in code unless a non-obvious invariant requires it.
- Work only under `/mnt/SSD/Projects/personal/` (never `work/`).
- Preserve both git histories (API moves with `git mv`; web via `git subtree add`).

## File Structure

| Path | Responsibility |
| --- | --- |
| `package.json` (root) | `private: true`, `workspaces: ["api","web"]`, root `prepare` → husky, root `lint-staged` config |
| `yarn.lock` (root) | Single workspace lockfile |
| `lint-staged.config.cjs` (root) | Map staged `api/**` / `web/**` paths into each package’s eslint/prettier |
| `commitlint.config.js` (root) | One commitlint config for the repo |
| `.husky/commit-msg`, `.husky/pre-commit` (root) | commitlint + lint-staged; no web `pre-push` quality gate |
| `README.md` (root) | Points at `api/` and `web/`; feature branches target `dev` |
| `docs/superpowers/specs/…`, `docs/superpowers/plans/…` | Monorepo design + this plan (repo-level, not under `api/docs`) |
| `api/**` | NestJS app (current API tree) |
| `api/docs/BRANCHING_STRATEGY.md` | Release branch named `master` |
| `api/sonar-project.properties` | Sonar sources relative to `api/` |
| `api/release-please-config.json` + `api/.release-please-manifest.json` | Package path `"api"` |
| `web/**` | Vue app imported from `syntiIQ@1043d0e` |
| `.github/workflows/ci.yml` | Root install; path-filtered API quality + web job; always gitleaks + commitlint |
| `.github/workflows/pr-review.yml` | API working-directory + `api/scripts` paths; Sonar base dir `api` |
| `.github/workflows/build-docker.yml` | Paths under `api/` + root `yarn.lock` |

---

### Task 1: Branch and move the API tree under `api/`

**Files:**
- Create: `docs/superpowers/specs/` and `docs/superpowers/plans/` at the **git root** (carve-out before moving other docs)
- Move: almost all current API root files → `api/`
- Keep at root: `.git/`, `.github/`, carved-out `docs/superpowers/`

**Interfaces:**
- Consumes: current checkout at `/mnt/SSD/Projects/personal/synti-iq/api` on `dev` / `749764f`
- Produces: git root still that directory, now containing `api/src`, `api/package.json`, root `.github/`, root `docs/superpowers/`

- [ ] **Step 1: Start from a clean `dev` and create the branch**

```bash
cd /mnt/SSD/Projects/personal/synti-iq/api
git fetch origin
git checkout dev
git pull --ff-only origin dev
# Preserve uncommitted seed fixes if the stash still exists; do not commit secrets
git stash list
git checkout -b chore-monorepo-layout
```

Expected: branch `chore-monorepo-layout` based on latest `origin/dev`.

- [ ] **Step 2: Carve out monorepo docs so they do not move into `api/docs/`**

```bash
mkdir -p /tmp/synti-superpowers
# Current locations before the move:
#   docs/superpowers/specs/2026-10-19-synti-iq-monorepo-design.md
#   docs/superpowers/plans/2026-10-19-synti-iq-monorepo.md
mv docs/superpowers /tmp/synti-superpowers/superpowers
```

- [ ] **Step 3: Move the API application into `api/` with git**

```bash
mkdir -p api
# Move tracked top-level entries except .github and .git
for name in \
  AGENTS.md CLAUDE.md CHANGELOG.md CHECKLIST_FEATURES_PENDIENTES.md DEFINITION_OF_DONE.md \
  README.md commitlint.config.js nest-cli.json package.json yarn.lock \
  sonar-project.properties docker-compose.yaml \
  .editorconfig .eslintignore .eslintrc.js .prettierignore .prettierrc \
  .release-please-manifest.json release-please-config.json \
  .gitignore .husky .vscode .cursor \
  src test scripts postman docs \
  Postman-Environment.postman_environment.json Synti-IQ-API.postman_collection.json
do
  if [ -e "$name" ]; then git mv "$name" "api/$name"; fi
done
```

If `git mv` refuses an untracked path, leave it untracked and handle in Step 5 (`.env`, `keys/`, `node_modules/`, `dist/` are local-only).

- [ ] **Step 4: Restore monorepo docs at the repo root**

```bash
mkdir -p docs
mv /tmp/synti-superpowers/superpowers docs/superpowers
git add docs/superpowers
```

- [ ] **Step 5: Preserve local secrets beside the moved API (do not stage)**

```bash
# If .env / keys were at the old root:
[ -f .env ] && mv .env api/.env
[ -d keys ] && mv keys api/keys
# Confirm they are ignored
git -C . check-ignore -v api/.env api/keys/private_key_pkcs8.pem || true
```

- [ ] **Step 6: Smoke-check the move**

```bash
test -f api/package.json && test -d api/src && test -d .github/workflows
test -f docs/superpowers/specs/2026-10-19-synti-iq-monorepo-design.md
test ! -e src/main.ts
git status -sb
```

Expected: `api/src` exists; root `src/` is gone; `.github/` still at root.

- [ ] **Step 7: Commit**

```bash
git add -A
git status
git commit -m "$(cat <<'EOF'
chore: move API tree under api/ for monorepo layout

EOF
)"
```

---

### Task 2: Import web history under `web/`

**Files:**
- Create: `web/**` from local `syntiIQ` commit `1043d0e`
- Delete after import (from the monorepo tree): `web/yarn.lock` is kept only until Task 3 generates the root lockfile; `web/.github/` and `web/.husky/` must not remain as nested CI/hooks

**Interfaces:**
- Consumes: `/mnt/SSD/Projects/personal/synti-iq/web` at `1043d0ed203852d695bb864a9546f72e57652a77`
- Produces: `web/package.json`, `web/src/`, full imported history prefixed with `web/`

- [ ] **Step 1: Add the local web repo as a remote and fetch**

```bash
cd /mnt/SSD/Projects/personal/synti-iq/api
git remote add web-local /mnt/SSD/Projects/personal/synti-iq/web/.git
git fetch web-local
git cat-file -t 1043d0ed203852d695bb864a9546f72e57652a77
```

Expected: `commit`.

- [ ] **Step 2: Subtree-add web at that commit**

```bash
git subtree add --prefix=web web-local 1043d0ed203852d695bb864a9546f72e57652a77
```

Expected: `web/package.json` and `web/src/` exist; `git log --oneline -- web | head` shows multiple commits, not a single squashed dump.

- [ ] **Step 3: Remove nested web CI and husky from the monorepo tree**

```bash
git rm -rf web/.github web/.husky
# Keep web/AGENTS.md and web/CLAUDE.md
git status -sb
```

- [ ] **Step 4: Commit the cleanup**

```bash
git commit -m "$(cat <<'EOF'
chore: drop nested web CI and husky after subtree import

EOF
)"
```

- [ ] **Step 5: Verify history prefix**

```bash
git log --oneline -- web/package.json | head -5
git log --follow --oneline -- api/src/main.ts | head -5
```

Expected: web shows imported history; API file still has prior API commits via rename following.

---

### Task 3: Root Yarn workspaces, lockfile, and husky

**Files:**
- Create: `package.json`, `lint-staged.config.cjs`, `.husky/pre-commit`, `.husky/commit-msg`
- Move/keep: `commitlint.config.js` at root (copy from `api/commitlint.config.js` if it was moved; delete the API copy only if identical and unused)
- Modify: `api/package.json` (remove `"prepare": "husky"`), `web/package.json` (remove `"prepare": "husky"`)
- Delete: `api/yarn.lock`, `web/yarn.lock`, `api/.husky/` (if still present under `api/`)
- Create: root `yarn.lock` via install

**Interfaces:**
- Consumes: `api/package.json` name `synti-iq-api`, `web/package.json` name `synti-iq-web`
- Produces: root workspace install; `yarn --cwd api build` works

- [ ] **Step 1: Put commitlint back at the repo root**

```bash
# If commitlint was moved into api/:
git mv api/commitlint.config.js ./commitlint.config.js
```

Root `commitlint.config.js` must equal:

```js
/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'chore', 'docs', 'test', 'ci', 'perf', 'build'],
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [2, 'never', ['upper-case']],
    'subject-empty': [2, 'never'],
  },
};
```

- [ ] **Step 2: Write root `package.json`**

```json
{
  "name": "synti-iq",
  "private": true,
  "workspaces": [
    "api",
    "web"
  ],
  "scripts": {
    "prepare": "husky"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.8.1",
    "@commitlint/config-conventional": "^19.8.1",
    "husky": "^9.1.7",
    "lint-staged": "^16.4.0"
  },
  "engines": {
    "node": ">=20.19.0",
    "yarn": ">=1.22.0"
  }
}
```

Pin `@commitlint/*` versions to whatever `api/package.json` already uses if different from the numbers above (read `api/package.json` and copy those versions).

- [ ] **Step 3: Write root `lint-staged.config.cjs`**

```js
module.exports = {
  'api/**/*.{ts,tsx,js}': filenames => {
    const files = filenames.map(f => f.replace(/^api\//, ''));
    return [
      `yarn --cwd api eslint --fix ${files.join(' ')}`,
      `yarn --cwd api prettier --write ${files.join(' ')}`,
    ];
  },
  'api/**/*.{json,md,yml,yaml}': filenames => {
    const files = filenames.map(f => f.replace(/^api\//, ''));
    return [`yarn --cwd api prettier --write ${files.join(' ')}`];
  },
  'web/src/**/*.{ts,vue,js,mjs,cjs,json,css,md}': filenames => {
    const files = filenames.map(f => f.replace(/^web\//, ''));
    return [
      `yarn --cwd web eslint --fix ${files.join(' ')}`,
      `yarn --cwd web prettier --write ${files.join(' ')}`,
    ];
  },
};
```

- [ ] **Step 4: Write root Husky hooks**

`.husky/commit-msg`:

```sh
npx --no -- commitlint --edit "$1"
```

`.husky/pre-commit`:

```sh
yarn lint-staged
```

```bash
chmod +x .husky/commit-msg .husky/pre-commit
```

Do **not** add a `pre-push` hook (web’s old `yarn quality` gate stays out).

- [ ] **Step 5: Disable nested package husky prepares**

In `api/package.json`, remove the `"prepare": "husky"` script entry (keep `"pre-commit": "lint-staged"` only if still useful locally; optional to remove).

In `web/package.json`, remove the `"prepare": "husky"` script entry.

Remove nested hooks if present:

```bash
git rm -rf api/.husky 2>/dev/null || true
```

- [ ] **Step 6: Generate the root lockfile**

```bash
rm -f api/yarn.lock web/yarn.lock
rm -rf node_modules api/node_modules web/node_modules
yarn install
test -f yarn.lock
yarn --cwd api build
yarn --cwd web run | head
```

Expected: root `yarn.lock` exists; API build succeeds; web scripts list (type-check may still fail later — do not run `yarn --cwd web quality`).

- [ ] **Step 7: Commit**

```bash
git add package.json yarn.lock lint-staged.config.cjs commitlint.config.js .husky \
  api/package.json web/package.json
git add -u api/yarn.lock web/yarn.lock api/.husky 2>/dev/null || true
git commit -m "$(cat <<'EOF'
chore: add yarn workspaces root and shared husky hooks

EOF
)"
```

---

### Task 4: Release Please, Sonar paths, branching doc, root README

**Files:**
- Modify: `api/release-please-config.json`, `api/.release-please-manifest.json`, `api/sonar-project.properties`, `api/docs/BRANCHING_STRATEGY.md`
- Create: root `README.md`
- Modify: `.github/workflows/release-please.yml` only if it assumes config at repo root — point it at `api/release-please-config.json`

**Interfaces:**
- Consumes: previous Release Please `"packages": { ".": {} }` and manifest `"." : "0.0.1"`
- Produces: package key `"api"`; Sonar `projectBaseDir` compatible properties under `api/`

- [ ] **Step 1: Point Release Please at `api`**

`api/release-please-config.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json",
  "release-type": "node",
  "packages": {
    "api": {}
  }
}
```

`api/.release-please-manifest.json`:

```json
{
  "api": "0.0.1"
}
```

Update `.github/workflows/release-please.yml` so the action receives:

```yaml
with:
  config-file: api/release-please-config.json
  manifest-file: api/.release-please-manifest.json
```

(Keep existing `on.push.branches: [main, master]`.)

- [ ] **Step 2: Keep Sonar properties relative to `api/`**

`api/sonar-project.properties` stays:

```properties
sonar.organization=RaulAltamirano
sonar.projectKey=RaulAltamirano_synti-iq

sonar.sources=src
sonar.tests=src
sonar.javascript.lcov.reportPaths=coverage/lcov.info

sonar.exclusions=**/*.spec.ts,**/node_modules/**,**/dist/**,**/coverage/**,**/__tests__/**
```

(Paths stay `src` and `coverage` because the Sonar scan will use `projectBaseDir: api` in Task 5.)

- [ ] **Step 3: Fix branching doc release branch name**

In `api/docs/BRANCHING_STRATEGY.md`, replace the main-branch table so `master` is the production/release branch and `dev` is the integration branch. Example replacement for the “Main Branches” table:

| Branch | Purpose |
| --- | --- |
| `master` | Production-ready / release branch. Merges from `dev` or hotfix branches. |
| `dev` | Integration branch for API and web. Feature branches target `dev`. |

Also rename diagram labels that say `main` as the release branch to `master`, and change “branch from `main`” hotfix wording to `master`.

- [ ] **Step 4: Write root `README.md`**

```markdown
# SyntiIQ

Multi-channel e-commerce platform (NestJS API + Vue web) in one repository.

## Layout

- `api/` — NestJS API
- `web/` — Vue web app

## Branches

- Feature work targets \`dev\`
- \`master\` is the API release branch (Release Please)

## Local setup

\`\`\`bash
yarn install
yarn --cwd api start:dev
yarn --cwd web dev
\`\`\`

API Docker dependencies: \`docker compose -f api/docker-compose.yaml up -d\`
```

- [ ] **Step 5: Commit**

```bash
git add api/release-please-config.json api/.release-please-manifest.json \
  api/sonar-project.properties api/docs/BRANCHING_STRATEGY.md \
  README.md .github/workflows/release-please.yml
git commit -m "$(cat <<'EOF'
chore: point release please and docs at api package path

EOF
)"
```

---

### Task 5: Retarget API CI and PR review at `api/`

**Files:**
- Modify: `.github/workflows/ci.yml`, `.github/workflows/pr-review.yml`, `.github/workflows/build-docker.yml`, `.github/workflows/dev-commit-notify.yml`

**Interfaces:**
- Consumes: root `yarn.lock`; scripts under `api/scripts/`
- Produces: API jobs install at repo root, run with `working-directory: api`, coverage artifact from `api/coverage/`

- [ ] **Step 1: Update `build-docker.yml` path filters**

Replace path lists with:

```yaml
paths:
  - 'api/src/**'
  - 'api/package.json'
  - 'api/Dockerfile'
  - 'api/.dockerignore'
  - 'yarn.lock'
  - 'package.json'
```

Update the Dockerfile existence check to `[ -f api/Dockerfile ]` and pass `context: api` / `file: api/Dockerfile` if the build step is reached.

- [ ] **Step 2: Update `ci.yml` install and API commands**

For every job that currently runs `yarn install --frozen-lockfile --ignore-scripts` at the old root:

1. Cache key uses root `yarn.lock`: `hashFiles('yarn.lock')`
2. Install at repo root: `yarn install --frozen-lockfile --ignore-scripts`
3. API lint/format/build/test steps set:

```yaml
working-directory: api
```

4. Coverage upload path becomes `api/coverage/`
5. Discord / helper scripts become `node api/scripts/...` **or** `working-directory: api` with `node scripts/...` — pick one style and use it consistently (prefer `working-directory: api` + `node scripts/...`)

6. `yarn audit:high-gate` runs with `working-directory: api`

Commitlint steps stay at repo root (config is root `commitlint.config.js`) and use root `npx commitlint` after root install (commitlint is a root devDependency).

- [ ] **Step 3: Add `dorny/paths-filter` to `ci.yml`**

After checkout on a small `changes` job:

```yaml
changes:
  runs-on: ubuntu-24.04
  outputs:
    api: ${{ steps.filter.outputs.api }}
    web: ${{ steps.filter.outputs.web }}
  steps:
    - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd
    - uses: dorny/paths-filter@de90cc6fb38fc0963ad72b210f1f284cd68cea36
      id: filter
      with:
        filters: |
          api:
            - 'api/**'
            - 'package.json'
            - 'yarn.lock'
            - '.github/workflows/**'
          web:
            - 'web/**'
            - 'package.json'
            - 'yarn.lock'
            - '.github/workflows/**'
```

Gate existing API quality jobs with:

```yaml
needs: changes
if: needs.changes.outputs.api == 'true'
```

Keep a small always-on job (or the start of `quality-fast`) that runs **gitleaks** and **commitlint** regardless of path filters. If `quality-fast` is gated, split secrets+commitlint into `repo-guards` that always runs.

- [ ] **Step 4: Update `pr-review.yml` the same way**

- Root yarn install
- API steps: `working-directory: api`
- Coverage path: `api/coverage/`
- Sonar scan step: set project base directory to `api`, for example:

```yaml
- uses: SonarSource/sonarqube-scan-action@299e4b793aaa83bf2aba7c9c14bedbb485688ec4
  with:
    projectBaseDir: api
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

- Script invocations use `working-directory: api` or `api/scripts/…`
- Gate API-heavy jobs with the same paths-filter outputs (`api == true`). Always run whatever creates/resolves Discord threads only when the PR touches api, matching current product expectations (PR review stays API-oriented per spec).

- [ ] **Step 5: Update `dev-commit-notify.yml`**

```yaml
run: node api/scripts/discord-notify-dev-commit.js
```

(or `working-directory: api`).

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/ci.yml .github/workflows/pr-review.yml \
  .github/workflows/build-docker.yml .github/workflows/dev-commit-notify.yml
git commit -m "$(cat <<'EOF'
ci: retarget workflows at api workspace package

EOF
)"
```

---

### Task 6: Add the web CI job

**Files:**
- Modify: `.github/workflows/ci.yml`
- Do not copy `web/.github/workflows/lint.yml` as a second workflow file; fold it into `ci.yml`

**Interfaces:**
- Consumes: `needs.changes.outputs.web`
- Produces: job `web-quality` with lint, format, type-check, build, test

- [ ] **Step 1: Add `web-quality` job to `ci.yml`**

```yaml
  web-quality:
    needs: changes
    if: needs.changes.outputs.web == 'true'
    runs-on: ubuntu-24.04
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd

      - name: Cache node_modules
        uses: actions/cache@668228422ae6a00e4ad889ee87cd7109ec5666a7
        with:
          path: |
            node_modules
            api/node_modules
            web/node_modules
          key: ${{ runner.os }}-yarn-${{ hashFiles('yarn.lock') }}
          restore-keys: |
            ${{ runner.os }}-yarn-

      - name: Setup Node
        uses: actions/setup-node@53b83947a5a98c8d113130e565377fae1a50d02f
        with:
          node-version: '20.19'
          cache: 'yarn'

      - name: Enable Yarn
        run: corepack enable

      - name: Install dependencies
        run: yarn install --frozen-lockfile --ignore-scripts

      - name: Lint
        working-directory: web
        run: yarn lint

      - name: Check formatting
        working-directory: web
        run: yarn format:check

      - name: Type-check
        working-directory: web
        run: yarn type-check
        continue-on-error: true

      - name: Build
        working-directory: web
        run: yarn build
        continue-on-error: true

      - name: Test
        working-directory: web
        run: yarn test
        continue-on-error: true
```

Use `continue-on-error: true` on type-check/build/test **only while** Vue type errors remain, so the job is visible but not a merge blocker. Lint + format can stay hard-fail if they pass on `1043d0e`; if they fail too, mark those steps `continue-on-error: true` and note it in the PR description. Do **not** run Storybook.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "$(cat <<'EOF'
ci: add path-filtered web quality job

EOF
)"
```

---

### Task 7: Relocate the local workspace to `/mnt/SSD/Projects/personal/synti-iq`

**Files:**
- Local filesystem only (plus verify git remotes)

**Interfaces:**
- Consumes: git root currently at `/mnt/SSD/Projects/personal/synti-iq/api` containing `api/`, `web/`, `.git/`
- Produces: git root at `/mnt/SSD/Projects/personal/synti-iq`

- [ ] **Step 1: Move the monorepo git root up one directory**

```bash
cd /mnt/SSD/Projects/personal
# Keep the old nested web clone aside (history already imported)
mv synti-iq/web /tmp/synti-iq-web-checkout-backup
# Promote the git root
mkdir synti-iq-monorepo
shopt -s dotglob
mv synti-iq/api/* synti-iq-monorepo/
rmdir synti-iq/api 2>/dev/null || rm -rf synti-iq/api
rmdir synti-iq 2>/dev/null || rm -rf synti-iq
mv synti-iq-monorepo synti-iq
cd synti-iq
git status -sb
git remote -v
```

Expected: `pwd` is `/mnt/SSD/Projects/personal/synti-iq`; `git rev-parse --show-toplevel` equals that path; `api/` and `web/` are children; `origin` still `git@github.com:RaulAltamirano/synti-iq.git`.

- [ ] **Step 2: Restore local env/keys and reinstall**

```bash
# From /tmp backup or previous locations if needed
test -f api/.env || echo "restore api/.env manually before running the API"
test -d api/keys || echo "restore api/keys manually before running the API"
yarn install --frozen-lockfile
yarn --cwd api build
```

- [ ] **Step 3: Apply stash seed fixes if still relevant**

If `git stash list` still has `local seed login fixes`, pop and rewrite paths to `api/...` if needed, then either keep uncommitted or commit separately as `fix: allow seed runner entity graph` — only if you want those fixes on `dev`. They are not required by the monorepo spec.

- [ ] **Step 4: Verify success criteria locally**

```bash
test -f package.json && test -d api/src && test -d web/src
yarn install --frozen-lockfile
yarn --cwd api build
yarn --cwd web run | head
git log --follow --oneline -- api/src/main.ts | head -3
git log --oneline -- web/package.json | head -3
rg -n "working-directory: api|projectBaseDir: api|web-quality|packages" \
  .github/workflows/ci.yml .github/workflows/pr-review.yml \
  api/release-please-config.json api/docs/BRANCHING_STRATEGY.md
```

Expected: all checks aligned with the spec success criteria (except GitHub-side PR filter proof, which is Task 8).

---

### Task 8: Push branch and open PR into `dev`

**Files:** none (remote + PR)

- [ ] **Step 1: Push the feature branch**

```bash
cd /mnt/SSD/Projects/personal/synti-iq
git push -u origin HEAD
```

- [ ] **Step 2: Open the PR against `dev`**

```bash
gh pr create --base dev --title "chore: merge api and web into yarn workspaces monorepo" --body "$(cat <<'EOF'
## Summary
- Move NestJS app under `api/` and import Vue app under `web/` with history
- Add root Yarn workspaces + single lockfile
- Retarget CI/CD at `api/`, add path-filtered web job (type-check not required yet)
- Point Release Please at package `api`; keep `RaulAltamirano/syntiIQ` on GitHub

## Test plan
- [ ] `yarn install --frozen-lockfile` at repo root
- [ ] `yarn --cwd api build`
- [ ] CI: API-only path change runs API jobs, not web-quality
- [ ] CI: web-only path change runs web-quality, not API tests/Docker
- [ ] gitleaks + commitlint still run
- [ ] Confirm `syntiIQ` remote repo unchanged

EOF
)"
```

- [ ] **Step 3: Confirm remote default branch still `dev` and web repo untouched**

```bash
gh repo view RaulAltamirano/synti-iq --json defaultBranchRef --jq .defaultBranchRef.name
gh api repos/RaulAltamirano/syntiIQ --jq .default_branch
```

Expected: `dev` and `master` respectively; no delete/archive on `syntiIQ`.

---

## Self-review (plan vs spec)

| Spec requirement | Task |
| --- | --- |
| Repo host = `synti-iq`; layout `api/` + `web/` | 1, 2, 7 |
| Yarn workspaces + one root lockfile | 3 |
| Preserve API + web history | 1 (`git mv`), 2 (`subtree`) |
| Root commitlint + husky; no web pre-push gate | 3 |
| Release Please → `api` | 4 |
| Branching doc uses `master` | 4 |
| CI path filters; API working-directory; web job | 5, 6 |
| Sonar/Discord/AI stay API-oriented | 5 |
| Local path `/mnt/SSD/Projects/personal/synti-iq` | 7 |
| Do not archive `syntiIQ` | 8 |
| Vue TS fixes / required web check out of scope | 6 (`continue-on-error`) |

No TBD placeholders remain in task steps.
