# Prompt: Create GitHub Issue with AI

Use this prompt in **Gemini**, **ChatGPT**, **Claude**, or **Cursor** to generate a well-structured issue. Then create it on GitHub automatically with the included script.

**Part of:** [Development Workflow — Issue to Merge](../DEVELOPMENT_WORKFLOW.md) (full flow from issue creation to PR merge).

---

## How to Use

1. **Copy the generic prompt** (section below) and replace `<TASK_DESCRIPTION>` with your requirement.
2. **Paste into the AI** (Gemini, ChatGPT, etc.) and get the output.
3. **Save the output** to `docs/issues/<descriptive-name>.md` (e.g. `docs/issues/store-stats-endpoint.md`).
4. **Run the script** to create the issue on GitHub:
   ```bash
   yarn issue:create docs/issues/store-stats-endpoint.md
   # or from stdin:
   pbpaste | node scripts/create-github-issue.js
   # or without args (uses docs/issues/draft.md):
   yarn issue:create
   ```

---

## Requirements

- **GitHub CLI** (`gh`) installed and authenticated:

  ```bash
  gh auth status   # verify
  gh auth login    # if not logged in
  ```

- **Create as bot or different user:** Set `GH_TOKEN` to that account's token:

  ```bash
  GH_TOKEN=ghp_xxx yarn issue:create docs/issues/<file>.md
  ```

- **Assign to someone:** Add `ASSIGNEE: username` in the draft (GitHub username, no @).

---

## Generic Prompt (copy and customize)

```
You are a Staff Software Engineer and Technical Architect. Generate a complete, well-structured GitHub issue for the following work.

## Task to implement
<TASK_DESCRIPTION>

## Step 1 — Detect the issue type

Automatically identify the correct type from the input:

| Type   | When to use |
|--------|-------------|
| TASK   | Internal technical work: audits, refactors, migrations, docs, infra |
| STORY  | Feature or behavior delivered to an end user or actor |
| BUG    | Something broken, incorrect, or deviating from expected behavior |
| EPIC   | Large body of work spanning multiple issues or sprints |
| SPIKE  | Investigation or research needed before committing to implementation |

If the type cannot be determined from the input, default to TASK.

## Step 2 — Output the correct template

Use ONLY the template that matches the detected type. Do not mix templates.

**Title**: Always start with the type prefix and imperative verb. Max ~80 characters.
- TASK: `[TASK] <Imperative verb phrase>`
- STORY: `[STORY] As a <role>, I can <action> so that <benefit>`
- BUG: `[BUG] <What is broken> — <symptom or impact>`
- EPIC: `[EPIC] <Verb phrase describing the outcome>`
- SPIKE: `[SPIKE] Investigate <topic> to decide <decision>`

**Language**: Write the entire issue in **English**.
**Format**: Use inline `TITLE:`/`LABELS:` or YAML frontmatter. If `LABELS` omitted, script infers: `docs`→documentation, `feat`→enhancement, `fix`→bug, `chore`→chore.

**Acceptance criteria**: Each item must be binary (pass/fail). Cover happy path, edge cases, error states. No vague language.

**Project conventions** (for TASK/STORY with code): AGENTS.md, src/_template/, docs/CONVENTIONS.md, docs/PLAN_TEMPLATE.md for complex features.

**Full templates**: See docs/issues/TEMPLATES.md for exact section structure per type.
```

---

## Template summaries (reference)

| Type      | Sections                                                                                    |
| --------- | ------------------------------------------------------------------------------------------- |
| **TASK**  | Overview, Steps, Acceptance criteria, Technical context, Out of scope, Resources            |
| **STORY** | Context, Acceptance criteria, Out of scope, References                                      |
| **BUG**   | Expected behavior, Actual behavior, Steps to reproduce, Impact, Environment, Possible cause |
| **EPIC**  | Goal, Scope (in/out), Success criteria, Child issues                                        |
| **SPIKE** | Question to answer, Context, Timebox, Output, Out of scope                                  |

---

## Example (STORY)

**Input (your prompt):**

```
You are a Staff Software Engineer...

## Task to implement
Add endpoint GET /stores/:id/stats that returns basic stats (monthly sales, active products, low inventory items) for the dashboard.
```

**Detected type:** STORY (feature delivered to end user)

**Expected AI output:**

```
TITLE: [STORY] As a store owner, I can view store stats so that I see at-a-glance metrics
LABELS: enhancement
---
## Context
Expose aggregated store statistics to power the admin dashboard. Enables at-a-glance metrics without separate queries.

## Acceptance criteria
- [ ] GET /stores/:id/stats returns 200 with { monthlySales, activeProductCount, lowInventoryCount }
- [ ] Unauthorized users receive 401; non-owners receive 403
- [ ] 404 when store does not exist
- [ ] Unit tests for store.service.getStats()

## Out of scope
- Charts or visualization
- Historical time series (snapshot only)

## References
- AGENTS.md, docs/CONVENTIONS.md, src/docs/store.endpoints.ts
```

Then: `yarn issue:create docs/issues/store-stats-endpoint.md`

---

## Real requirement examples

| Requirement           | Prompt file                                            |
| --------------------- | ------------------------------------------------------ |
| Canonical / reference | [requirement-canonical.md](./requirement-canonical.md) |

---

## References

- [DEVELOPMENT_WORKFLOW.md](../DEVELOPMENT_WORKFLOW.md) — Full flow: Issue → Branch → Implement → PR → Merge
- [docs/issues/TEMPLATES.md](../issues/TEMPLATES.md) — Type-specific issue templates
- [PLAN_TEMPLATE.md](../PLAN_TEMPLATE.md) — Technical plan structure
- [AGENTS.md](../../AGENTS.md) — Project conventions and contracts
- [CONVENTIONS.md](../CONVENTIONS.md) — DTOs, REST, Swagger
