# Issue Drafts

Store issue drafts here before creating them on GitHub. Drafts are local-only and not committed (see root `.gitignore`).

## Language

**Use English strictly** for all issue drafts (title, body, acceptance criteria, etc.). This keeps issues consistent and accessible to all contributors.

## Quick Start

1. **Define requirement** — Use [docs/prompts/new-issue.md](../prompts/new-issue.md) or a task-specific prompt (e.g. `requirement-translate-docs-to-english.md`).
2. **Generate with AI** — Paste the prompt into Gemini, ChatGPT, Claude, or Cursor. Copy the output.
3. **Save draft** — Save the AI output to `docs/issues/<descriptive-name>.md` (e.g. `docs/issues/store-stats-endpoint.md`).
4. **Create on GitHub** — Run:
   ```bash
   yarn issue:create docs/issues/store-stats-endpoint.md
   ```

## Commands

| Command                                                    | Purpose                                                               |
| ---------------------------------------------------------- | --------------------------------------------------------------------- |
| `yarn issue:create docs/issues/<file>.md`                  | Create GitHub issue from draft                                        |
| `yarn issue:create docs/issues/draft.md`                   | If file missing, copies from [draft-template.md](./draft-template.md) |
| `GH_TOKEN=ghp_xxx yarn issue:create docs/issues/<file>.md` | Create as bot/other account (gh CLI)                                  |
| `pbpaste \| node scripts/create-github-issue.js`           | Create from clipboard (macOS)                                         |

## GitHub App (Bot) Authentication

To have the **bot** create issues (instead of your user account), configure a GitHub App and add credentials:

| Variable (local .env)    | Variable (CI secrets) | Description                                     |
| ------------------------ | --------------------- | ----------------------------------------------- |
| `GITHUB_APP_ID`          | `GH_APP_ID`           | App ID from the App's general settings          |
| `GITHUB_INSTALLATION_ID` | `GH_INSTALLATION_ID`  | Installation ID (from the installation URL)     |
| `GITHUB_PRIVATE_KEY`     | `GH_APP_PRIVATE_KEY`  | Private key (PEM). Use `\n` for newlines        |
| `GITHUB_REPOSITORY`      | _(auto in Actions)_   | Optional. `owner/repo` — defaults to git remote |

**CI note:** GitHub Actions secret names cannot start with `GITHUB_`. Use `GH_APP_ID`, `GH_INSTALLATION_ID`, `GH_APP_PRIVATE_KEY` when registering repo secrets.

**Flow:** When all three App vars are set (either naming), the script uses the REST API as the App; otherwise it falls back to `gh` CLI (or `GH_TOKEN`).

**App permissions:** Issues (read & write), Metadata (read). See [GitHub App setup](https://docs.github.com/en/apps/creating-github-apps/setting-up-a-github-app).

## Issue Types

Choose the template that matches your issue. If type cannot be determined, default to TASK.

| Type      | When to use                                                          |
| --------- | -------------------------------------------------------------------- |
| **TASK**  | Internal technical work: audits, refactors, migrations, docs, infra  |
| **STORY** | Feature or behavior delivered to an end user or actor                |
| **BUG**   | Something broken, incorrect, or deviating from expected behavior     |
| **EPIC**  | Large body of work spanning multiple issues or sprints               |
| **SPIKE** | Investigation or research needed before committing to implementation |

**Templates:** [TEMPLATES.md](./TEMPLATES.md) — All five templates with section structure.

## Format

Drafts support two formats:

**1. Inline (TITLE/LABELS):**

```
TITLE: [TASK] Audit and document auth roles
LABELS: documentation
ASSIGNEE: username  (optional)
---
## Overview
...
```

**2. YAML frontmatter (recommended):**

```yaml
---
title: [TASK] Audit and document auth roles
labels: [documentation]
assignee: username  (optional)
---
## Overview
...
```

If `LABELS` is omitted, the script infers from the title: `docs`→documentation, `feat`→enhancement, `fix`→bug, `chore`→chore.

## Draft Quality Standards

Sections vary by type. See [TEMPLATES.md](./TEMPLATES.md) for per-type structure.

| Section                       | Purpose                                   | Verifiable When                     |
| ----------------------------- | ----------------------------------------- | ----------------------------------- |
| **Overview / Context / Goal** | What and why (1–2 sentences)              | Reader understands the goal         |
| **Steps** (TASK)              | Concrete, actionable execution order      | Agent can follow sequentially       |
| **Acceptance criteria**       | Each item = one testable outcome (yes/no) | QA can verify; tests can be written |
| **Technical context**         | Affected files, dependencies, constraints | Agent knows where to read first     |
| **Out of scope**              | Explicit exclusions                       | No scope creep                      |

**Acceptance criteria:** Binary outcomes only. Use Given-When-Then for complex flows. Include happy path, edge cases, error states. Avoid vague language ("should work correctly" → "GET /users returns 403 when caller lacks manage_users permission").

**Example drafts:** [auth-roles-decorators-audit.md](./auth-roles-decorators-audit.md), [docs/prompts/new-issue.md](../prompts/new-issue.md) (expected output).

## References

- [draft-template.md](./draft-template.md) — Default template (TASK)
- [TEMPLATES.md](./TEMPLATES.md) — All five type-specific templates
- [DEVELOPMENT_WORKFLOW.md](../DEVELOPMENT_WORKFLOW.md) — Full flow: Issue → Branch → PR → Merge
- [prompts/new-issue.md](../prompts/new-issue.md) — AI prompt for issue creation
- [PLAN_TEMPLATE.md](../PLAN_TEMPLATE.md) — For complex features requiring implementation plans
- [DEFINITION_OF_DONE.md](../../DEFINITION_OF_DONE.md) — PR readiness checklist (align acceptance criteria with DoD)
