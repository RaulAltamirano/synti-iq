# ADR 001: Composition API, Pinia, Vitest

## Status

Accepted.

## Context

Synti-IQ Web is a Vue 3 frontend. We needed to choose:

- **Component API:** Options API vs Composition API (`<script setup>`)
- **State management:** Vuex vs Pinia
- **Testing:** Jest vs Vitest
- **Storybook:** CSF2 vs CSF3

## Decision

We adopt:

1. **Vue 3 Composition API with `<script setup>`** for all new components. Options API and `defineComponent` are not used for new code. Legacy components (Button, Card, Input) may remain on Options API until migrated.
2. **Pinia** for global and cross-route state. Vuex is not used.
3. **Vitest** for unit and component tests. Jest is not used for new tests.
4. **Storybook CSF3** (`Meta<typeof Component>`, `StoryObj<typeof Component>`) for all stories.

## Consequences

- **Composition API:** Better TypeScript inference, less boilerplate, clearer separation of concerns. Developers and AI agents must follow `defineProps<Props>()`, `defineEmits<...>()`, and `storeToRefs` patterns documented in [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md).
- **Pinia:** Simpler API, full TypeScript support, modular stores. No Vuex patterns.
- **Vitest:** Vite-native, fast, compatible with ESM. Replaces Jest in the testing stack.
- **CSF3:** Type-safe stories, consistent structure. All new stories must use CSF3 format.

## References

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Pinia](https://pinia.vuejs.org/)
- [Vitest](https://vitest.dev/)
- [Storybook CSF3](https://storybook.js.org/docs/api/csf)
- [docs/FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md)
