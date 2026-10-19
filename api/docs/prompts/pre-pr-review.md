# Prompt: Pre-PR Verification

Use this prompt to run a full pre-PR verification. Ensures the changes would pass review.

---

## Context (Read First)

Before proceeding, read and internalize:

- [DEFINITION_OF_DONE.md](../../DEFINITION_OF_DONE.md) — Full checklist
- [AGENTS.md](../../AGENTS.md) — Verification checklist, quality gates
- [docs/CONVENTIONS.md](../CONVENTIONS.md) — All conventions

---

## Task

Perform a full pre-PR verification for the current changes. Report readiness and any blockers.

### Step 1: Run Quality Gates

```bash
yarn quality
```

Or manually: `yarn build` → `yarn lint` → `yarn test` → `yarn format:check`

**Result:** PASS / FAIL. If FAIL, list which command failed and why.

### Step 2: Definition of Done Checklist

Go through [DEFINITION_OF_DONE.md](../../DEFINITION_OF_DONE.md) and verify:

| Section | Status | Notes |
|---------|--------|-------|
| Code Quality | ☐ | No any, return types, file size, complexity, no console, error handling |
| Architecture | ☐ | No logic in controllers, repo layer, module structure |
| Testing | ☐ | Unit tests, mocking, edge cases, coverage |
| API & Documentation | ☐ | Swagger, DTOs validated, types declared |
| Git & Process | ☐ | Conventional commits, PR template, no TODO, ADR if needed |
| AI-Assisted Work | ☐ | Reviewed, quality passes, _template verified |

### Step 3: Flag Review Blockers

List anything that would cause a reviewer to request changes:

- Missing tests for new logic
- `any` in production code
- Business logic in controller
- Missing Swagger docs for new endpoints
- Unresolved TODO/FIXME
- Architectural change without ADR

### Step 4: Summary

- **Ready for PR:** Yes / No
- **Blockers:** (list or "None")
- **Suggestions:** Optional improvements before or after merge

### Quick Command

```bash
yarn quality
```

If this passes and DoD checklist is satisfied, the PR is ready for review.
