# UI Audit — Accessibility, Conventions & Migration Design

**Date:** 2026-04-09
**Scope:** `src/components/ui/` cleanup + `src/modules/ui/components/` full audit
**Approach:** Atomic per-component (Approach B) — migrate + a11y fix + story + spec in one pass per component

---

## 1. Cleanup: `src/components/ui/`

Delete the entire `src/components/ui/` directory. Both files are dead prototype code:

- `index.ts` — broken barrel that exports `ShapeLandingHero.vue` (file does not exist)
- `DemoHeroGeometric.vue` — imports the same missing file

**Pre-deletion check:** grep the entire codebase for any import of `src/components/ui` or `@/components/ui`. Fix any live references before deleting.

This is the **first step**, done before any component migration.

---

## 2. Migration Order (Dependency Tree)

Each component is one atomic commit: migrate → a11y fix (if applicable) → story update → spec (if applicable).
Order follows the dependency graph so no component is migrated before its dependencies.

### Wave 1 — Foundation (no inter-UI dependencies)
| # | Component | Work |
|---|-----------|------|
| 1 | `Spinner` | Migrate only |
| 2 | `Skeleton` | Migrate only |
| 3 | `Avatar` | Migrate only |
| 4 | `Badge` | Migrate only |
| 5 | `RoleIcon` | Migrate only |

### Wave 2 — Foundation with complexity
| # | Component | Work |
|---|-----------|------|
| 6 | `Toggle` | Migrate + a11y fix + spec |

### Wave 3 — Field components
| # | Component | Work |
|---|-----------|------|
| 7 | `Textarea` | Migrate only |
| 8 | `Input` | Migrate only |

### Wave 4 — Composed (depend on Button, Input)

> Note: Button is migrated in Wave 5. Wave 4 components **consume** Button but only its public API (no change from migration), so order is safe — consumers don't care whether Button uses Options API or `<script setup>` internally.
| # | Component | Work |
|---|-----------|------|
| 9 | `Card` | Migrate only |
| 10 | `Select` | Migrate + spec |
| 11 | `Autocomplete` | Migrate + a11y fix + spec |
| 12 | `Pagination` | Migrate + a11y fix + spec |

### Wave 5 — Complex composed
| # | Component | Work |
|---|-----------|------|
| 13 | `Button` | Migrate + a11y fix |
| 14 | `Stepper` | Migrate only |

### Cross-cutting (already use `<script setup>`, a11y fix only)
| Component | Work |
|-----------|------|
| `Toast` | Remove conflicting `aria-live="polite"` (conflicts with `role="alert"`) |
| `InfoBanner` | Remove `aria-live="polite"` from error variant only |

---

## 3. Per-Component Work Definition

### Migration checklist (every component)

- Delete the companion `.ts` file
- Merge all logic into `<script setup lang="ts">` in the `.vue` file
- Replace `defineComponent()` + Options API with direct Composition API:
  - `defineProps<Interface>()` with `withDefaults()` where needed
  - `defineEmits<{ eventName: [payload?: Type] }>()`
  - Inline `computed()`, `ref()` at top level
- Use `defineOptions({ name: '...' })` only when devtools name is needed
- Follow ESLint macro order: `defineOptions` → `defineProps` → `defineEmits` → `defineModel`
- Remove `<script lang="ts" src="./Component.ts" />` from the `.vue`
- The following interfaces are re-exported from `src/modules/ui/components/index.ts` and must remain accessible after migration. Move each interface definition inline into its `.vue` file and keep the existing `export type { X }` line in `index.ts` pointing to the `.vue`:
  - `ButtonProps` (Button)
  - `InputProps` (Input)
  - `BadgeProps`, `BadgeVariant` (Badge)
  - `SelectProps`, `SelectOption` (Select)
  - `ToggleProps` (Toggle)
  - `AutocompleteProps`, `AutocompleteOption` (Autocomplete — also imported directly in `TokenAutocomplete.stories.ts`)

### Accessibility fixes

| Component | Issue | Fix |
|-----------|-------|-----|
| `Toggle` | `<label>` wraps a `<button>` — semantically invalid | Replace wrapper `<label>` with `<div>`; the label `<span>` keeps its `id`; the `<button>` gets `:aria-labelledby="labelId"` |
| `Button` | No accessible name for icon-only usage | Add optional `ariaLabel?: string` prop; bind `:aria-label="ariaLabel || undefined"` on `<button>` |
| `Autocomplete` | `aria-selected` reflects highlighted index, not selected item | Set `aria-selected` to `true` only for the actually selected option; highlighted state is conveyed via `aria-activedescendant` (already wired) |
| `Autocomplete` | Hardcoded English hint string in template | Add `minCharsText?: string` prop. Default value is computed: `` `Type at least ${props.minChars} characters…` ``. The template replaces the hardcoded string with `{{ minCharsText ?? \`Type at least ${minChars} characters…\` }}`. Callers who need i18n pass their own formatted string. |
| `Pagination` | Ellipsis buttons render `...` with no `aria-label` | Add `aria-label="Go to previous page range"` and `aria-label="Go to next page range"` |
| `Toast` | `role="alert"` + `aria-live="polite"` conflict (`alert` implies `assertive`) | Remove `aria-live="polite"` from the toast bar element |
| `InfoBanner` | Same conflict for error variant | Move `aria-live` to be conditional: omit it when `variant === 'error'` (the `role="alert"` handles announcement); keep `aria-live="polite"` for `role="status"` variants |

### Story update (every migrated component)

- Confirm CSF3 format: `Meta<typeof Component>` + `StoryObj<typeof Component>`
- Add missing states exposed by migration (e.g. Button `ariaLabel` prop story)
- Run `yarn storybook` to visually verify before marking done

### Specs (Autocomplete, Select, Toggle, Pagination)

Cover per component:
- Keyboard navigation (arrow keys, Enter, Escape, Tab)
- ARIA attribute correctness (aria-selected, aria-expanded, aria-checked, etc.)
- Error and disabled states
- Accessibility: confirm `aria-label` / `aria-labelledby` is present and correct

Test conventions:
- `mount()` not `shallowMount()`
- `setActivePinia(createPinia())` in `beforeEach` if Pinia is used
- Colocate spec next to source file: `ComponentName.spec.ts`

### Quality gate

After **every component**:
```bash
yarn build && yarn lint && yarn type-check
```

After **all waves complete**:
```bash
yarn quality
```

---

## 4. Definition of Done

### Codebase state
- `src/components/ui/` directory deleted; no codebase imports reference it
- Zero `.ts` companion files remain in `src/modules/ui/components/`
- All 14 components processed (12 migrations + 2 a11y-only)
- Every component uses `<script setup lang="ts">` with no `defineComponent()`

### Accessibility
- `Toggle` uses `aria-labelledby` instead of `<label>` wrapping a `<button>`
- `Button` exposes `ariaLabel` prop for icon-only usage
- `Autocomplete` `aria-selected` reflects actual selection; `minCharsText` is a prop
- `Pagination` ellipsis buttons have descriptive `aria-label`
- `Toast` and `InfoBanner` have no conflicting `role` + `aria-live` pairs

### Quality
- `yarn quality` passes (build → lint → type-check → format:check → test → build-storybook)
- Specs exist and pass for: Autocomplete, Select, Toggle, Pagination
- Every migrated component has an updated `.stories.ts`

---

## 5. Out of Scope

- Select multiple: token/chip display for selected items (P3 UX — separate initiative)
- Pagination ellipsis visual affordance improvements (P3 UX — separate initiative)
- Any component outside `src/modules/ui/components/` (feature module components)
