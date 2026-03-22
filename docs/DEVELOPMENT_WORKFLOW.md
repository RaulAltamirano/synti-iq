# Development Workflow — Issue to Merge

End-to-end professional workflow from creating an issue to merging a pull request. Follow these steps to ensure quality, consistency, and traceability.

**References:** [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow), [AGENTS.md](../AGENTS.md), [DEFINITION_OF_DONE.md](../DEFINITION_OF_DONE.md)

---

## Overview

```
Issue → Branch → Implement → Pre-PR Check → PR → CI + Review → Merge
```

| Phase            | Action                                     | Doc / Tool                                                                   |
| ---------------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| 1. Create Issue  | Define requirement with AI or template     | [docs/prompts/new-issue.md](prompts/new-issue.md)                            |
| 2. Create Branch | Branch from `dev` or `main`, link to issue | [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow) |
| 3. Implement     | Code following conventions                 | [AGENTS.md](../AGENTS.md), [CONVENTIONS.md](CONVENTIONS.md)                  |
| 4. Pre-PR Check  | Run quality gates before opening PR        | [pre-pr-review.md](prompts/pre-pr-review.md)                                 |
| 5. Open PR       | Fill template, link issue, request review  | [pull_request_template.md](../.github/pull_request_template.md)              |
| 6. CI & Review   | CI, SonarCloud, AI review, human approval  | [PR_REVIEW_PIPELINE.md](PR_REVIEW_PIPELINE.md)                               |
| 7. Merge         | Rebase/merge, delete branch                | Branch protection rules                                                      |

---

## Phase 1: Create Issue

### Quick Start (3 steps)

1. **Define** — Use [docs/prompts/new-issue.md](prompts/new-issue.md); replace `<TASK_DESCRIPTION>` with your requirement.
2. **Generate** — Paste into Gemini, ChatGPT, Claude, or Cursor; copy the output.
3. **Create** — Save to `docs/issues/<name>.md`, then run: `yarn issue:create docs/issues/<name>.md`

Full details: [docs/issues/README.md](issues/README.md)

### Option A — AI-assisted (recommended)

1. Use a prompt:
   - **Generic:** [docs/prompts/new-issue.md](prompts/new-issue.md) — replace `<TASK_DESCRIPTION>` with your requirement.
   - **Task-specific:** [docs/prompts/requirement-canonical.md](prompts/requirement-canonical.md) — copy, paste into AI, customize.
2. Paste into Gemini, ChatGPT, Claude, or Cursor and get the output.
3. Save to `docs/issues/<descriptive-name>.md` (e.g. `docs/issues/store-stats-endpoint.md`).
4. Create the issue:
   ```bash
   yarn issue:create docs/issues/store-stats-endpoint.md
   # or without args (uses docs/issues/draft.md):
   yarn issue:create
   ```

### Option B — Manual

1. Create an issue on GitHub.
2. Use a conventional title: `feat(scope): imperative description` (max 72 chars).
3. Include: Purpose, Scope (in/out), Technical context, Acceptance criteria.

If creating directly on GitHub, follow [docs/issues/TEMPLATES.md](issues/TEMPLATES.md) and Draft Quality Standards in [docs/issues/README.md](issues/README.md).

### Issue creation script (`yarn issue:create`)

The script reads a draft file and creates the issue via GitHub CLI. Features:

| Feature                | Description                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| **Draft folder**       | Store drafts in `docs/issues/` — see [docs/issues/README.md](issues/README.md)                    |
| **Format**             | Inline `TITLE:`/`LABELS:` or YAML frontmatter; `---`, then body in markdown                       |
| **Auto-label**         | If `LABELS` omitted, infers from title: `docs`→documentation, `feat`→enhancement, `fix`→bug, etc. |
| **Auto-create labels** | Creates missing labels before adding to the issue                                                 |
| **Bot / other user**   | `GH_TOKEN=ghp_xxx yarn issue:create docs/issues/<file>.md`                                        |
| **Assignee**           | Add `ASSIGNEE: username` in the draft to assign the issue                                         |
| **Template**           | If file missing and name matches `draft*.md`, copies from `docs/issues/draft-template.md`         |
| **Default path**       | No args: uses `docs/issues/draft.md`; creates from template if missing                            |

