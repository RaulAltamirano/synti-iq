# Synti-IQ Web — Agent & Developer Guide

Technical conventions and architectural context for AI coding agents (Cursor, Windsurf, Graviti) and developers.

---

## Agent Role

Act as a **Staff Frontend Engineer and UI Architecture Specialist** specialized in Vue 3, TypeScript, Pinia, and component-driven development with Storybook. Plan before coding: research the codebase, identify dependencies, and define a clear implementation approach before writing code.

---

## Codebase Awareness

Before generating or modifying code in a module:

1. Read existing files in that module (component, composable, store).
2. For new components similar to an existing one, use the canonical reference as template.
3. **Canonical reference for new components:** [src/modules/ui/components/InfoBanner/](src/modules/ui/components/InfoBanner/) or [src/modules/ui/components/Section/](src/modules/ui/components/Section/) — both use `<script setup>` + typed props/emits. Button and Card are legacy (Options API); do not use them as templates for new components.

**Required reads before modifying:**

- New component → read: [docs/FRONTEND_CONVENTIONS.md](docs/FRONTEND_CONVENTIONS.md) + InfoBanner or Section
- New composable → read: existing composables in same module + State Management section in conventions
- New store → read: [docs/FRONTEND_CONVENTIONS.md](docs/FRONTEND_CONVENTIONS.md) Decision Matrix + existing stores
- New page → read: [docs/FRONTEND_CONVENTIONS.md](docs/FRONTEND_CONVENTIONS.md) — New Page with script setup; do NOT use Profile, SalesView, or StoreDetails as templates (they use legacy Options API)

---

## Required Patterns

### Vue 3 Composition API

- **Always** use `<script setup lang="ts">` for new components. No Options API or `defineComponent` for new code.
- **Always** type props: `defineProps<Props>()` with interface; use `withDefaults()` for defaults.
- **Always** type emits: `defineEmits<{ eventName: [payload?: Type] }>()`.
- Use `defineModel()` for v-model components (Vue 3.4+).
- Use `storeToRefs` when destructuring Pinia store state in components; do not destructure the store directly.
- **State:** Cross-route or global → Pinia; page/component logic → composable; single component only → `ref` or `reactive`.

### TypeScript

- No `any` in components, composables, or stores. Use concrete types or `Record<string, unknown>` when necessary.
- All refs typed: `ref<Type>()` not `ref(value)` without type when type is non-inferred.
- All props and emits defined via interfaces.

### Imports

- Use `@/` alias for imports from src: `import { X } from '@/modules/...'`
- Avoid deep relative paths (`../../../`) for cross-module imports.

### Storybook

- Every UI component must have a `.stories.ts` file.
- Use CSF3 format: `Meta<typeof Component>`, `StoryObj<typeof Component>`.
- Required stories: Default, Variants; add States (Loading, Disabled, Error) only when the component has corresponding props.
- Use `args.children` for default slot content in story templates (Storybook-only convention).
- Reference: [src/modules/ui/components/InfoBanner/InfoBanner.stories.ts](src/modules/ui/components/InfoBanner/InfoBanner.stories.ts) for structure.

---

## Executable Commands (Run First)

| Command                | Purpose                          |
| ---------------------- | -------------------------------- |
| `yarn build`           | Verify compilation after changes |
| `yarn lint`            | Lint source; run before commit   |
| `yarn lint:fix`        | Auto-fix lint issues             |
| `yarn type-check`      | Type-check without emit          |
| `yarn test`            | Run unit tests                   |
| `yarn format:check`    | Verify Prettier formatting       |
| `yarn build-storybook` | Verify Storybook builds          |

Note: `yarn quality` and `yarn pre-pr` run the full verification pipeline; ensure they include `format:check` (see package.json).

## Verification Checklist

After completing any task, run in order: `yarn build`, `yarn lint`, `yarn type-check`, `yarn format:check`, `yarn test`, `yarn build-storybook`. Do not consider a task complete until all pass. Use `yarn quality` or `yarn pre-pr` for a single command — ensure these scripts include all steps above (see package.json).

---

## Quality Gates

- **Build**: Must compile with `yarn build` (no TypeScript errors)
- **Lint**: Must pass `yarn lint` (no ESLint errors)
- **Type-check**: Must pass `yarn type-check`
- **Tests**: Must pass `yarn test`; new composable/store logic should have corresponding `.spec.ts`
- **Format**: Must pass `yarn format:check` (Prettier)
- **Storybook**: Must build with `yarn build-storybook` for UI components

---

## Creating a Component (Quick Flow)

1. Define Props and Emits interfaces (in `.vue` or shared types).
2. Create `ComponentName.vue` with `<script setup lang="ts">`, `defineProps`, `defineEmits`.
3. Create `ComponentName.stories.ts` with Default, Variants, and States (when the component has loading/disabled/error props).
4. Export from `src/modules/ui/components/index.ts` (if UI component).
5. Optional: Add unit spec for component behavior. Required: `.spec.ts` for new composables and stores.

Full steps: [docs/FRONTEND_CONVENTIONS.md](docs/FRONTEND_CONVENTIONS.md#creating-a-component-end-to-end).

---

## References

- [docs/FRONTEND_CONVENTIONS.md](docs/FRONTEND_CONVENTIONS.md) — Component architecture, Tailwind, Storybook, state management
- [docs/README.md](docs/README.md) — Documentation index
- [docs/PLAN_TEMPLATE_QUALITY.md](docs/PLAN_TEMPLATE_QUALITY.md) — Quality plan template with prompt engineering
- [src/modules/ui/README.md](src/modules/ui/README.md) — UI module usage
- [README.md](README.md) — Project overview and commands

## Documentation Structure

- [docs/FRONTEND_CONVENTIONS.md](docs/FRONTEND_CONVENTIONS.md) — Canonical conventions
- [docs/README.md](docs/README.md) — Docs index
- `docs/PLAN_TEMPLATE.md` — (Optional) Use for feature plans
- `docs/PLAN_TEMPLATE_QUALITY.md` — Quality plan template with prompt engineering
- `docs/prompts/` — Reusable prompts (new component, write story, fix-types, pre-pr-review, etc.)
- [docs/PR_REVIEW_PIPELINE.md](docs/PR_REVIEW_PIPELINE.md) — Pre-PR verification pipeline (links to pre-pr-review prompt and QUALITY_METRICS)
