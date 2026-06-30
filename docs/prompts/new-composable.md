# Prompt: Create a New Composable

Use this prompt when asking an AI agent or developer to create a new Vue 3 composable.

---

## Instructions

Create a new composable named `use[Feature]` in the `[feature]` module following project conventions.

### Steps (from [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md))

1. **File:** Place in `src/modules/<feature>/composables/useXxx.ts`.
2. **Naming:** Use `useXxx` (camelCase after "use").
3. **Return:** Export a function that returns a typed object. Avoid returning raw refs; group in an object.
4. **Single responsibility:** One composable, one concern. Split when logic grows.
5. **Reactivity:** Use `computed` for derived state; `watch` for side effects on explicit dependencies; `watchEffect` only when dependencies are implicit.

### Canonical references

- [useGreeting](../../src/modules/home/composables/useGreeting.ts) — simple composable with refs and computed
- [useStoreScheduleForm](../../src/modules/store/composables/useStoreScheduleForm.ts) — form logic and validation

### When to use a composable vs a store

- **Composable:** Page/feature logic, form logic, needs cleanup on unmount, single-page scope.
- **Pinia store:** Cross-route or global state, shared across 2+ pages.

See the [Decision Tree](../FRONTEND_CONVENTIONS.md#decision-tree) in FRONTEND_CONVENTIONS.

### Do NOT

- Return raw refs without grouping in an object.
- Mix multiple concerns in one composable.
- Use Pinia for single-page logic (use a composable instead).