**Script:** [scripts/create-github-issue.js](../scripts/create-github-issue.js). **Prompt format:** [docs/prompts/new-issue.md](prompts/new-issue.md).

### Requirements

- **GitHub CLI** installed and authenticated: `gh auth login`
- Title format: `type(scope): description` — produces slug-friendly branch names (e.g. `42-feat-store-add-stats-endpoint`)

---

## Phase 2: Create Branch

### Branch naming

- From issue **#42**: `42-feat-store-add-stats-endpoint` or `42-add-store-stats`
- Short, descriptive, kebab-case.
- Prefix with issue number for traceability (used by PR Review Pipeline for linking).

### Steps

```bash
git fetch origin
git checkout dev   # or main
git pull origin dev
git checkout -b 42-feat-store-add-stats-endpoint
```

**Reference:** [GitHub Flow — Create a branch](https://docs.github.com/en/get-started/quickstart/github-flow#create-a-branch)

---

## Phase 3: Implement

### Before coding

- Read [AGENTS.md](../AGENTS.md) — codebase awareness, canonical contracts.
- New module? Read [src/\_template/](../src/_template/) and [docs/prompts/new-module.md](prompts/new-module.md).
- Complex feature? Draft a plan with [PLAN_TEMPLATE.md](PLAN_TEMPLATE.md).

### While coding

- Follow [CONVENTIONS.md](CONVENTIONS.md) — DTOs, REST, Swagger, file naming.
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`.
- Architectural change? Create an ADR: [docs/adr/000-index.md](adr/000-index.md), [prompts/new-adr.md](prompts/new-adr.md).

### Commits

```bash
git add .
git commit -m "feat(store): add getStats service method"
# or
git commit -m "fix(auth): resolve token refresh race condition"
```

**Reference:** [Conventional Commits](https://www.conventionalcommits.org/)

---

## Phase 4: Pre-PR Check

Before opening the PR, verify readiness:

### 1. Run quality gates

```bash
yarn quality
```

Runs: `build` → `lint` → `test` → `format:check`. All must pass.

### 2. Definition of Done

Go through [DEFINITION_OF_DONE.md](../DEFINITION_OF_DONE.md):

- [ ] Code Quality (no any, return types, no console)
- [ ] Architecture (no logic in controllers, repo layer)
- [ ] Testing (unit tests, mocks, edge cases)
- [ ] API & Documentation (Swagger, DTOs, class-validator)
- [ ] Git & Process (conventional commits, PR template, no TODO)
- [ ] AI-Assisted Work (if used: reviewed, quality passes)

### 3. Optional — Pre-PR verification prompt

Use [docs/prompts/pre-pr-review.md](prompts/pre-pr-review.md) for a structured checklist with an AI agent.

---

## Phase 5: Open Pull Request

### 1. Push branch

```bash
git push origin 42-feat-store-add-stats-endpoint
```

### 2. Create PR on GitHub

- **Base:** `dev` or `main` (per team convention).
- **Title:** Match commit style: `feat(store): add GET /stores/:id/stats endpoint`.
- **Link issue:** Use `Closes #42` or `Fixes #42` in the body so the issue auto-closes on merge.

### 3. Fill PR template

Complete all sections in [.github/pull_request_template.md](../.github/pull_request_template.md):

- **What & Why** — Problem or feature.
- **Changes Summary** — Bullet list.
- **Type of Change** — feat/fix/refactor/test/chore.
- **Definition of Done** — Check all items.
- **AI Assistance Disclosure** — If AI was used.
- **Breaking Changes** — Or "None".
- **Testing Instructions** — How to verify locally.

**Reference:** [Linking a pull request to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)

---

## Phase 6: CI & Review

### Automated pipeline

On PR open/update, workflows run:

| Step         | Workflow        | Actions                            |
| ------------ | --------------- | ---------------------------------- |
| Quality Gate | `ci.yml`        | lint, format:check, build, test    |
| SonarCloud   | `pr-review.yml` | Coverage scan, Quality Gate        |
| AI Review    | `pr-review.yml` | 8-category review (code-review.md) |
| Discord      | `pr-review.yml` | Notification to team channel       |

**Detail:** [PR_REVIEW_PIPELINE.md](PR_REVIEW_PIPELINE.md)

### Branch protection (recommended)

Configure in **Settings → Branches → Branch protection rules**:

- **Require pull request before merging** — At least 1 approval.
- **Require status checks to pass** — `quality` (from ci.yml); optionally `sonar`.
- **Require branches to be up to date** — Reduces risk of untested code after rebase.
- **Do not allow bypassing** — Ensures consistent enforcement.

**Reference:** [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

### Address review feedback

- Respond to AI and human comments.
- Push new commits; PR updates automatically.
- CI re-runs on each push.

---

## Phase 7: Merge

### Merge strategies

- **Squash and merge** — Single commit on target. Clean history.
- **Rebase and merge** — Preserves commits. **Note:** Enable "Require branches to be up to date" so CI re-runs after rebase.
- **Create a merge commit** — Preserves full history.

**Reference:** [Merging a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request)

### After merge

1. **Delete the branch** — Indicates work is complete. GitHub offers this after merge.
2. **Verify** — Issue linked with `Closes #42` is auto-closed.
3. **Discord** — Merge notification with roast, rating, Sonar stats (if configured).

---

## Quick Reference

| Command / Action                                           | When                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| `yarn issue:create docs/issues/<file>.md`                  | After AI generates issue content                             |
| `yarn issue:create`                                        | Uses docs/issues/draft.md (creates from template if missing) |
| `GH_TOKEN=ghp_xxx yarn issue:create docs/issues/<file>.md` | Create issue as bot/other account                            |
| `yarn quality`                                             | Before opening PR                                            |
| `gh pr create`                                             | Open PR from CLI                                             |
| `gh pr view`                                               | Check PR status                                              |
| `gh pr merge`                                              | Merge from CLI (if allowed)                                  |

---

## External References

| Source               | URL                                                                                                                                             | Use                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| GitHub Flow          | https://docs.github.com/en/get-started/quickstart/github-flow                                                                                   | Branch workflow    |
| Conventional Commits | https://www.conventionalcommits.org/                                                                                                            | Commit format      |
| Protected Branches   | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches | Merge requirements |
| Linking PR to Issue  | https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue                                             | Auto-close         |
| GitHub CLI           | https://cli.github.com/                                                                                                                         | `gh` commands      |

---

## Internal References

| Document                                                             | Purpose                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------ |
| [AGENTS.md](../AGENTS.md)                                            | Conventions, verification, canonical contracts         |
| [CONVENTIONS.md](CONVENTIONS.md)                                     | DTOs, REST, Swagger, testing                           |
| [DEFINITION_OF_DONE.md](../DEFINITION_OF_DONE.md)                    | PR readiness checklist                                 |
| [PR_REVIEW_PIPELINE.md](PR_REVIEW_PIPELINE.md)                       | CI, SonarCloud, AI review, Discord                     |
| [QUALITY_METRICS.md](QUALITY_METRICS.md)                             | Coverage, thresholds, measurement                      |
| [issues/README.md](issues/README.md)                                 | Issue drafts folder, quick commands, format            |
| [prompts/new-issue.md](prompts/new-issue.md)                         | AI prompt for issue creation                           |
| [prompts/requirement-canonical.md](prompts/requirement-canonical.md) | Real requirement example                               |
| [prompts/pre-pr-review.md](prompts/pre-pr-review.md)                 | Pre-PR verification prompt                             |
| [prompts/code-review.md](prompts/code-review.md)                     | AI review categories                                   |
| [scripts/create-github-issue.js](../scripts/create-github-issue.js)  | Issue creation script (auto-label, GH_TOKEN, assignee) |
