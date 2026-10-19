# ADR Checklist — Do I Need an ADR?

Use this checklist to decide whether to create an Architecture Decision Record for your change.

---

## Questions (answer yes/no)

1. **New technology or dependency?** — Are you introducing a new library, framework, or external service not yet used in the project?
2. **Change of documented pattern?** — Does this contradict or significantly alter an existing approach (e.g. in CONVENTIONS.md, \_template, or another ADR)?
3. **Multi-module impact?** — Does this decision affect more than one module or the overall architecture?
4. **Significant trade-offs?** — Are there non-obvious consequences future developers should understand?
5. **Would future devs benefit?** — Would someone in 6 months need context to understand why we did it this way?

---

## Decision

- **3+ yes** → Create an ADR. Use [new-adr.md](new-adr.md).
- **1–2 yes** → Consider an ADR; discuss with team.
- **0 yes** → No ADR needed. Routine implementation, bug fix, or minor refactor.

---

## When NOT to Create an ADR

- Bug fixes
- Minor refactors within a single module
- Adding tests or documentation
- Dependency updates (unless major or pattern-changing)
- Configuration tweaks

---

## References

- [docs/adr/000-index.md](../adr/000-index.md)
- [new-adr.md](new-adr.md)
- [DEFINITION_OF_DONE.md](../../DEFINITION_OF_DONE.md)
