# Prompt: Create a New Architecture Decision Record (ADR)

Use this prompt when a significant technical decision has been made and should be documented.

---

## Context (Read First)

Before proceeding, read and internalize:

- [docs/adr/000-index.md](../adr/000-index.md) — ADR format, lifecycle, naming
- [AGENTS.md](../../AGENTS.md) — When to ask vs. decide

---

## Task

Create a new ADR for the following decision.

### When to Create an ADR

Create an ADR when the decision:

- Affects multiple modules or the overall architecture
- Introduces a new technology, pattern, or dependency
- Changes a previously documented approach
- Has significant trade-offs or consequences
- Future developers would benefit from understanding the rationale

### File Naming

- Format: `NNNN-short-title.md` (e.g. `0001-use-typeorm.md`, `0002-add-redis-cache.md`)
- Use the next available number (check existing ADRs in docs/adr/)
- Title: kebab-case, descriptive

### Required Sections

```markdown
# ADR-NNNN: Short Title

## Status

Proposed | Active | Deprecated | Superseded

## Context

What is the issue or situation that motivates this decision?
What constraints exist? What is the scope?

## Decision

What is the change that we are proposing and/or doing?

## Alternatives Considered

What other options were evaluated? Why were they rejected?

## Consequences

### Positive
- ...

### Negative
- ...

### Neutral
- ...

## References

- Links to docs, tickets, or related ADRs
```

### Status Lifecycle

- **Proposed** — Under discussion, not yet adopted
- **Active** — Accepted and in use
- **Deprecated** — No longer recommended, but may still exist
- **Superseded** — Replaced by another ADR (link to it)

### After Creating

1. Add the new ADR to the index table in [docs/adr/000-index.md](../adr/000-index.md)
2. Update status as the decision progresses

### Example Entry in Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](../adr/0001-use-typeorm.md) | Use TypeORM as ORM | Active |
