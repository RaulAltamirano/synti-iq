# AGENTS.md — Recommended Additions

Copy-paste these blocks into [AGENTS.md](../AGENTS.md) to integrate the new quality and automation artifacts. Do not modify other content.

---

## 1. Add to Executable Commands Table

Add this row to the "Executable Commands (Run First)" table (after the `format:check` row):

| Command | Purpose |
|---------|---------|
| `yarn quality` | Run build, lint, test, format:check (pre-PR verification) |

---

## 2. Add to References Section

Add these lines to the "References" section at the end of AGENTS.md:

```markdown
- **Definition of Done**: [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md) — Checklist for PR readiness
- **Prompt library**: [docs/prompts/](docs/prompts/) — Reusable prompts for new module, code review, tests, fix-quality, pre-PR, ADR
- **Quality metrics**: [docs/QUALITY_METRICS.md](docs/QUALITY_METRICS.md) — Thresholds and measurement
- **ADR process**: [docs/adr/000-index.md](docs/adr/000-index.md) — When and how to document architectural decisions
```

---

## 3. Optional: Update Verification Checklist

You may optionally add `yarn quality` as a one-liner alternative to the four-command sequence:

> After completing any task, run `yarn quality` (or individually: `yarn build`, `yarn lint`, `yarn test`, `yarn format:check`). Do not consider a task complete until all pass.
