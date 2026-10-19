# Synti-IQ Web — Feature Plan Template

Standard template for creating implementation plans for AI coding agents (Cursor, Windsurf, Graviti) and developers. Use for feature work, refactors, or multi-step tasks.

**Location:** `docs/PLAN_TEMPLATE.md` — Use this template when drafting any feature or refactor plan.

---

## Golden Rule

When in doubt about API contracts, store shape, route guards, or third-party libraries: **STOP AND ASK**. Do not assume or infer variable names or implementation details.

---

## Plan Sections

### 1. Context and scope

- Feature or refactor summary
- Affected modules (components, composables, stores, routes)
- Dependencies (API endpoints, design tokens)

### 2. Blocking questions

- List any unknowns affecting implementation
- If context is complete: "Context complete. Proceeding with plan."

### 3. Implementation steps (agent-oriented)

Each step must include exact file paths and concrete actions:

```
1. **src/modules/<feature>/components/ComponentName/ComponentName.vue** — Create component
   - Define Props and Emits interfaces
   - Implement with <script setup>, defineProps, defineEmits
2. **src/modules/<feature>/components/ComponentName/ComponentName.stories.ts** — Add stories
   - CSF3 format, Default, Variants, States
...
```

**Execution order (typical):** See [FRONTEND_CONVENTIONS.md](FRONTEND_CONVENTIONS.md) — Creating a Component, Creating a Composable, Creating a Pinia Store for detailed steps.

1. Types / interfaces
2. Composable or store (if needed)
3. Component (props, emits, template)
4. Stories
5. Route registration (if new page)
6. Barrel export (if UI component)

### 4. Testing

- Composable/store: `.spec.ts` with `setActivePinia` for stores
- Component: mount with Pinia if needed
- Reference: [tests/home/composables/useGreeting.spec.ts](../tests/home/composables/useGreeting.spec.ts), [tests/auth/stores/authStore.spec.ts](../tests/auth/stores/authStore.spec.ts)

### 5. Verification

- Run: `yarn build`, `yarn lint`, `yarn type-check`, `yarn format:check`, `yarn test`, `yarn build-storybook`

---

## References

- [AGENTS.md](../AGENTS.md) — Verification checklist, canonical references
- [docs/FRONTEND_CONVENTIONS.md](FRONTEND_CONVENTIONS.md) — Component architecture, state management, Storybook
