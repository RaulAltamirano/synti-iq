# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev              # Dev server at http://localhost:5173
yarn build            # TypeScript check + production bundle
yarn type-check       # vue-tsc --noEmit (no emit)
yarn lint             # ESLint on src/
yarn lint:fix         # ESLint with auto-fix
yarn format           # Prettier write
yarn format:check     # Prettier check (CI)
yarn test             # Vitest run (unit)
yarn test:watch       # Vitest watch mode
yarn test:coverage    # Vitest with coverage
yarn storybook        # Storybook dev at http://localhost:6006
yarn build-storybook  # Static Storybook build
yarn quality          # Full pipeline: build → lint → type-check → format:check → test → build-storybook
```

**Before finishing any task:** run `yarn build && yarn lint && yarn type-check && yarn format:check && yarn test`. For UI component changes, also run `yarn build-storybook`.

## Architecture

### Module System

All code lives in `src/modules/`. Each feature module follows the same internal structure:

```
src/modules/<feature>/
├── components/     # Reusable components (not pages)
├── composables/    # useXxx.ts — logic, API calls, form handling
├── pages/          # Route-level components
├── router/         # <feature>Routes.ts
├── stores/         # useXxxStore.ts (Pinia)
├── services/       # API calls (Axios)
├── interfaces/     # TypeScript types
└── schemas/        # Zod schemas
```

**Feature modules:** `auth`, `checkoutBox`, `core`, `forms`, `home`, `location`, `products`, `profile`, `services`, `shared`, `store`, `ui`, `users`, `warehouse`.

### App Bootstrap (`src/main.ts`)

Order matters: `setupVeeValidate()` → Pinia → `useThemeStore().init()` → `StatusModalPlugin` → Router → `MotionPlugin` → mount.

### Router

`src/router/index.ts` imports feature routers and calls `setupRouterGuards(router)` for auth. Route guards read `route.meta.requiresAuth` and `route.meta.roles`. New feature routes go in `src/modules/<feature>/router/<feature>Routes.ts` then imported in the main router.

### UI Module (`src/modules/ui/`)

Shared component library. Three tiers:

- **Foundation** — single-purpose, no domain logic: Button, Input, Textarea, Badge, Avatar, Spinner, Skeleton, Toggle, RoleIcon, Autocomplete, TokenAutocomplete
- **Pattern** — composed from Foundation: Card, Select, Toast, ToastProvider, Pagination, Section, SectionSkeleton, InfoBanner, Stepper
- **Page** — feature-specific compositions (live in feature modules, not ui/)

Barrel export: `src/modules/ui/components/index.ts`. Import from `@/modules/ui/components`.

Design tokens live in `src/modules/ui/tokens/*.ts` and `src/modules/ui/styles/tokens.css`. Tailwind v4 uses CSS-first `@theme`; tokens.css is the source of truth.

### State Management

| State type | Use |
|---|---|
| Cross-route / global (auth, theme, modal, cart) | Pinia store in `stores/useXxxStore.ts` |
| Page or feature logic, API calls, cleanup needed | Composable `composables/useXxx.ts` |
| Single component only | `ref()` / `reactive()` inline |

Use `storeToRefs()` when destructuring Pinia state in components. Never destructure the store directly.

Async store actions pattern: set `loading = true` → fetch → on success set data + clear error/loading → on error set error + clear loading.

### Forms

VeeValidate + Zod. Pattern: `useForm()` with `toTypedSchema(zodSchema)` in a composable; bind `<Field v-slot="{ componentField, errorMessage }">` in the template. Global defaults configured in `src/modules/forms/vee-validate.config.ts`.

Reference for multi-step wizards: `src/modules/store/composables/useStoreForm.ts` + `src/modules/store/schemas/store-wizard.schema.ts`.

## Required Patterns for New Code

### Vue Components

Always use `<script setup lang="ts">`. No Options API for new code.

```vue
<script setup lang="ts">
interface Props { ... }
const props = withDefaults(defineProps<Props>(), { ... });
const emit = defineEmits<{ eventName: [payload?: Type] }>();
</script>
<template>...</template>
```

**Canonical reference for new components:** `src/modules/ui/components/InfoBanner/` or `src/modules/ui/components/Section/`. Do **not** use Button, Card, or legacy pages (Profile, SalesView, StoreDetails) as templates — they use Options API.

### TypeScript

No `any`. Use concrete types or `Record<string, unknown>`. All refs typed: `ref<Type>()`.

### Imports

Use `@/` alias: `import { X } from '@/modules/...'`. Avoid deep relative paths across modules.

### Naming

- Boolean props: `isDisabled`, `isLoading`, `hasError`
- Callback props: `onClick`, `onClose`, `onSubmit`
- Internal handlers: `handleClick`, `handleDismiss`
- v-model: `modelValue` / `update:modelValue` (or `defineModel()`)
- Store files: `useXxxStore.ts`; Composable files: `useXxx.ts`

### New UI Component Checklist

1. `ComponentName.vue` with `<script setup lang="ts">`
2. `ComponentName.stories.ts` with Default, Variants, States (when props exist for them) — CSF3 format, `Meta<typeof Component>`
3. Export from `src/modules/ui/components/index.ts`
4. `.spec.ts` required for composables and stores; optional for components

### Storybook Stories

```typescript
const meta: Meta<typeof Component> = {
  title: 'UI/ComponentName',
  component: Component,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Component>;
```

Use `args.children` for default slot content in story templates (Storybook-only convention, not a Vue prop).

### Teleport

Use `Teleport to="body"` for modals, toasts, overlays. Use `z-50`; use `z-[100]` only when stacking above other overlays.

## ESLint Rules to Know

| Rule | Level | Note |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | error | Use `Record<string, unknown>` instead |
| `@typescript-eslint/no-unused-vars` | error | Prefix intentionally unused with `_` |
| `vue/component-api-style` | warn | Will become error after legacy migration |
| `vue/no-v-html` | warn | XSS risk; justify if used |
| `vue/define-macros-order` | warn | defineOptions → defineProps → defineEmits → defineSlots → defineModel |
| `vue/block-order` | warn | script → template → style |

## Tailwind

No magic numbers or arbitrary values (e.g. `text-[13px]`). Use design scale only. `@apply` only for overriding third-party styles or patterns repeated 3+ times in the same component. Semantic color tokens: `primary`, `success`, `warning`, `error`, `info`, `gray-*`.

## Theme

Stored in `localStorage` under key `synti-iq-theme-preference` (values: `light` | `dark` | `system`). Pinia store: `themePreference` at `src/modules/shared/store/ThemeStore.ts`. Dark mode via `dark:` Tailwind variants.

## Testing

- `setActivePinia(createPinia())` in `beforeEach` for any test using Pinia.
- Prefer `mount()` over `shallowMount()`.
- Spec locations: colocated next to source or in `tests/<feature>/composables/` and `tests/<feature>/stores/`.
- Reference composable test: `tests/home/composables/useGreeting.spec.ts`.
- Reference store test: `tests/auth/stores/authStore.spec.ts`.

## Key Reference Files

- `docs/FRONTEND_CONVENTIONS.md` — canonical conventions (component architecture, Tailwind, Storybook, state management)
- `docs/prompts/` — reusable prompts for common tasks (new-component, new-page, write-story, write-spec, pre-pr-review)
- `src/modules/ui/README.md` — UI module usage
- `AGENTS.md` — agent/developer guide (this document summarizes the most critical parts)
