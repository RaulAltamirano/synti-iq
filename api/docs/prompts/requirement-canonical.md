# Canonical Requirement Example

This file serves as the **reference example** for task-specific prompts used with the [new-issue.md](./new-issue.md) workflow. Copy and adapt the prompt below for your requirement.

---

## How to Use

1. Copy the prompt template below.
2. Replace `<REQUIREMENT_DESCRIPTION>` with your task.
3. Paste into Gemini, ChatGPT, Claude, or Cursor.
4. Save the AI output to `docs/issues/<descriptive-name>.md`.
5. Run: `yarn issue:create docs/issues/<descriptive-name>.md`

---

## Prompt Template

```
You are a Staff Software Engineer and Technical Architect. Generate a complete, well-structured GitHub issue for the following work.

## Task to implement
<REQUIREMENT_DESCRIPTION>

## Step 1 — Detect the issue type

Automatically identify the correct type from the input:
- TASK: Internal technical work (audits, refactors, migrations, docs, infra)
- STORY: Feature or behavior delivered to an end user or actor
- BUG: Something broken or deviating from expected behavior
- EPIC: Large body of work spanning multiple issues or sprints
- SPIKE: Investigation or research needed before implementation

If the type cannot be determined, default to TASK.

## Step 2 — Output the correct template

Use ONLY the template that matches the detected type. See docs/issues/TEMPLATES.md for exact section structure.

**Title**: Use the type prefix and imperative verb. Max ~80 characters.
- TASK: `[TASK] <Imperative verb phrase>`
- STORY: `[STORY] As a <role>, I can <action> so that <benefit>`
- BUG: `[BUG] <What is broken> — <symptom or impact>`
- EPIC: `[EPIC] <Verb phrase describing the outcome>`
- SPIKE: `[SPIKE] Investigate <topic> to decide <decision>`

**Format**: Use inline `TITLE:` and `LABELS:` followed by `---` and the body. If `LABELS` omitted, the script infers from the title.

**Acceptance criteria**: Binary outcomes only. Cover happy path, edge cases, error states.

**Project conventions**: AGENTS.md, src/_template/, docs/CONVENTIONS.md, docs/PLAN_TEMPLATE.md for complex features.
```

---

## Example: Store Stats Endpoint (STORY)

**Input:**

```
## Task to implement
Add endpoint GET /stores/:id/stats that returns basic stats (monthly sales, active products, low inventory items) for the dashboard.
```

**Expected output:** See the "Example (STORY)" section in [new-issue.md](./new-issue.md).

---

## References

- [new-issue.md](./new-issue.md) — Main prompt and generic workflow
- [docs/issues/TEMPLATES.md](../issues/TEMPLATES.md) — Type-specific templates
- [docs/issues/ci-cd-pipeline-review-task.md](../issues/ci-cd-pipeline-review-task.md) — Canonical TASK draft example (committed)
