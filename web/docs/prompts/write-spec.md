# Prompt: Write Unit Test for Composable or Store

Use this prompt when asking an AI agent or developer to add or write a unit test for a Vue 3 composable or Pinia store.

---

## Instructions

Create or extend a `.spec.ts` file for the composable or store at `[path/to/useXxx.ts or path/to/useXxxStore.ts]`.

### Steps (from [FRONTEND_CONVENTIONS.md](../FRONTEND_CONVENTIONS.md))

1. **Composables:** Use `createApp` + `defineComponent` or `@vue/test-utils` `mount`. Prefer `mount` for integration tests.
2. **Pinia stores:** Call `setActivePinia(createPinia())` in `beforeEach` so each test gets a fresh store instance.
3. **Component tests:** Use `@vue/test-utils` `mount()` for integration tests; prefer over `shallowMount`. Use `shallowMount()` only when child components cause side effects (API calls, complex DOM) that block the test.
4. **Mocks:** When the composable/store depends on API, token storage, or other services, use `vi.mock()` to isolate the unit under test.
5. **File location:** Colocate `ComponentName.spec.ts` next to the component, or `useXxx.spec.ts` next to the composable. Store specs: `useXxxStore.spec.ts` next to the store or in `tests/<feature>/stores/`.

### Canonical references

- Composable: [tests/home/composables/useGreeting.spec.ts](../../tests/home/composables/useGreeting.spec.ts) — composable with createApp + defineComponent, vi.useFakeTimers
- Store: [tests/auth/stores/authStore.spec.ts](../../tests/auth/stores/authStore.spec.ts) — Pinia store with setActivePinia, vi.mock for dependencies

### Example: Composable spec

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createApp, defineComponent, h, ref } from 'vue';
import { useMyComposable } from '@/modules/feature/composables/useMyComposable';

describe('useMyComposable', () => {
  const mountComposable = () => {
    const app = createApp(
      defineComponent({
        setup() {
          const result = useMyComposable();
          return () => h('span', result.value);
        },
      })
    );
    const el = document.createElement('div');
    document.body.appendChild(el);
    app.mount(el);
    return { el, unmount: () => { app.unmount(); el.remove(); } };
  };

  it('returns expected value', () => {
    const { el, unmount } = mountComposable();
    expect(el.textContent).toBe('expected');
    unmount();
  });
});
```

### Example: Store spec

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useMyStore } from '@/modules/feature/stores/useMyStore';

describe('useMyStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with correct default values', () => {
    const store = useMyStore();
    expect(store.items).toEqual([]);
    expect(store.loading).toBe(false);
  });
});
```

### Do NOT

- Forget `setActivePinia(createPinia())` for Pinia store tests.
- Use real API calls; mock with `vi.mock()`.
- Mix multiple concerns in one spec file.
