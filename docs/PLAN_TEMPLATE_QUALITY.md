# Synti-IQ Web — Quality Plan Template

General quality plan template for Cursor with prompt engineering best practices. Reusable for any frontend requirement.

**Location:** `docs/PLAN_TEMPLATE_QUALITY.md` — Use this template when structuring implementation plans for AI agents (Cursor, Windsurf, Graviti) and developers.

---

## When to Use This Template

- New component, page, composable, or store
- Refactor of existing module
- Technical debt correction identified in audit
- Any frontend task that requires consistency with conventions

---

## Plan Structure (copy-paste)

```markdown
# [Plan Name]

## 1. Context and Scope
- **Objective:** [One sentence]
- **Affected modules:** [list: components, composables, stores, routes]
- **Required context:** @AGENTS.md @docs/FRONTEND_CONVENTIONS.md @[relevant module]

## 2. Prerequisites (Prompt Engineering)
Before executing, the agent MUST:
- Read [docs/FRONTEND_CONVENTIONS.md](docs/FRONTEND_CONVENTIONS.md) — relevant section
- Read canonical reference: [InfoBanner](src/modules/ui/components/InfoBanner/) or [Section](src/modules/ui/components/Section/) if component
- Verify [AGENTS.md](AGENTS.md) — Required Patterns, Verification Checklist

## 3. Blocking Questions
- [ ] Is the API/contract already defined?
- [ ] Store or composable for this logic?
- If context incomplete: STOP AND ASK.

## 4. Implementation Steps (absolute paths)
| # | File | Action |
|---|------|--------|
| 1 | src/modules/... | [Concrete action] |
| 2 | ... | ... |

Typical order: Types → Composable/Store → Component → Stories → Route/Export

## 5. Verification
Run in order: `yarn build` → `yarn lint` → `yarn type-check` → `yarn format:check` → `yarn test` → `yarn build-storybook`
Or: `yarn quality`

## 6. References
- [AGENTS.md](../AGENTS.md)
- [docs/FRONTEND_CONVENTIONS.md](docs/FRONTEND_CONVENTIONS.md)
- [docs/PLAN_TEMPLATE.md](docs/PLAN_TEMPLATE.md)
- [docs/prompts/](prompts/) — use specific prompt if it exists
```

---

## Integrated Prompt Engineering Principles

| Principle | How to Apply in the Plan |
| --------- | ------------------------ |
| **Explicit context** | Include `@AGENTS.md @docs/FRONTEND_CONVENTIONS.md` in the prompt |
| **Canonical references** | Link to InfoBanner/Section for components; useGreeting/authStore for composables/stores |
| **Clear constraints** | "MUST use script setup", "Do NOT use Options API" |
| **Absolute paths** | Always `src/modules/<feature>/...` never ambiguous relative paths |
| **Execution order** | Types → logic → component → stories → integration |
| **Explicit verification** | Command `yarn quality` as final gate |

---

## Starter Prompt for New Plans

When starting a frontend task in Cursor, use this base prompt:

```
I follow the conventions in @AGENTS.md and @docs/FRONTEND_CONVENTIONS.md.
Canonical reference for components: InfoBanner, Section.
Canonical reference for composables: useGreeting.
Canonical reference for stores: authStore.
Before coding: read the affected module, verify paths in src/modules/<feature>/.
At the end: run yarn quality.
```

---

## References

- [AGENTS.md](../AGENTS.md) — Verification checklist, canonical references
- [docs/FRONTEND_CONVENTIONS.md](docs/FRONTEND_CONVENTIONS.md) — Component architecture, state management, Storybook
- [docs/PLAN_TEMPLATE.md](docs/PLAN_TEMPLATE.md) — Feature plan template
