# Prompt: Create a New Pinia Store

Use this prompt when asking an AI agent or developer to create a new Pinia store.

---

## Instructions

Create a new Pinia store named `use[Feature]Store` in the `[feature]` module following project conventions.

### Steps (from [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md))

1. **File:** Place in `src/modules/<feature>/stores/useXxxStore.ts`.
2. **Naming:** Use `useXxxStore` (camelCase; "Store" suffix).
3. **Structure:** `defineStore('unique-id', { state, getters, actions })`.
4. **Async actions:** Set `loading = true` before fetch; on success set data and clear `error`/`loading`; on error set `error` and clear `loading`.
5. **State shape:** Expose `items` (or equivalent), `loading`, `error` when the store fetches data.

### Canonical references

- [authStore](../../src/modules/auth/stores/authStore.ts) — auth state, session, initialization
- [useSearchStore](../../src/modules/checkoutBox/composables/useSearchStore.ts) — search state and async fetch pattern

### When to use a store vs a composable

- **Pinia store:** Cross-route or global state, shared across 2+ pages (theme, auth, modal, cart).
- **Composable:** Page/feature logic, form logic, single-page scope.

See the [Decision Tree](../FRONTEND_CONVENTIONS.md#decision-tree) in FRONTEND_CONVENTIONS.

### Do NOT

- Use a store for single-page or form logic (use a composable).
- Forget to expose `loading` and `error` for async operations.
- Use Vuex (this project uses Pinia exclusively).
