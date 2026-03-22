# Architecture Decision Records — Index

Index and template for Architecture Decision Records (ADRs).

**References:** [AGENTS.md](../../AGENTS.md), [docs/prompts/new-adr.md](../prompts/new-adr.md)

---

## When to Create an ADR

Create an ADR when the decision:

- Affects multiple modules or the overall architecture
- Introduces a new technology, pattern, or dependency
- Changes a previously documented approach
- Has significant trade-offs or consequences
- Future developers would benefit from understanding the rationale

**Do not** create an ADR for routine implementation choices, bug fixes, or minor refactors.

---

## ADR Format Template

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

---

## Status Lifecycle

| Status         | Meaning                                            |
| -------------- | -------------------------------------------------- |
| **Proposed**   | Under discussion; not yet adopted                  |
| **Active**     | Accepted and in use                                |
| **Deprecated** | No longer recommended; may still exist in codebase |
| **Superseded** | Replaced by another ADR (link to the new ADR)      |

---

## Naming Convention

- **Format:** `NNNN-short-title.md` (e.g. `0001-use-typeorm.md`, `0002-add-redis-cache.md`)
- **Number:** Zero-padded, sequential
- **Title:** kebab-case, descriptive (what was decided)

---

## Index of ADRs

| ADR                                           | Title                                           | Status |
| --------------------------------------------- | ----------------------------------------------- | ------ |
| [0001](0001-ai-router-specialist-strategy.md) | AI Router + Specialist Strategy (Groq + Gemini) | Active |

<!-- When adding ADRs, append rows:
| [0001](0001-use-typeorm.md) | Use TypeORM as ORM | Active |
-->

---

## Instructions for New ADRs

1. Copy the format template above into a new file: `docs/adr/NNNN-short-title.md`
2. Fill in all sections
3. Set initial status (usually **Proposed** or **Active**)
4. Add a row to the Index table in this file
5. Use the [new-adr prompt](../prompts/new-adr.md) for AI-assisted creation
