# Prompt: Create a New Page/View

Use this prompt when asking an AI agent or developer to create a new page or view in the application.

---

## Instructions

Create a new page named `[PageName]` in the `[feature]` module following project conventions.

### Steps (from [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md))

1. **Create page files:** Add `PageName.vue` and optionally `PageName.ts` in `src/modules/<feature>/pages/`.
2. **Add route:** Register in `src/modules/<feature>/router/<feature>Routes.ts`.
3. **Route meta:** Set `meta.requiresAuth` and `meta.roles` as needed for guards.
4. **Main router:** Ensure the feature router is imported in the main router.
5. **Lazy loading:** Use `component: () => import('./pages/PageName.vue')` for heavy pages.

### Canonical references

- [Profile](../../src/modules/profile/page/Profile/) — page with Profile.vue + Profile.ts
- [SalesView](../../src/modules/checkoutBox/page/SalesView/) — feature page structure
- [StoreDetails](../../src/modules/store/pages/StoreDetails/) — page with composable

**Note:** Profile, SalesView, and StoreDetails use legacy Options API. For new pages, use `<script setup lang="ts">` with a composable. Prefer structure: `PageName.vue` with `<script setup lang="ts">` importing `usePageName()` from `composables/usePageName.ts` or `PageName.ts`.

### Routing conventions

- Routes live in `src/modules/<feature>/router/<feature>Routes.ts` (e.g. `profileRoutes.ts`).
- Use `route.meta.requiresAuth` for auth guards.
- Use `route.meta.roles` for role-based access.

### Do NOT

- Use Options API or `defineComponent` for new pages; use `<script setup lang="ts">`.
- Put page logic in the router file; use a composable or PageName.ts.
- Forget to register the route in the feature router and main router.
- Use synchronous imports for heavy pages; prefer lazy loading.
