# Prompt: Create a New UI Component

Use this prompt when asking an AI agent or developer to create a new UI component from scratch.

---

## Instructions

Create a new Vue 3 UI component named `[ComponentName]` following project conventions.

### Steps

See [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md) — Creating a Component (End-to-End) for full details. Summary:

1. Define Props and Emits interfaces (in `.vue` or shared types)
2. Create `ComponentName.vue` with `<script setup>`, `defineProps`, `defineEmits`, design tokens only
3. Create `ComponentName.stories.ts` (CSF3, Default, Variants, States when applicable)
4. Export from `src/modules/ui/components/index.ts` if UI component
5. Optional: Add `.spec.ts` for complex behavior

### Canonical references

- Component structure: [InfoBanner](../../src/modules/ui/components/InfoBanner/InfoBanner.vue), [Section](../../src/modules/ui/components/Section/Section.vue)
- Story structure: [InfoBanner.stories.ts](../../src/modules/ui/components/InfoBanner/InfoBanner.stories.ts)

### Do NOT

- Use Options API or `defineComponent`
- Use Button or Card as templates (they are legacy)
- Use magic numbers in Tailwind (e.g. `text-[13px]`); use design scale (`text-sm`)
