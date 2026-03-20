# Synti-IQ API — Technical Development Plan Template

Standard template for creating implementation plans executed by AI coding agents (Cursor, Windsurf, Graviti). Ensures deterministic, high-quality plans with exact file paths, interface contracts, and strict typing.

**Location**: `docs/PLAN_TEMPLATE.md` — Use this template when drafting any feature or refactor plan.

---

## Golden Rule (Zero Assumptions Mode)

When in doubt about database relations, table/entity names, key data types, error handling, or third-party libraries: **STOP AND ASK**. Do not assume. Do not infer implementations or variable names. If information is missing for a perfect design, your priority is to ask, not to guess.

---

## Strict Thinking Process

1. **Analyze** technical context and identify any gaps in data contracts or business logic.
2. **Evaluate** impact on dependency injection and Nest.js module tree.
3. **Stop** plan generation if there are blocking questions; list them and wait for answers.

---

## Plan Sections (Mandatory Format)

### Entendimiento Técnico
- Architectural summary of the solution.
- Context, boundaries, and affected modules.

### PREGUNTAS BLOQUEANTES (Emergency Brake)
- If there are doubts affecting interface design or DB: list them here and **do not** generate the rest of the plan. Wait for a response.
- If context is complete: write "**Contexto completo. Procediendo con el plan.**"

### Supuestos y Contratos
- Libraries to use or agreed architectural patterns.
- Table: | Element | Decision | (e.g. Nest.js v11, TypeORM 0.3.x, validation strategy).

### Plan de Implementación (Agent-Oriented)

Each item MUST follow this structure:

```
1. **[exact file path]** — Objective
   - Concrete code actions (e.g. "Define interface `IUser`", "Create `findById` with `@InjectRepository()`").
   - Dependencies to import or inject.
2. **[exact file path]** — Objective
   - ...
```

**Execution order** (must avoid compilation errors):
1. Interfaces / types
2. DTOs (with class-validator)
3. Entities (TypeORM with `@Entity()`)
4. Repositories / Services
5. Controllers
6. Module registration (imports, providers)

**Terminology**: Use exact Nest.js terms (Controllers, Services/Providers, Guards, Interceptors, Pipes).

### Plan de Testing (.spec.ts)
- Specific test cases the agent must code.
- Services with business logic: unit tests required.
- Reference: [docs/CONVENTIONS.md](CONVENTIONS.md) — Testing, [src/referral/__tests__/](../src/referral/__tests__/)

### Prevención de Deuda Técnica / Riesgos
- Circular dependencies (prefer structural refactors over `forwardRef`)
- Memory leaks, concurrency pitfalls in Node/Nest.js
- Any mitigation for identified risks

---

## File Path Conventions

| Element | Convention | Example |
|--------|------------|---------|
| DTOs | `src/<module>/dto/<type>-<entity>.dto.ts` | `src/store/dto/create-store.dto.ts` |
| Entities | `src/<module>/entities/<entity>.entity.ts` | `src/user/entities/user.entity.ts` |
| Services | `src/<module>/<module>.service.ts` | `src/auth/auth.service.ts` |
| Controllers | `src/<module>/<module>.controller.ts` | `src/store/store.controller.ts` |
| Specs | Colocated `*.spec.ts` or `__tests__/` | `src/referral/__tests__/referral.service.spec.ts` |

Consult [AGENTS.md](../AGENTS.md) — Canonical Contracts for shared interfaces.

---

## Cursor Plan File Format (Optional)

When saving plans as `.plan.md` in `.cursor/plans/`, use YAML frontmatter:

```yaml
---
name: Short Plan Name
overview: One-line description
todos: []
isProject: false
---
```

---

## References

- [AGENTS.md](../AGENTS.md) — Quick reference, canonical contracts, verification checklist
- [docs/CONVENTIONS.md](CONVENTIONS.md) — DTOs, entities, repositories, testing, observability
- [docs/STORE_AND_SUBSCRIPTION_PLANS.md](STORE_AND_SUBSCRIPTION_PLANS.md) — Subscription limits and store behavior
