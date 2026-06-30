# Prompt: Fix TypeScript Errors

Use this prompt when asking an AI agent or developer to fix TypeScript errors in a Vue 3 / TypeScript codebase.

---

## Instructions

Fix TypeScript errors in `[path/to/file.ts or ComponentName.vue]` following project conventions.

### Constraints (from [AGENTS.md](../../AGENTS.md))

- **No `any`** in components, composables, or stores. Use concrete types or `Record<string, unknown>` when necessary.
- **All refs typed:** `ref<Type>()` not `ref(value)` without type when type is non-inferred.
- **Props and emits:** Define via interfaces with `defineProps<Props>()` and `defineEmits<{ eventName: [payload?: Type] }>()`.
- **Imports:** Use `@/` alias for imports from src.

### Steps

1. Read the file with errors.
2. Replace `any` with concrete types or `Record<string, unknown>`.
3. Add explicit types to refs: `ref<SomeType>()`.
4. Ensure props and emits use interfaces.
5. Verify: `yarn type-check` and `yarn build` pass.

### Canonical references

- [InfoBanner.vue](../../src/modules/ui/components/InfoBanner/InfoBanner.vue) — typed props and emits
- [useGreeting.ts](../../src/modules/home/composables/useGreeting.ts) — typed composable return

### Do NOT

- Use `any` as a quick fix.
- Use `as unknown as Type` unless strictly necessary for library boundaries.
- Add `// @ts-ignore` without a justified comment.
