# UI Audit Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all accessibility issues and migrate 12 UI components from Options API to `<script setup lang="ts">`, one atomic commit per component.

**Architecture:** Each task is self-contained — migrate the `.vue`, update the barrel `index.ts`, delete the `.ts` companion, run the quality gate, update stories. Specs are added for Toggle, Select, Autocomplete, and Pagination using TDD (write failing test → implement → verify green).

**Tech Stack:** Vue 3, TypeScript, Vitest + @vue/test-utils, Tailwind v4, Storybook CSF3, FontAwesome

---

## File Map

| Task | Files Modified | Files Deleted | Files Created |
|------|---------------|---------------|---------------|
| 0 | — | `src/components/ui/` (whole dir) | — |
| 1 | `src/modules/ui/components/Toast/Toast.vue` | — | — |
| 2 | `src/modules/ui/components/InfoBanner/InfoBanner.vue` | — | — |
| 3 | `Spinner.vue`, `index.ts` | `Spinner.ts` | — |
| 4 | `Skeleton.vue`, `index.ts` | `Skeleton.ts` | — |
| 5 | `Avatar.vue`, `index.ts` | `Avatar.ts` | — |
| 6 | `Badge.vue`, `index.ts` | `Badge.ts` | — |
| 7 | `RoleIcon.vue`, `index.ts` | `RoleIcon.ts` | — |
| 8 | `Toggle.vue`, `index.ts`, `Toggle.stories.ts` | `Toggle.ts` | `Toggle.spec.ts` |
| 9 | `Textarea.vue`, `index.ts` | `Textarea.ts` | — |
| 10 | `Input.vue`, `index.ts` | `Input.ts` | — |
| 11 | `Card.vue`, `index.ts` | `Card.ts` | — |
| 12 | `Select.vue`, `index.ts` | `Select.ts` | `Select.spec.ts` |
| 13 | `Autocomplete.vue`, `index.ts` | `Autocomplete.ts` | `Autocomplete.spec.ts` |
| 14 | `Pagination.vue`, `index.ts` | `Pagination.ts` | `Pagination.spec.ts` |
| 15 | `Button.vue`, `Button.stories.ts`, `index.ts` | `Button.ts` | — |
| 16 | `Stepper.vue`, `index.ts` | `Stepper.ts` | — |
| 17 | — | — | — |

All paths under `src/modules/ui/components/<Name>/`.

---

## Task 0: Delete src/components/ui/

**Files:**
- Delete: `src/components/ui/` (entire directory)

- [ ] **Step 1: Verify no live imports**

```bash
grep -r "components/ui" src/ --include="*.ts" --include="*.vue" | grep -v "modules/ui"
```

Expected: no output. If any imports appear, fix them before proceeding to step 2.

- [ ] **Step 2: Delete the directory**

```bash
rm -rf src/components/ui
```

- [ ] **Step 3: Verify build still passes**

```bash
yarn build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove broken src/components/ui prototype directory"
```

---

## Task 1: A11y Fix — Toast

**Files:**
- Modify: `src/modules/ui/components/Toast/Toast.vue:61`

The `role="alert"` already implies `aria-live="assertive"`. The explicit `aria-live="polite"` overrides this and weakens it. Remove it.

- [ ] **Step 1: Edit Toast.vue**

Find line 61 in `src/modules/ui/components/Toast/Toast.vue`:

```html
<div :class="barClasses" role="alert" aria-live="polite">
```

Change it to:

```html
<div :class="barClasses" role="alert">
```

- [ ] **Step 2: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/modules/ui/components/Toast/Toast.vue
git commit -m "fix(a11y): remove aria-live conflict on Toast role=alert"
```

---

## Task 2: A11y Fix — InfoBanner

**Files:**
- Modify: `src/modules/ui/components/InfoBanner/InfoBanner.vue`

`role="alert"` (used for error variant) already implies `aria-live="assertive"`. Keeping `aria-live="polite"` on the same element overrides it. The fix: make `aria-live` conditional — use it only when `role="status"` (non-error variants).

- [ ] **Step 1: Edit InfoBanner.vue**

Find the opening `<div>` on line 2:

```html
<div :role="bannerRole" aria-live="polite" :class="bannerClasses">
```

Change it to:

```html
<div :role="bannerRole" :aria-live="bannerRole === 'status' ? 'polite' : undefined" :class="bannerClasses">
```

- [ ] **Step 2: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/modules/ui/components/InfoBanner/InfoBanner.vue
git commit -m "fix(a11y): make aria-live conditional on InfoBanner to avoid role=alert conflict"
```

---

## Task 3: Migrate Spinner

**Files:**
- Modify: `src/modules/ui/components/Spinner/Spinner.vue`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/Spinner/Spinner.ts`

Spinner exports a runtime constant `SPINNER_COLOR_VALUES` that the barrel re-exports. This requires the dual-script pattern: a `<script>` block for module-level exports plus `<script setup>` for the component.

- [ ] **Step 1: Replace Spinner.vue entirely**

```vue
<script lang="ts">
import type { ComponentSize } from '../../types/component.types';

export const SPINNER_COLOR_VALUES = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
  'inherit',
] as const;

export type SpinnerColor = (typeof SPINNER_COLOR_VALUES)[number];
export type SpinnerVariant = 'spinner' | 'dots' | 'pulse';

export interface SpinnerProps {
  variant?: SpinnerVariant;
  size?: ComponentSize;
  color?: SpinnerColor;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import type { ComponentSize } from '../../types/component.types';

const props = withDefaults(defineProps<SpinnerProps>(), {
  variant: 'spinner',
  size: 'md',
  color: 'primary',
});

const spinnerClasses = computed(() => {
  const sizeClasses: Record<ComponentSize, string[]> = {
    xs: ['w-3', 'h-3'],
    sm: ['w-4', 'h-4'],
    md: ['w-6', 'h-6'],
    lg: ['w-8', 'h-8'],
    xl: ['w-12', 'h-12'],
  };
  const colorClasses: Record<SpinnerColor, string[]> = {
    primary: ['text-primary', 'border-primary'],
    secondary: ['text-gray-600', 'border-gray-600', 'dark:text-gray-400', 'dark:border-gray-400'],
    success: ['text-success', 'border-success'],
    warning: ['text-warning', 'border-warning'],
    error: ['text-error', 'border-error'],
    info: ['text-info', 'border-info'],
    inherit: ['text-inherit'],
  };
  return ['inline-block', ...sizeClasses[props.size], ...colorClasses[props.color]];
});

const dotsClasses = computed(() => {
  const sizeClasses: Record<ComponentSize, string[]> = {
    xs: ['gap-0.5'],
    sm: ['gap-1'],
    md: ['gap-1.5'],
    lg: ['gap-2'],
    xl: ['gap-2.5'],
  };
  const colorClasses: Record<SpinnerColor, string[]> = {
    primary: ['text-primary'],
    secondary: ['text-gray-600', 'dark:text-gray-400'],
    success: ['text-success'],
    warning: ['text-warning'],
    error: ['text-error'],
    info: ['text-info'],
    inherit: ['text-inherit'],
  };
  return ['inline-flex', 'gap-1', ...sizeClasses[props.size], ...colorClasses[props.color]];
});

const dotSizeClasses = computed(() => {
  const sizeClasses: Record<ComponentSize, string[]> = {
    xs: ['w-1', 'h-1'],
    sm: ['w-1.5', 'h-1.5'],
    md: ['w-2', 'h-2'],
    lg: ['w-2.5', 'h-2.5'],
    xl: ['w-3', 'h-3'],
  };
  return sizeClasses[props.size];
});

const pulseClasses = computed(() => {
  const sizeClasses: Record<ComponentSize, string[]> = {
    xs: ['w-3', 'h-3'],
    sm: ['w-4', 'h-4'],
    md: ['w-6', 'h-6'],
    lg: ['w-8', 'h-8'],
    xl: ['w-12', 'h-12'],
  };
  const colorClasses: Record<SpinnerColor, string[]> = {
    primary: ['bg-primary'],
    secondary: ['bg-gray-600', 'dark:bg-gray-400'],
    success: ['bg-success'],
    warning: ['bg-warning'],
    error: ['bg-error'],
    info: ['bg-info'],
    inherit: ['bg-current'],
  };
  return ['rounded-full', 'animate-pulse', ...sizeClasses[props.size], ...colorClasses[props.color]];
});

const getAnimationDelay = (index: number) => `${(index - 1) * 0.15}s`;
</script>

<template>
  <!-- Spinner Variant -->
  <svg
    v-if="variant === 'spinner'"
    :class="spinnerClasses"
    class="animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-label="Loading"
    role="status"
  >
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>

  <!-- Dots Variant -->
  <div v-else-if="variant === 'dots'" :class="dotsClasses" aria-label="Loading" role="status">
    <span
      v-for="i in 3"
      :key="i"
      :class="[dotSizeClasses, 'rounded-full', 'bg-current', 'animate-bounce']"
      :style="{ animationDelay: getAnimationDelay(i) }"
    />
  </div>

  <!-- Pulse Variant -->
  <div v-else-if="variant === 'pulse'" :class="pulseClasses" aria-label="Loading" role="status" />
</template>
```

- [ ] **Step 2: Update index.ts barrel** (lines 38-39)

Find:
```ts
export type { SpinnerColor, SpinnerProps, SpinnerVariant } from './Spinner/Spinner.ts';
export { SPINNER_COLOR_VALUES } from './Spinner/Spinner.ts';
```

Replace with:
```ts
export type { SpinnerColor, SpinnerProps, SpinnerVariant } from './Spinner/Spinner.vue';
export { SPINNER_COLOR_VALUES } from './Spinner/Spinner.vue';
```

- [ ] **Step 3: Delete Spinner.ts**

```bash
rm src/modules/ui/components/Spinner/Spinner.ts
```

- [ ] **Step 4: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/modules/ui/components/Spinner/ src/modules/ui/components/index.ts
git commit -m "refactor(ui): migrate Spinner to script setup"
```

---

## Task 4: Migrate Skeleton

**Files:**
- Modify: `src/modules/ui/components/Skeleton/Skeleton.vue`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/Skeleton/Skeleton.ts`

- [ ] **Step 1: Replace Skeleton.vue entirely**

```vue
<script setup lang="ts">
import { computed } from 'vue';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: SkeletonVariant;
  class?: string;
}

const props = withDefaults(defineProps<SkeletonProps>(), {
  variant: 'rectangular',
});

const toCssValue = (v: string | number): string =>
  typeof v === 'number' ? `${v}px` : /^\d+$/.test(String(v)) ? `${v}px` : String(v);

const style = computed(() => {
  const s: Record<string, string> = {};
  if (props.width !== undefined) s.width = toCssValue(props.width);
  if (props.height !== undefined) s.height = toCssValue(props.height);
  return s;
});

const variantClasses = computed(() => {
  const base = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  const variantMap: Record<SkeletonVariant, string> = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };
  return `${base} ${variantMap[props.variant]}`;
});
</script>

<template>
  <div
    :class="[variantClasses, $props.class]"
    :style="Object.keys(style).length ? style : undefined"
    aria-hidden="true"
  />
</template>
```

- [ ] **Step 2: Update index.ts barrel**

Find:
```ts
export type { SkeletonProps, SkeletonVariant } from './Skeleton/Skeleton.ts';
```

Replace with:
```ts
export type { SkeletonProps, SkeletonVariant } from './Skeleton/Skeleton.vue';
```

- [ ] **Step 3: Delete Skeleton.ts**

```bash
rm src/modules/ui/components/Skeleton/Skeleton.ts
```

- [ ] **Step 4: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/ui/components/Skeleton/ src/modules/ui/components/index.ts
git commit -m "refactor(ui): migrate Skeleton to script setup"
```

---

## Task 5: Migrate Avatar

**Files:**
- Modify: `src/modules/ui/components/Avatar/Avatar.vue`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/Avatar/Avatar.ts`

- [ ] **Step 1: Replace Avatar.vue entirely**

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { ComponentSize } from '../../types/component.types';
import { generateAvatarColor } from '../../../shared/utils/avatarColor';

export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';
export type AvatarSize = ComponentSize | '2xl';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  icon?: string | string[];
  size?: AvatarSize;
  status?: AvatarStatus;
  statusPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  rounded?: boolean;
  bgColor?: string;
  colorSeed?: string;
}

const props = withDefaults(defineProps<AvatarProps>(), {
  src: '',
  alt: '',
  name: '',
  icon: undefined,
  size: 'md',
  status: undefined,
  statusPosition: 'bottom-right',
  rounded: true,
  bgColor: '',
  colorSeed: '',
});

const wrapperSizeClasses: Record<AvatarSize, string[]> = {
  xs: ['w-6', 'h-6'],
  sm: ['w-8', 'h-8'],
  md: ['w-10', 'h-10'],
  lg: ['w-12', 'h-12'],
  xl: ['w-16', 'h-16'],
  '2xl': ['w-32', 'h-32'],
};

const initials = computed(() => {
  if (!props.name) return '';
  const parts = props.name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
});

const wrapperClasses = computed(() => [
  'relative', 'inline-flex', 'flex-shrink-0',
  ...wrapperSizeClasses[props.size],
  props.rounded ? 'rounded-full' : 'rounded-lg',
]);

const avatarClasses = computed(() => {
  const textSizeClasses: Record<AvatarSize, string> = {
    xs: 'text-xs', sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl', '2xl': 'text-4xl',
  };
  return [
    'w-full', 'h-full', 'inline-flex', 'items-center', 'justify-center',
    'bg-gray-200', 'text-gray-600', 'dark:bg-gray-700', 'dark:text-gray-300',
    'font-medium', 'overflow-hidden',
    props.rounded ? 'rounded-full' : 'rounded-lg',
    textSizeClasses[props.size],
  ];
});

const statusClasses = computed(() => {
  if (!props.status) return [];
  const statusColorClasses = {
    online: ['bg-success'], offline: ['bg-gray-400'], away: ['bg-warning'], busy: ['bg-error'],
  };
  const statusSizeClasses: Record<AvatarSize, string[]> = {
    xs: ['w-2', 'h-2'], sm: ['w-2.5', 'h-2.5'], md: ['w-3.5', 'h-3.5'],
    lg: ['w-4', 'h-4'], xl: ['w-4', 'h-4'], '2xl': ['w-5', 'h-5'],
  };
  const positionClasses = {
    'top-right': ['top-0', 'right-0'], 'top-left': ['top-0', 'left-0'],
    'bottom-right': ['bottom-0', 'right-0'], 'bottom-left': ['bottom-0', 'left-0'],
  };
  return [
    'absolute', 'z-10', 'border-2', 'border-white', 'dark:border-gray-800', 'rounded-full',
    ...statusColorClasses[props.status],
    ...statusSizeClasses[props.size],
    ...positionClasses[props.statusPosition],
  ];
});

const avatarStyle = computed(() => {
  if (props.bgColor) return { backgroundColor: props.bgColor, color: '#ffffff' };
  if (props.colorSeed) return { backgroundColor: generateAvatarColor(props.colorSeed), color: '#ffffff' };
  return {};
});
</script>

<template>
  <div :class="wrapperClasses">
    <div :class="avatarClasses" :style="avatarStyle">
      <img v-if="src" :src="src" :alt="alt || name || 'Avatar'" class="w-full h-full object-cover" />
      <FontAwesomeIcon v-else-if="icon" :icon="icon" class="h-1/2 w-1/2" />
      <span v-else-if="name && initials">{{ initials }}</span>
      <FontAwesomeIcon v-else icon="user" class="h-1/2 w-1/2" />
    </div>
    <span v-if="status" :class="statusClasses" :aria-label="`Status: ${status}`" />
  </div>
</template>
```

- [ ] **Step 2: Update index.ts barrel**

Find:
```ts
export type { AvatarProps, AvatarStatus, AvatarSize } from './Avatar/Avatar.ts';
```

Replace with:
```ts
export type { AvatarProps, AvatarStatus, AvatarSize } from './Avatar/Avatar.vue';
```

- [ ] **Step 3: Delete Avatar.ts**

```bash
rm src/modules/ui/components/Avatar/Avatar.ts
```

- [ ] **Step 4: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/ui/components/Avatar/ src/modules/ui/components/index.ts
git commit -m "refactor(ui): migrate Avatar to script setup"
```

---

## Task 6: Migrate Badge

**Files:**
- Modify: `src/modules/ui/components/Badge/Badge.vue`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/Badge/Badge.ts`

- [ ] **Step 1: Replace Badge.vue entirely**

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { ComponentSize } from '../../types/component.types';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: ComponentSize;
  icon?: string | string[];
  dot?: boolean;
}

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'default',
  size: 'md',
  icon: undefined,
  dot: false,
});

const badgeClasses = computed(() => {
  const baseClasses = ['inline-flex', 'items-center', 'justify-center', 'font-medium', 'rounded-full', 'transition-colors'];
  const sizeClasses: Record<ComponentSize, string[]> = {
    xs: ['text-xs', 'px-1.5', 'py-0.5', 'gap-1'],
    sm: ['text-xs', 'px-2', 'py-0.5', 'gap-1'],
    md: ['text-sm', 'px-2.5', 'py-1', 'gap-1.5'],
    lg: ['text-base', 'px-3', 'py-1.5', 'gap-2'],
    xl: ['text-lg', 'px-4', 'py-2', 'gap-2'],
  };
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200',
    error: 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200',
    info: 'bg-info-100 text-info-800 dark:bg-info-900 dark:text-info-200',
  };
  const dotBgOnly: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 dark:bg-gray-700',
    success: 'bg-success-100 dark:bg-success-900',
    warning: 'bg-warning-100 dark:bg-warning-900',
    error: 'bg-error-100 dark:bg-error-900',
    info: 'bg-info-100 dark:bg-info-900',
  };

  if (props.dot) {
    return [...baseClasses, 'w-2', 'h-2', 'p-0', 'rounded-full', ...dotBgOnly[props.variant].split(/\s+/)];
  }
  return [...baseClasses, ...sizeClasses[props.size], ...variantClasses[props.variant].split(/\s+/)];
});
</script>

<template>
  <span :class="badgeClasses">
    <FontAwesomeIcon v-if="icon && !dot" :icon="icon" class="h-3 w-3" aria-hidden="true" />
    <span v-if="!dot">
      <slot />
    </span>
  </span>
</template>
```

- [ ] **Step 2: Update index.ts barrel**

Find:
```ts
export type { BadgeProps, BadgeVariant } from './Badge/Badge.ts';
```

Replace with:
```ts
export type { BadgeProps, BadgeVariant } from './Badge/Badge.vue';
```

- [ ] **Step 3: Delete Badge.ts**

```bash
rm src/modules/ui/components/Badge/Badge.ts
```

- [ ] **Step 4: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/ui/components/Badge/ src/modules/ui/components/index.ts
git commit -m "refactor(ui): migrate Badge to script setup"
```

---

## Task 7: Migrate RoleIcon (types only — already uses script setup)

**Files:**
- Modify: `src/modules/ui/components/RoleIcon/RoleIcon.vue`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/RoleIcon/RoleIcon.ts`

`RoleIcon.vue` already uses `<script setup>`. The `.ts` file only holds exported types. Move them into the `.vue`.

- [ ] **Step 1: Add exports to RoleIcon.vue**

At the top of the `<script setup lang="ts">` block in `RoleIcon.vue`, add the two exported types (before the existing imports):

```ts
import type { ComponentSize } from '../../types/component.types';

export type RoleIconSize = Extract<ComponentSize, 'sm' | 'md' | 'lg'> | 'xl';

export interface RoleIconProps {
  role?: string;
  size?: RoleIconSize;
  showLabel?: boolean;
}
```

These go at the top of the existing `<script setup lang="ts">` block, before `import { computed, useId } from 'vue'`. The local `interface Props` can be removed — replace its usage with `RoleIconProps`:

Change:
```ts
interface Props {
  role?: string;
  size?: RoleIconSize;
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
```

To:
```ts
const props = withDefaults(defineProps<RoleIconProps>(), {
```

- [ ] **Step 2: Update index.ts barrel**

Find:
```ts
export type { RoleIconProps, RoleIconSize } from './RoleIcon/RoleIcon.ts';
```

Replace with:
```ts
export type { RoleIconProps, RoleIconSize } from './RoleIcon/RoleIcon.vue';
```

- [ ] **Step 3: Delete RoleIcon.ts**

```bash
rm src/modules/ui/components/RoleIcon/RoleIcon.ts
```

- [ ] **Step 4: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/ui/components/RoleIcon/ src/modules/ui/components/index.ts
git commit -m "refactor(ui): move RoleIcon types into vue file, delete companion ts"
```

---

## Task 8: Migrate Toggle + A11y Fix + Spec

**Files:**
- Modify: `src/modules/ui/components/Toggle/Toggle.vue`
- Modify: `src/modules/ui/components/Toggle/Toggle.stories.ts`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/Toggle/Toggle.ts`
- Create: `src/modules/ui/components/Toggle/Toggle.spec.ts`

**A11y fix:** Replace `<label>` wrapper with `<div>`. The `<button role="switch">` already uses `aria-labelledby` — so the label is accessible. Wrapping a `<button>` in `<label>` is semantically invalid.

- [ ] **Step 1: Write the failing spec**

Create `src/modules/ui/components/Toggle/Toggle.spec.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Toggle from './Toggle.vue';

describe('Toggle', () => {
  it('does not use <label> as wrapper — buttons must not be wrapped in labels', () => {
    const wrapper = mount(Toggle, { props: { modelValue: false, label: 'Enable' } });
    expect(wrapper.find('label').exists()).toBe(false);
  });

  it('button aria-labelledby points to the label span id when label is given', () => {
    const wrapper = mount(Toggle, { props: { modelValue: false, label: 'Enable notifications' } });
    const span = wrapper.find('[id]');
    const button = wrapper.find('[role="switch"]');
    expect(span.exists()).toBe(true);
    expect(button.attributes('aria-labelledby')).toBe(span.attributes('id'));
  });

  it('uses aria-label="Toggle" when no label prop is provided', () => {
    const wrapper = mount(Toggle, { props: { modelValue: false } });
    const button = wrapper.find('[role="switch"]');
    expect(button.attributes('aria-label')).toBe('Toggle');
    expect(button.attributes('aria-labelledby')).toBeUndefined();
  });

  it('emits update:modelValue with toggled value on click', async () => {
    const wrapper = mount(Toggle, { props: { modelValue: false } });
    await wrapper.find('[role="switch"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]]);
  });

  it('does not emit when disabled', async () => {
    const wrapper = mount(Toggle, { props: { modelValue: false, disabled: true } });
    await wrapper.find('[role="switch"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('reflects modelValue in aria-checked', () => {
    const wrapper = mount(Toggle, { props: { modelValue: true } });
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('true');
  });
});
```

- [ ] **Step 2: Run spec — expect failures**

```bash
yarn test --reporter=verbose src/modules/ui/components/Toggle/Toggle.spec.ts
```

Expected: "does not use label" test fails (because current template uses `<label>`).

- [ ] **Step 3: Replace Toggle.vue entirely**

```vue
<script setup lang="ts">
import { computed, useId } from 'vue';
import type { ComponentSize } from '../../types/component.types';

export interface ToggleProps {
  modelValue: boolean;
  disabled?: boolean;
  size?: ComponentSize;
  label?: string;
  labelPosition?: 'left' | 'right';
}

const props = withDefaults(defineProps<ToggleProps>(), {
  disabled: false,
  size: 'md',
  label: '',
  labelPosition: 'right',
});

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const labelId = useId();
const switchAriaLabelledby = computed(() => (props.label ? labelId : undefined));
const switchAriaLabel = computed(() => (props.label ? undefined : 'Toggle'));

const toggle = () => {
  if (!props.disabled) emit('update:modelValue', !props.modelValue);
};

const sizeConfig = computed(() => {
  const configs: Record<ComponentSize, { track: string; thumb: string; translate: string; text: string }> = {
    xs: { track: 'w-6 h-3', thumb: 'w-2.5 h-2.5', translate: 'translate-x-3', text: 'text-xs' },
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4', text: 'text-sm' },
    md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5', text: 'text-base' },
    lg: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6', text: 'text-lg' },
    xl: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7', text: 'text-xl' },
  };
  return configs[props.size];
});

const trackClasses = computed(() => {
  const base = [
    'relative', 'inline-flex', 'items-center', 'rounded-full',
    'transition-colors', 'duration-200', 'ease-in-out',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-primary',
    sizeConfig.value.track,
    props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    props.modelValue ? 'bg-primary dark:bg-primary' : 'bg-gray-300 dark:bg-gray-600',
  ];
  return base;
});

const thumbClasses = computed(() => [
  'absolute', 'left-0.5', 'inline-block', 'rounded-full', 'bg-white', 'shadow',
  'transform', 'transition-transform', 'duration-200', 'ease-in-out',
  sizeConfig.value.thumb,
  props.modelValue ? sizeConfig.value.translate : '',
]);

const labelClasses = computed(() => [
  sizeConfig.value.text,
  'select-none',
  props.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300',
]);
</script>

<template>
  <div
    class="inline-flex items-center gap-2"
    :class="{ 'cursor-not-allowed': disabled, 'cursor-pointer': !disabled }"
  >
    <span v-if="label && labelPosition === 'left'" :id="labelId" :class="labelClasses">
      {{ label }}
    </span>

    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-labelledby="switchAriaLabelledby"
      :aria-label="switchAriaLabel"
      :disabled="disabled"
      :class="trackClasses"
      @click="toggle"
    >
      <span :class="thumbClasses" />
    </button>

    <span v-if="label && labelPosition === 'right'" :id="labelId" :class="labelClasses">
      {{ label }}
    </span>
  </div>
</template>
```

- [ ] **Step 4: Run spec — expect all pass**

```bash
yarn test --reporter=verbose src/modules/ui/components/Toggle/Toggle.spec.ts
```

Expected: all 6 tests pass.

- [ ] **Step 5: Update index.ts barrel**

Find:
```ts
export type { ToggleProps } from './Toggle/Toggle.ts';
```

Replace with:
```ts
export type { ToggleProps } from './Toggle/Toggle.vue';
```

- [ ] **Step 6: Delete Toggle.ts**

```bash
rm src/modules/ui/components/Toggle/Toggle.ts
```

- [ ] **Step 7: Verify full build**

```bash
yarn build && yarn lint && yarn type-check
```

- [ ] **Step 8: Commit**

```bash
git add src/modules/ui/components/Toggle/ src/modules/ui/components/index.ts
git commit -m "fix(a11y)+refactor(ui): migrate Toggle to script setup, replace label wrapper with div"
```

---

## Task 9: Migrate Textarea

**Files:**
- Modify: `src/modules/ui/components/Textarea/Textarea.vue`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/Textarea/Textarea.ts`

- [ ] **Step 1: Replace Textarea.vue entirely**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  FIELD_HELPER_CLASSES,
  FIELD_LABEL_CLASSES,
  type ComponentSize,
} from '../../types/component.types';
import { createFieldFallbackId } from '../../utils/field-id';

export interface TextareaProps {
  modelValue: string;
  size?: ComponentSize;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  rows?: number;
  fullWidth?: boolean;
  name?: string;
  id?: string;
  maxlength?: number;
}

const props = withDefaults(defineProps<TextareaProps>(), {
  modelValue: '',
  size: 'md',
  disabled: false,
  readonly: false,
  placeholder: '',
  label: '',
  helperText: '',
  error: false,
  errorMessage: '',
  required: false,
  rows: 3,
  fullWidth: false,
  name: '',
  id: '',
  maxlength: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  input: [event: Event];
  change: [event: Event];
}>();

const fallbackFieldId = createFieldFallbackId('textarea');
const isFocused = ref(false);

const textareaClasses = computed(() => {
  const baseClasses = [
    'w-full', 'rounded-lg', 'border', 'transition-all', 'duration-200',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-1',
    'focus:ring-offset-white', 'dark:focus:ring-offset-0',
    'disabled:opacity-50', 'disabled:cursor-not-allowed', 'readonly:cursor-default', 'resize-y',
  ];
  const sizeClasses: Record<ComponentSize, string[]> = {
    xs: ['text-xs', 'px-2', 'py-1'],
    sm: ['text-sm', 'px-3', 'py-1.5'],
    md: ['text-base', 'px-4', 'py-2'],
    lg: ['text-lg', 'px-5', 'py-2.5'],
    xl: ['text-xl', 'px-6', 'py-3'],
  };
  if (props.error) {
    baseClasses.push('border-error', 'focus:ring-error/80', 'focus:border-error');
  } else if (isFocused.value) {
    baseClasses.push(
      'border-[var(--ui-focus-ring)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]',
    );
  } else {
    baseClasses.push(
      'border-[var(--ui-field-border)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]',
    );
  }
  baseClasses.push(
    'bg-[var(--ui-field-bg)]', 'text-[var(--ui-field-text)]',
    'placeholder:text-[var(--ui-field-placeholder)]',
  );
  return [...baseClasses, ...sizeClasses[props.size], props.fullWidth && 'w-full'].filter(Boolean);
});

const containerClasses = computed(() => [props.fullWidth && 'w-full'].filter(Boolean));

const fieldId = computed(() => props.id || props.name || fallbackFieldId);
const helpId = computed(() => `${fieldId.value}-help`);
const errorId = computed(() => `${fieldId.value}-error`);
const ariaDescribedBy = computed(() => {
  const parts: string[] = [];
  if (props.helperText && !props.error) parts.push(helpId.value);
  if (props.error && props.errorMessage) parts.push(errorId.value);
  return parts.length ? parts.join(' ') : undefined;
});

const labelClasses = FIELD_LABEL_CLASSES;
const helperTextClasses = FIELD_HELPER_CLASSES;

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
  emit('input', event);
};
const handleChange = (event: Event) => emit('change', event);
const handleFocus = (event: FocusEvent) => { isFocused.value = true; emit('focus', event); };
const handleBlur = (event: FocusEvent) => { isFocused.value = false; emit('blur', event); };
</script>

<template>
  <div :class="containerClasses">
    <label v-if="label" :for="fieldId" class="block text-sm font-medium mb-1" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-error ml-1" aria-hidden="true">*</span>
    </label>

    <textarea
      :id="fieldId"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :rows="rows"
      :maxlength="maxlength"
      :class="textareaClasses"
      :aria-invalid="error"
      :aria-describedby="ariaDescribedBy"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <p v-if="helperText && !error" :id="helpId" class="mt-1 text-sm" :class="helperTextClasses">
      {{ helperText }}
    </p>
    <p v-else-if="error && errorMessage" :id="errorId" class="mt-1 text-sm text-error" role="alert">
      {{ errorMessage }}
    </p>
  </div>
</template>
```

- [ ] **Step 2: Update index.ts barrel**

Find:
```ts
export type { TextareaProps } from './Textarea/Textarea.ts';
```

Replace with:
```ts
export type { TextareaProps } from './Textarea/Textarea.vue';
```

- [ ] **Step 3: Delete Textarea.ts**

```bash
rm src/modules/ui/components/Textarea/Textarea.ts
```

- [ ] **Step 4: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/ui/components/Textarea/ src/modules/ui/components/index.ts
git commit -m "refactor(ui): migrate Textarea to script setup"
```

---

## Task 10: Migrate Input

**Files:**
- Modify: `src/modules/ui/components/Input/Input.vue`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/Input/Input.ts`

- [ ] **Step 1: Replace Input.vue entirely**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  FIELD_HELPER_CLASSES,
  FIELD_ICON_CLASSES,
  FIELD_LABEL_CLASSES,
  type ComponentSize,
} from '../../types/component.types';
import { createFieldFallbackId } from '../../utils/field-id';

export interface InputProps {
  modelValue: string | number;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'time';
  size?: ComponentSize;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  prefixIcon?: string | string[];
  suffixIcon?: string | string[];
  fullWidth?: boolean;
  name?: string;
  id?: string;
  autocomplete?: string;
  maxlength?: number;
  min?: string | number;
  max?: string | number;
}

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: '',
  type: 'text',
  size: 'md',
  disabled: false,
  readonly: false,
  placeholder: '',
  label: '',
  helperText: '',
  error: false,
  errorMessage: '',
  required: false,
  prefixIcon: undefined,
  suffixIcon: undefined,
  fullWidth: false,
  name: '',
  id: '',
  autocomplete: '',
  maxlength: undefined,
  min: undefined,
  max: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  input: [event: Event];
  change: [event: Event];
}>();

const fallbackFieldId = createFieldFallbackId('input');
const isFocused = ref(false);
const showPassword = ref(false);

const inputType = computed(() => {
  if (props.type === 'password') return showPassword.value ? 'text' : 'password';
  return props.type;
});

const inputClasses = computed(() => {
  const baseClasses = [
    'w-full', 'rounded-lg', 'border', 'transition-all', 'duration-200',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-1',
    'focus:ring-offset-white', 'dark:focus:ring-offset-0', 'dark:focus:ring-offset-gray-950',
    'disabled:opacity-50', 'disabled:cursor-not-allowed', 'readonly:cursor-default',
  ];
  const sizeClasses: Record<ComponentSize, string[]> = {
    xs: ['text-xs', 'px-2', 'py-1'],
    sm: ['text-sm', 'px-3', 'py-1.5'],
    md: ['text-base', 'px-4', 'py-2'],
    lg: ['text-lg', 'px-5', 'py-2.5'],
    xl: ['text-xl', 'px-6', 'py-3'],
  };
  if (props.error) {
    baseClasses.push('border-error', 'focus:ring-error/80', 'focus:border-error');
  } else if (isFocused.value) {
    baseClasses.push(
      'border-[var(--ui-focus-ring)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]',
    );
  } else {
    baseClasses.push(
      'border-[var(--ui-field-border)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]',
    );
  }
  baseClasses.push(
    'bg-[var(--ui-field-bg)]', 'text-[var(--ui-field-text)]',
    'placeholder:text-[var(--ui-field-placeholder)]',
  );
  if (props.prefixIcon) baseClasses.push('pl-10');
  if (props.type === 'password') baseClasses.push('pr-12');
  else if (props.suffixIcon) baseClasses.push('pr-10');
  return [...baseClasses, ...sizeClasses[props.size], props.fullWidth && 'w-full'].filter(Boolean);
});

const containerClasses = computed(() => [props.fullWidth && 'w-full'].filter(Boolean));

const fieldId = computed(() => props.id || props.name || fallbackFieldId);
const helpId = computed(() => `${fieldId.value}-help`);
const errorId = computed(() => `${fieldId.value}-error`);
const ariaDescribedBy = computed(() => {
  const parts: string[] = [];
  if (props.helperText && !props.error) parts.push(helpId.value);
  if (props.error && props.errorMessage) parts.push(errorId.value);
  return parts.length ? parts.join(' ') : undefined;
});

const labelClasses = FIELD_LABEL_CLASSES;
const iconClasses = FIELD_ICON_CLASSES;
const passwordToggleClasses = 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300';
const helperTextClasses = FIELD_HELPER_CLASSES;

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
  emit('input', event);
};
const handleChange = (event: Event) => emit('change', event);
const handleFocus = (event: FocusEvent) => { isFocused.value = true; emit('focus', event); };
const handleBlur = (event: FocusEvent) => { isFocused.value = false; emit('blur', event); };
const togglePasswordVisibility = () => { showPassword.value = !showPassword.value; };
</script>

<template>
  <div :class="containerClasses">
    <label v-if="label" :for="fieldId" class="block text-sm font-medium mb-1" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-error ml-1" aria-hidden="true">*</span>
    </label>

    <div class="relative">
      <div
        v-if="prefixIcon"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
        :class="iconClasses"
      >
        <FontAwesomeIcon :icon="prefixIcon" class="h-5 w-5" />
      </div>

      <input
        :id="fieldId"
        :name="name"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :class="inputClasses"
        :aria-invalid="error"
        :aria-describedby="ariaDescribedBy"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <div
        v-if="suffixIcon || type === 'password'"
        class="absolute right-3 top-1/2 transform -translate-y-1/2"
      >
        <FontAwesomeIcon
          v-if="suffixIcon && type !== 'password'"
          :icon="suffixIcon"
          class="h-5 w-5 pointer-events-none"
          :class="iconClasses"
        />
        <button
          v-else-if="type === 'password'"
          type="button"
          class="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950"
          :class="passwordToggleClasses"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="togglePasswordVisibility"
        >
          <FontAwesomeIcon :icon="showPassword ? 'eye-slash' : 'eye'" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <p v-if="helperText && !error" :id="helpId" class="mt-1 text-sm" :class="helperTextClasses">
      {{ helperText }}
    </p>
    <p v-else-if="error && errorMessage" :id="errorId" class="mt-1 text-sm text-error" role="alert">
      {{ errorMessage }}
    </p>
  </div>
</template>
```

- [ ] **Step 2: Update index.ts barrel**

Find:
```ts
export type { InputProps } from './Input/Input.ts';
```

Replace with:
```ts
export type { InputProps } from './Input/Input.vue';
```

- [ ] **Step 3: Delete Input.ts**

```bash
rm src/modules/ui/components/Input/Input.ts
```

- [ ] **Step 4: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/ui/components/Input/ src/modules/ui/components/index.ts
git commit -m "refactor(ui): migrate Input to script setup"
```

---

## Task 11: Migrate Card

**Files:**
- Modify: `src/modules/ui/components/Card/Card.vue`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/Card/Card.ts`

- [ ] **Step 1: Replace Card.vue script block**

Replace `<script lang="ts" src="./Card.ts" />` with:

```vue
<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  /** Use when `clickable` is true and visible text may not describe the action. */
  clickableAriaLabel?: string;
  collapsible?: boolean;
  /** Use when `collapsible` is true if the header slot does not expose a clear accessible name. */
  collapsibleHeaderAriaLabel?: string;
  defaultExpanded?: boolean;
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'default',
  padding: 'md',
  hover: false,
  clickable: false,
  clickableAriaLabel: '',
  collapsible: false,
  collapsibleHeaderAriaLabel: '',
  defaultExpanded: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
  'update:expanded': [value: boolean];
}>();

const isExpanded = ref(props.defaultExpanded);

watch(() => props.defaultExpanded, (val) => { isExpanded.value = val; });

onMounted(() => {
  if (props.collapsible && props.defaultExpanded) emit('update:expanded', isExpanded.value);
});

const toggleExpand = () => {
  if (props.collapsible) {
    isExpanded.value = !isExpanded.value;
    emit('update:expanded', isExpanded.value);
  }
};

const collapseIconClasses = 'text-gray-500 dark:text-gray-400';
const footerBorderClasses = 'border-gray-200 dark:border-gray-700';

const headerClasses = computed(() => {
  const classes: string[] = [];
  if (!props.collapsible || isExpanded.value) {
    classes.push('mb-4', 'pb-4', 'border-b', 'border-gray-200', 'dark:border-gray-700');
  }
  if (props.collapsible) classes.push('cursor-pointer', 'select-none');
  return classes;
});

const cardClasses = computed(() => {
  const base = [
    'w-full', 'max-w-full', 'box-border', 'rounded-lg',
    'bg-white', 'text-gray-900', 'dark:bg-gray-800', 'dark:text-gray-100',
    'transition-all', 'duration-200',
  ];
  const variantClasses: Record<CardVariant, string[]> = {
    default: ['border border-gray-200 shadow-sm', 'dark:border-gray-700 dark:shadow-none'],
    elevated: ['shadow-md', 'border-0'],
    outlined: ['border-2 border-gray-300', 'dark:border-gray-600'],
  };
  const paddingClasses: Record<string, string[]> = {
    none: [], sm: ['p-2'], md: ['p-4'], lg: ['p-6'], xl: ['p-8'],
  };
  const classes = [...base, ...variantClasses[props.variant], ...paddingClasses[props.padding]];
  if (props.hover) classes.push('hover:shadow-lg', 'hover:-translate-y-1');
  if (props.clickable) classes.push('cursor-pointer', 'hover:shadow-lg');
  return classes;
});

const handleClick = (event: MouseEvent) => {
  if (props.clickable) emit('click', event);
};

const handleKeydownEnter = (event: KeyboardEvent) => {
  if (props.clickable) handleClick(event as unknown as MouseEvent);
};

const handleKeydownSpace = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
  if (props.clickable) { event.preventDefault(); handleClick(event as unknown as MouseEvent); }
};
</script>
```

Keep the existing `<template>` and `<style>` blocks unchanged.

- [ ] **Step 2: Update index.ts barrel**

Find:
```ts
export type { CardProps, CardVariant } from './Card/Card.ts';
```

Replace with:
```ts
export type { CardProps, CardVariant } from './Card/Card.vue';
```

- [ ] **Step 3: Delete Card.ts**

```bash
rm src/modules/ui/components/Card/Card.ts
```

- [ ] **Step 4: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/ui/components/Card/ src/modules/ui/components/index.ts
git commit -m "refactor(ui): migrate Card to script setup"
```

---

## Task 12: Migrate Select + Spec

**Files:**
- Modify: `src/modules/ui/components/Select/Select.vue`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/Select/Select.ts`
- Create: `src/modules/ui/components/Select/Select.spec.ts`

- [ ] **Step 1: Write the failing spec**

Create `src/modules/ui/components/Select/Select.spec.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Select from './Select.vue';

const OPTIONS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

describe('Select', () => {
  it('renders a button with aria-haspopup=listbox', () => {
    const wrapper = mount(Select, { props: { modelValue: '', options: OPTIONS } });
    expect(wrapper.find('button').attributes('aria-haspopup')).toBe('listbox');
  });

  it('shows aria-expanded=false when closed', () => {
    const wrapper = mount(Select, { props: { modelValue: '', options: OPTIONS } });
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false');
  });

  it('opens dropdown on click and sets aria-expanded=true', async () => {
    const wrapper = mount(Select, { props: { modelValue: '', options: OPTIONS } });
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
  });

  it('closes on Escape', async () => {
    const wrapper = mount(Select, { props: { modelValue: '', options: OPTIONS } });
    await wrapper.find('button').trigger('click');
    await wrapper.find('button').trigger('keydown', { key: 'Escape' });
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it('emits update:modelValue when option clicked', async () => {
    const wrapper = mount(Select, { props: { modelValue: '', options: OPTIONS } });
    await wrapper.find('button').trigger('click');
    const options = wrapper.findAll('[role="option"]');
    await options[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['apple']);
  });

  it('marks selected option with aria-selected=true', async () => {
    const wrapper = mount(Select, { props: { modelValue: 'banana', options: OPTIONS } });
    await wrapper.find('button').trigger('click');
    const selected = wrapper.findAll('[role="option"]').find(
      (o) => o.attributes('aria-selected') === 'true',
    );
    expect(selected?.text()).toContain('Banana');
  });

  it('does not emit when disabled option clicked', async () => {
    const opts = [{ label: 'Apple', value: 'apple', disabled: true }];
    const wrapper = mount(Select, { props: { modelValue: '', options: opts } });
    await wrapper.find('button').trigger('click');
    await wrapper.find('[role="option"]').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run spec — expect failures**

```bash
yarn test --reporter=verbose src/modules/ui/components/Select/Select.spec.ts
```

Expected: "marks selected option" test may fail (verify current behavior).

- [ ] **Step 3: Replace Select.vue script block**

Replace `<script lang="ts" src="./Select.ts" />` with the full `<script setup>` block. Keep the existing `<template>` unchanged.

```vue
<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  FIELD_HELPER_CLASSES,
  FIELD_LABEL_CLASSES,
  type ComponentSize,
} from '../../types/component.types';
import { createFieldFallbackId } from '../../utils/field-id';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps {
  modelValue: string | number | (string | number)[];
  options: SelectOption[];
  size?: ComponentSize;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  fullWidth?: boolean;
  name?: string;
  id?: string;
  listboxLabel?: string;
  searchPlaceholder?: string;
  emptyOptionsText?: string;
}

const props = withDefaults(defineProps<SelectProps>(), {
  size: 'md',
  disabled: false,
  placeholder: 'Select an option...',
  label: '',
  helperText: '',
  error: false,
  errorMessage: '',
  required: false,
  multiple: false,
  searchable: false,
  fullWidth: false,
  name: '',
  id: '',
  listboxLabel: 'Options',
  searchPlaceholder: 'Search...',
  emptyOptionsText: 'No options found',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[]];
  change: [value: string | number | (string | number)[]];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const selectRootRef = ref<HTMLElement | null>(null);
const fallbackFieldId = createFieldFallbackId('select');
const isOpen = ref(false);
const isFocused = ref(false);
const searchQuery = ref('');
const highlightedIndex = ref(-1);
const openWithLastHighlight = ref(false);

const fieldId = computed(() => props.id || props.name || fallbackFieldId);
const listboxId = computed(() => `select-listbox-${fieldId.value}`);
const helpId = computed(() => `${fieldId.value}-help`);
const errorId = computed(() => `${fieldId.value}-error`);
const ariaDescribedBy = computed(() => {
  const parts: string[] = [];
  if (props.helperText && !props.error) parts.push(helpId.value);
  if (props.error && props.errorMessage) parts.push(errorId.value);
  return parts.length ? parts.join(' ') : undefined;
});

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) return props.options;
  const q = searchQuery.value.toLowerCase();
  return props.options.filter((o) => o.label.toLowerCase().includes(q));
});

const selectedLabels = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.options.filter((o) => props.modelValue.includes(o.value)).map((o) => o.label);
  }
  if (!props.multiple && props.modelValue !== null && props.modelValue !== undefined) {
    return props.options.find((o) => o.value === props.modelValue)?.label ?? '';
  }
  return '';
});

const activeDescendantId = computed(() => {
  const opts = filteredOptions.value;
  if (!isOpen.value || highlightedIndex.value < 0 || highlightedIndex.value >= opts.length) return undefined;
  return `${listboxId.value}-option-${highlightedIndex.value}`;
});

function getFirstEnabledIndex(): number {
  for (let i = 0; i < filteredOptions.value.length; i++) {
    if (!filteredOptions.value[i].disabled) return i;
  }
  return -1;
}
function getLastEnabledIndex(): number {
  for (let i = filteredOptions.value.length - 1; i >= 0; i--) {
    if (!filteredOptions.value[i].disabled) return i;
  }
  return -1;
}
function getInitialHighlightIndex(): number {
  const opts = filteredOptions.value;
  if (opts.length === 0) return -1;
  if (!props.multiple) {
    const idx = opts.findIndex((o) => o.value === props.modelValue);
    if (idx >= 0 && !opts[idx].disabled) return idx;
  }
  return getFirstEnabledIndex();
}
function findNextEnabled(current: number, direction: 1 | -1): number {
  const opts = filteredOptions.value;
  let i = current;
  for (let step = 0; step < opts.length; step++) {
    i = (i + direction + opts.length) % opts.length;
    if (!opts[i].disabled) return i;
  }
  return current;
}

const selectClasses = computed(() => {
  const base = [
    'w-full', 'rounded-lg', 'border', 'transition-all', 'duration-200',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-1',
    'focus:ring-offset-white', 'dark:focus:ring-offset-0',
    'disabled:opacity-50', 'disabled:cursor-not-allowed',
    'bg-[var(--ui-field-bg)]', 'text-[var(--ui-field-text)]',
  ];
  const sizeClasses: Record<ComponentSize, string[]> = {
    xs: ['text-xs', 'px-2', 'py-1'],
    sm: ['text-sm', 'px-3', 'py-1.5'],
    md: ['text-base', 'px-4', 'py-2'],
    lg: ['text-lg', 'px-5', 'py-2.5'],
    xl: ['text-xl', 'px-6', 'py-3'],
  };
  if (props.error) {
    base.push('border-error', 'focus:ring-error/80', 'focus:border-error');
  } else if (isFocused.value || isOpen.value) {
    base.push(
      'border-[var(--ui-focus-ring)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]',
    );
  } else {
    base.push(
      'border-[var(--ui-field-border)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]',
    );
  }
  return [...base, ...sizeClasses[props.size], props.fullWidth && 'w-full'].filter(Boolean);
});

const labelClasses = FIELD_LABEL_CLASSES;
const helperTextClasses = FIELD_HELPER_CLASSES;
const selectedTextClasses = 'text-gray-900 dark:text-gray-100';
const placeholderClasses = 'text-gray-400 dark:text-gray-500';
const dropdownClasses = 'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]';
const dropdownSearchBorderClasses = 'border-b border-gray-200 dark:border-gray-700';
const dropdownSearchInputClasses = computed(
  () => 'border border-[var(--ui-field-border)] bg-[var(--ui-field-bg)] text-[var(--ui-field-text)]',
);
const optionSelectedClasses = 'bg-gray-100 dark:bg-gray-700';
const optionHoverClasses = 'hover:bg-gray-100 dark:hover:bg-gray-700';
const emptyOptionClasses = 'text-gray-500 dark:text-gray-400';

const isSelected = (option: SelectOption) => {
  if (props.multiple && Array.isArray(props.modelValue)) return props.modelValue.includes(option.value);
  return props.modelValue === option.value;
};

const handleSelect = (option: SelectOption) => {
  if (option.disabled) return;
  if (props.multiple) {
    const curr = Array.isArray(props.modelValue) ? props.modelValue : [];
    const newVal = curr.includes(option.value)
      ? curr.filter((v) => v !== option.value)
      : [...curr, option.value];
    emit('update:modelValue', newVal);
    emit('change', newVal);
  } else {
    emit('update:modelValue', option.value);
    emit('change', option.value);
    isOpen.value = false;
  }
};

const toggleOpen = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) { searchQuery.value = ''; openWithLastHighlight.value = false; }
};

const handleFocus = (event: FocusEvent) => { isFocused.value = true; emit('focus', event); };
const handleBlur = (event: FocusEvent) => { isFocused.value = false; emit('blur', event); };

const handleClickOutside = (event: MouseEvent) => {
  if (!selectRootRef.value?.contains(event.target as Node)) isOpen.value = false;
};
const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (isOpen.value && event.key === 'Escape') { event.preventDefault(); isOpen.value = false; }
};

function onSearchKeydown(event: KeyboardEvent) {
  if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Escape'].includes(event.key)) onKeydown(event);
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  const opts = filteredOptions.value;
  if (!isOpen.value) {
    if (event.key === 'ArrowDown') { event.preventDefault(); openWithLastHighlight.value = false; isOpen.value = true; searchQuery.value = ''; return; }
    if (event.key === 'ArrowUp') { event.preventDefault(); openWithLastHighlight.value = true; isOpen.value = true; searchQuery.value = ''; return; }
    return;
  }
  if (event.key === 'Escape') { event.preventDefault(); isOpen.value = false; return; }
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (opts.length === 0) return;
    highlightedIndex.value = highlightedIndex.value < 0 ? getFirstEnabledIndex() : findNextEnabled(highlightedIndex.value, 1);
    return;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (opts.length === 0) return;
    highlightedIndex.value = highlightedIndex.value < 0 ? getLastEnabledIndex() : findNextEnabled(highlightedIndex.value, -1);
    return;
  }
  if (event.key === 'Home') { event.preventDefault(); highlightedIndex.value = getFirstEnabledIndex(); return; }
  if (event.key === 'End') { event.preventDefault(); highlightedIndex.value = getLastEnabledIndex(); return; }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (highlightedIndex.value >= 0 && opts[highlightedIndex.value]) handleSelect(opts[highlightedIndex.value]);
    return;
  }
}

watch(isOpen, (open) => {
  if (open) {
    highlightedIndex.value = openWithLastHighlight.value ? getLastEnabledIndex() : getInitialHighlightIndex();
    openWithLastHighlight.value = false;
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleDocumentKeydown);
  } else {
    highlightedIndex.value = -1;
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleDocumentKeydown);
  }
});

watch(filteredOptions, () => {
  if (!isOpen.value) return;
  if (filteredOptions.value.length === 0) { highlightedIndex.value = -1; return; }
  if (highlightedIndex.value >= filteredOptions.value.length) highlightedIndex.value = getFirstEnabledIndex();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleDocumentKeydown);
});
</script>
```

Keep the existing `<template>` unchanged.

- [ ] **Step 4: Run spec — expect all pass**

```bash
yarn test --reporter=verbose src/modules/ui/components/Select/Select.spec.ts
```

Expected: all 7 tests pass.

- [ ] **Step 5: Update index.ts barrel**

Find:
```ts
export type { SelectProps, SelectOption } from './Select/Select.ts';
```

Replace with:
```ts
export type { SelectProps, SelectOption } from './Select/Select.vue';
```

- [ ] **Step 6: Delete Select.ts**

```bash
rm src/modules/ui/components/Select/Select.ts
```

- [ ] **Step 7: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

- [ ] **Step 8: Commit**

```bash
git add src/modules/ui/components/Select/ src/modules/ui/components/index.ts
git commit -m "refactor(ui): migrate Select to script setup, add spec"
```

---

## Task 13: Migrate Autocomplete + A11y Fix + Spec

**Files:**
- Modify: `src/modules/ui/components/Autocomplete/Autocomplete.vue`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/Autocomplete/Autocomplete.ts`
- Create: `src/modules/ui/components/Autocomplete/Autocomplete.spec.ts`

**A11y fixes:**
1. `aria-selected` — currently set to `index === highlightedIndex` (highlights). Must reflect actual selection.
2. Add `minCharsText` prop to replace hardcoded English hint string.

- [ ] **Step 1: Write the failing spec**

Create `src/modules/ui/components/Autocomplete/Autocomplete.spec.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Autocomplete from './Autocomplete.vue';
import type { AutocompleteOption } from './Autocomplete.vue';

const OPTIONS: AutocompleteOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
];

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('Autocomplete', () => {
  it('renders input with role=combobox', () => {
    const wrapper = mount(Autocomplete, {
      props: { modelValue: '', fetchSuggestions: vi.fn().mockResolvedValue([]) },
    });
    expect(wrapper.find('input').attributes('role')).toBe('combobox');
  });

  it('shows minCharsText hint when query length < minChars', async () => {
    const wrapper = mount(Autocomplete, {
      props: {
        modelValue: '',
        fetchSuggestions: vi.fn().mockResolvedValue([]),
        minChars: 3,
        minCharsText: 'Escribe al menos 3 caracteres',
      },
    });
    await wrapper.find('input').setValue('ab');
    await wrapper.find('input').trigger('input');
    expect(wrapper.text()).toContain('Escribe al menos 3 caracteres');
  });

  it('uses computed default minCharsText when prop not provided', async () => {
    const wrapper = mount(Autocomplete, {
      props: {
        modelValue: '',
        fetchSuggestions: vi.fn().mockResolvedValue([]),
        minChars: 2,
      },
    });
    await wrapper.find('input').setValue('a');
    await wrapper.find('input').trigger('input');
    expect(wrapper.text()).toContain('Type at least 2 characters');
  });

  it('sets aria-selected=true only for the currently selected option', async () => {
    const fetch = vi.fn().mockResolvedValue(OPTIONS);
    const wrapper = mount(Autocomplete, {
      props: { modelValue: '', fetchSuggestions: fetch, minChars: 1 },
    });
    const input = wrapper.find('input');
    await input.setValue('a');
    await input.trigger('input');
    vi.runAllTimers();
    await wrapper.vm.$nextTick();

    // Select 'Apple'
    const optionEls = wrapper.findAll('[role="option"]');
    if (optionEls.length > 0) {
      await optionEls[0].trigger('mousedown');
      await wrapper.vm.$nextTick();
    }

    // After selection, only the selected option should have aria-selected=true
    // Re-open to check
    await input.trigger('focus');
    vi.runAllTimers();
    await wrapper.vm.$nextTick();
    const opts = wrapper.findAll('[role="option"]');
    const selectedOpts = opts.filter((o) => o.attributes('aria-selected') === 'true');
    // At most one should be selected
    expect(selectedOpts.length).toBeLessThanOrEqual(1);
    if (selectedOpts.length === 1) {
      expect(selectedOpts[0].text()).toContain('Apple');
    }
  });

  it('aria-selected is not tied to keyboard highlight position', async () => {
    const fetch = vi.fn().mockResolvedValue(OPTIONS);
    const wrapper = mount(Autocomplete, {
      props: { modelValue: '', fetchSuggestions: fetch, minChars: 1 },
    });
    const input = wrapper.find('input');
    await input.setValue('a');
    await input.trigger('input');
    vi.runAllTimers();
    await wrapper.vm.$nextTick();

    // Navigate with keyboard — no selection made
    await input.trigger('keydown', { key: 'ArrowDown' });
    await wrapper.vm.$nextTick();

    // aria-selected should still be false for all (nothing was selected, just highlighted)
    const opts = wrapper.findAll('[role="option"]');
    const selected = opts.filter((o) => o.attributes('aria-selected') === 'true');
    expect(selected.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run spec — expect failures**

```bash
yarn test --reporter=verbose src/modules/ui/components/Autocomplete/Autocomplete.spec.ts
```

Expected: minCharsText and aria-selected tests fail.

- [ ] **Step 3: Replace Autocomplete.vue script block**

Replace `<script lang="ts" src="./Autocomplete.ts" />` with:

```vue
<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Avatar from '../Avatar/Avatar.vue';
import {
  FIELD_HELPER_CLASSES,
  FIELD_ICON_CLASSES,
  FIELD_LABEL_CLASSES,
  type ComponentSize,
} from '../../types/component.types';
import { createFieldFallbackId } from '../../utils/field-id';

export interface AutocompleteOption<T = string> {
  label: string;
  value: T;
  description?: string;
  avatarName?: string;
}

export interface AutocompleteProps {
  modelValue: string;
  fetchSuggestions: (query: string) => Promise<AutocompleteOption[]>;
  label?: string;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  minChars?: number;
  /** Override the "type at least N characters" hint for i18n. */
  minCharsText?: string;
  fullWidth?: boolean;
  size?: ComponentSize;
  name?: string;
  id?: string;
  prefixIcon?: string | string[];
  clearable?: boolean;
  loadingText?: string;
  noResultsText?: string;
  debounceMs?: number;
  maxSuggestions?: number;
}

const DEFAULT_DEBOUNCE_MS = 280;

const props = withDefaults(defineProps<AutocompleteProps>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  helperText: '',
  disabled: false,
  error: false,
  errorMessage: '',
  required: false,
  minChars: 2,
  minCharsText: undefined,
  fullWidth: false,
  size: 'md',
  name: '',
  id: '',
  prefixIcon: undefined,
  clearable: true,
  loadingText: 'Searching…',
  noResultsText: 'No results',
  debounceMs: DEFAULT_DEBOUNCE_MS,
  maxSuggestions: 0,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  select: [option: AutocompleteOption];
  focus: [];
  blur: [];
  clear: [];
}>();

const fallbackInputId = createFieldFallbackId('autocomplete');
const inputRef = ref<HTMLInputElement | null>(null);
const isOpen = ref(false);
const isLoading = ref(false);
const suggestions = ref<AutocompleteOption[]>([]);
const highlightedIndex = ref(-1);
/** Tracks the value of the last explicitly selected option — used for aria-selected. */
const selectedOptionValue = ref<string | null>(null);
const query = ref(String(props.modelValue));
const isFocused = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastRequestId = 0;

const minCharsHint = computed(
  () => props.minCharsText ?? `Type at least ${props.minChars} characters…`,
);

const sizeClasses: Record<ComponentSize, string[]> = {
  xs: ['text-xs', 'px-2', 'py-1'],
  sm: ['text-sm', 'px-3', 'py-1.5'],
  md: ['text-base', 'px-4', 'py-2'],
  lg: ['text-lg', 'px-5', 'py-2.5'],
  xl: ['text-xl', 'px-6', 'py-3'],
};

const paddingLeftClass = computed(() => (props.prefixIcon ? 'pl-10' : ''));
const paddingRightClass = computed(() => {
  if (props.clearable && query.value.trim()) return 'pr-10';
  if (isLoading.value) return 'pr-10';
  return '';
});

const inputClasses = computed(() => {
  const base = [
    'w-full', 'rounded-lg', 'border', 'transition-all', 'duration-200',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-1',
    'focus:ring-offset-white', 'dark:focus:ring-offset-0',
    'disabled:opacity-50', 'disabled:cursor-not-allowed',
    ...sizeClasses[props.size],
    paddingLeftClass.value,
    paddingRightClass.value,
  ];
  if (props.error) {
    base.push('border-error', 'focus:ring-error/80', 'focus:border-error');
  } else if (isFocused.value) {
    base.push(
      'border-[var(--ui-focus-ring)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]',
    );
  } else {
    base.push(
      'border-[var(--ui-field-border)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]',
    );
  }
  base.push(
    'bg-[var(--ui-field-bg)]', 'text-[var(--ui-field-text)]',
    'placeholder:text-[var(--ui-field-placeholder)]',
  );
  return base.join(' ');
});

const labelClasses = FIELD_LABEL_CLASSES;
const helperTextClasses = FIELD_HELPER_CLASSES;
const iconClasses = FIELD_ICON_CLASSES;
const containerClasses = computed(() => [props.fullWidth && 'w-full'].filter(Boolean).join(' '));
const inputId = computed(() => props.id || props.name || fallbackInputId);
const helperId = computed(() => `${inputId.value}-help`);
const errorId = computed(() => `${inputId.value}-error`);
const describedById = computed(() => {
  const parts: string[] = [];
  if (props.helperText && !props.error) parts.push(helperId.value);
  if (props.error && props.errorMessage) parts.push(errorId.value);
  return parts.length ? parts.join(' ') : undefined;
});
const listboxId = computed(() => `autocomplete-listbox-${inputId.value}`);
const activeDescendantId = computed(() =>
  highlightedIndex.value >= 0 && suggestions.value[highlightedIndex.value]
    ? `${listboxId.value}-option-${highlightedIndex.value}`
    : undefined,
);
const clearButtonClasses =
  'text-gray-500 hover:text-gray-700 focus:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:text-gray-200 focus:outline-none rounded p-1 transition-colors';

const displayedSuggestions = computed(() => {
  if (props.maxSuggestions && props.maxSuggestions > 0) return suggestions.value.slice(0, props.maxSuggestions);
  return suggestions.value;
});

function clearDebounce() {
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
}

function loadSuggestions(q: string) {
  if (q.length < props.minChars) { suggestions.value = []; isOpen.value = true; return; }
  const requestId = ++lastRequestId;
  isLoading.value = true;
  props.fetchSuggestions(q.trim())
    .then((items) => {
      if (requestId !== lastRequestId) return;
      suggestions.value = items;
      highlightedIndex.value = -1;
      isOpen.value = true;
    })
    .catch(() => { if (requestId !== lastRequestId) return; suggestions.value = []; isOpen.value = true; })
    .finally(() => { if (requestId === lastRequestId) isLoading.value = false; });
}

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  query.value = value;
  selectedOptionValue.value = null; // user is typing — clear selection
  emit('update:modelValue', value);
  clearDebounce();
  if (value.length < props.minChars) { suggestions.value = []; isOpen.value = value.length > 0; return; }
  const delay = Math.max(0, props.debounceMs ?? DEFAULT_DEBOUNCE_MS);
  debounceTimer = setTimeout(() => loadSuggestions(value), delay);
}

function selectOption(option: AutocompleteOption) {
  selectedOptionValue.value = String(option.value);
  emit('update:modelValue', option.label);
  emit('select', option);
  query.value = option.label;
  suggestions.value = [];
  isOpen.value = false;
  highlightedIndex.value = -1;
}

function handleClear() {
  query.value = '';
  selectedOptionValue.value = null;
  emit('update:modelValue', '');
  emit('clear');
  suggestions.value = [];
  isOpen.value = false;
  highlightedIndex.value = -1;
  inputRef.value?.focus();
}

function onFocus() {
  isFocused.value = true;
  if (query.value.length >= props.minChars && suggestions.value.length > 0) isOpen.value = true;
  else if (query.value.length >= props.minChars && !isLoading.value) loadSuggestions(query.value);
  emit('focus');
}

function onBlur() {
  isFocused.value = false;
  setTimeout(() => { isOpen.value = false; highlightedIndex.value = -1; emit('blur'); }, 180);
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) { if (e.key === 'Escape') isOpen.value = false; return; }
  const list = displayedSuggestions.value;
  if (e.key === 'ArrowDown') { e.preventDefault(); highlightedIndex.value = Math.min(highlightedIndex.value + 1, list.length - 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1); }
  else if (e.key === 'Enter' && highlightedIndex.value >= 0 && list[highlightedIndex.value]) { e.preventDefault(); selectOption(list[highlightedIndex.value]); }
  else if (e.key === 'Escape') { e.preventDefault(); isOpen.value = false; highlightedIndex.value = -1; }
}

watch(() => props.modelValue, (val) => {
  const s = String(val ?? '');
  if (query.value !== s) query.value = s;
});

onBeforeUnmount(clearDebounce);
</script>
```

- [ ] **Step 4: Update Autocomplete.vue template**

In the `<template>`, find the hint `<li>`:

```html
<li
  v-else-if="query.length > 0 && query.length < minChars"
  class="px-4 py-3 text-sm text-gray-400 dark:text-gray-500"
  role="status"
>
  Type at least {{ minChars }} characters…
</li>
```

Replace with:

```html
<li
  v-else-if="query.length > 0 && query.length < minChars"
  class="px-4 py-3 text-sm text-gray-400 dark:text-gray-500"
  role="status"
>
  {{ minCharsHint }}
</li>
```

Also find the `aria-selected` on the option `<li>`:

```html
:aria-selected="index === highlightedIndex"
```

Replace with:

```html
:aria-selected="selectedOptionValue !== null && String(option.value) === selectedOptionValue"
```

- [ ] **Step 5: Run spec — expect all pass**

```bash
yarn test --reporter=verbose src/modules/ui/components/Autocomplete/Autocomplete.spec.ts
```

Expected: all tests pass.

- [ ] **Step 6: Update index.ts barrel**

Find:
```ts
export type { AutocompleteProps, AutocompleteOption } from './Autocomplete/Autocomplete.ts';
```

Replace with:
```ts
export type { AutocompleteProps, AutocompleteOption } from './Autocomplete/Autocomplete.vue';
```

Also update `TokenAutocomplete.stories.ts` line 4:
```ts
import type { AutocompleteOption } from '../Autocomplete/Autocomplete.vue';
```

And `Autocomplete.stories.ts` line 4:
```ts
import type { AutocompleteOption } from './Autocomplete.vue';
```

- [ ] **Step 7: Delete Autocomplete.ts**

```bash
rm src/modules/ui/components/Autocomplete/Autocomplete.ts
```

- [ ] **Step 8: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

- [ ] **Step 9: Commit**

```bash
git add src/modules/ui/components/Autocomplete/ src/modules/ui/components/index.ts src/modules/ui/components/TokenAutocomplete/TokenAutocomplete.stories.ts
git commit -m "fix(a11y)+refactor(ui): migrate Autocomplete to script setup, fix aria-selected, add minCharsText prop"
```

---

## Task 14: Migrate Pagination + A11y Fix + Spec

**Files:**
- Modify: `src/modules/ui/components/Pagination/Pagination.vue`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/Pagination/Pagination.ts`
- Create: `src/modules/ui/components/Pagination/Pagination.spec.ts`

**A11y fix:** Ellipsis `...` buttons have no `aria-label`. Screen readers announce "dot dot dot".

- [ ] **Step 1: Write the failing spec**

Create `src/modules/ui/components/Pagination/Pagination.spec.ts`:

```ts
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Pagination from './Pagination.vue';

describe('Pagination', () => {
  it('renders a nav with aria-label=Pagination', () => {
    const wrapper = mount(Pagination, { props: { modelValue: 1, totalPages: 5 } });
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Pagination');
  });

  it('page buttons have aria-label="Page N"', () => {
    const wrapper = mount(Pagination, { props: { modelValue: 1, totalPages: 3 } });
    const pageBtn = wrapper.findAll('button').find((b) => b.attributes('aria-label') === 'Page 1');
    expect(pageBtn).toBeDefined();
  });

  it('current page button has aria-current=page', () => {
    const wrapper = mount(Pagination, { props: { modelValue: 2, totalPages: 5 } });
    const currentBtn = wrapper.findAll('button').find((b) => b.attributes('aria-current') === 'page');
    expect(currentBtn).toBeDefined();
    expect(currentBtn?.attributes('aria-label')).toBe('Page 2');
  });

  it('ellipsis buttons have descriptive aria-label', () => {
    // Need enough pages to show ellipsis: modelValue in middle with maxPagesToShow=3
    const wrapper = mount(Pagination, {
      props: { modelValue: 5, totalPages: 10, maxPagesToShow: 3 },
    });
    const buttons = wrapper.findAll('button');
    const ellipsisBtns = buttons.filter((b) => b.text() === '...');
    ellipsisBtns.forEach((btn) => {
      expect(btn.attributes('aria-label')).toBeTruthy();
      expect(btn.attributes('aria-label')).not.toBe('');
    });
  });

  it('emits update:modelValue when page clicked', async () => {
    const wrapper = mount(Pagination, { props: { modelValue: 1, totalPages: 5 } });
    const nextBtn = wrapper.find('button[aria-label="Next page"]');
    await nextBtn.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2]);
  });

  it('First/Previous buttons are disabled on page 1', () => {
    const wrapper = mount(Pagination, { props: { modelValue: 1, totalPages: 5 } });
    const firstBtn = wrapper.find('button[aria-label="First page"]');
    expect(firstBtn.attributes('disabled')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run spec — expect ellipsis test to fail**

```bash
yarn test --reporter=verbose src/modules/ui/components/Pagination/Pagination.spec.ts
```

Expected: "ellipsis buttons have descriptive aria-label" fails.

- [ ] **Step 3: Replace Pagination.vue script block**

Replace `<script lang="ts" src="./Pagination.ts" />` with:

```vue
<script setup lang="ts">
import { computed, type PropType } from 'vue';
import Button from '../Button/Button.vue';

export interface PaginationProps {
  modelValue: number;
  totalPages: number;
  maxPagesToShow?: number;
  showCompactOnMobile?: boolean;
  disabled?: boolean;
  onPageChange?: (page: number) => void;
}

const props = withDefaults(defineProps<PaginationProps>(), {
  maxPagesToShow: 5,
  showCompactOnMobile: false,
  disabled: false,
  onPageChange: undefined,
});

const emit = defineEmits<{ 'update:modelValue': [page: number] }>();

const rangeStart = computed(() =>
  Math.max(1, props.modelValue - Math.floor(props.maxPagesToShow / 2)),
);
const rangeEnd = computed(() =>
  Math.min(props.totalPages, rangeStart.value + props.maxPagesToShow - 1),
);
const pagesInRange = computed(() =>
  Array.from({ length: rangeEnd.value - rangeStart.value + 1 }, (_, i) => rangeStart.value + i),
);

const goToPage = (page: number) => {
  if (props.disabled) return;
  if (page >= 1 && page <= props.totalPages) {
    emit('update:modelValue', page);
    props.onPageChange?.(page);
    window.scrollTo(0, 0);
  }
};

const isFirstDisabled = computed(() => props.modelValue === 1 || props.disabled);
const isLastDisabled = computed(() => props.modelValue === props.totalPages || props.disabled);
const compactTextClasses = 'text-gray-700 dark:text-gray-300';
</script>
```

Keep the existing `<template>` but update the two ellipsis buttons. Find:

```html
<!-- Ellipsis before -->
<Button
  v-if="rangeStart > 1"
  variant="outline"
  size="sm"
  class="min-h-11 min-w-11 px-4"
  @click="goToPage(rangeStart - 1)"
>
  ...
</Button>
```

Replace with:

```html
<!-- Ellipsis before -->
<Button
  v-if="rangeStart > 1"
  variant="outline"
  size="sm"
  class="min-h-11 min-w-11 px-4"
  aria-label="Go to previous page range"
  @click="goToPage(rangeStart - 1)"
>
  ...
</Button>
```

Find:

```html
<!-- Ellipsis after -->
<Button
  v-if="rangeEnd < totalPages"
  variant="outline"
  size="sm"
  class="min-h-11 min-w-11 px-4"
  @click="goToPage(rangeEnd + 1)"
>
  ...
</Button>
```

Replace with:

```html
<!-- Ellipsis after -->
<Button
  v-if="rangeEnd < totalPages"
  variant="outline"
  size="sm"
  class="min-h-11 min-w-11 px-4"
  aria-label="Go to next page range"
  @click="goToPage(rangeEnd + 1)"
>
  ...
</Button>
```

- [ ] **Step 4: Run spec — expect all pass**

```bash
yarn test --reporter=verbose src/modules/ui/components/Pagination/Pagination.spec.ts
```

Expected: all 6 tests pass.

- [ ] **Step 5: Update index.ts barrel**

Find:
```ts
export type { PaginationProps } from './Pagination/Pagination.ts';
```

Replace with:
```ts
export type { PaginationProps } from './Pagination/Pagination.vue';
```

- [ ] **Step 6: Delete Pagination.ts**

```bash
rm src/modules/ui/components/Pagination/Pagination.ts
```

- [ ] **Step 7: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

- [ ] **Step 8: Commit**

```bash
git add src/modules/ui/components/Pagination/ src/modules/ui/components/index.ts
git commit -m "fix(a11y)+refactor(ui): migrate Pagination to script setup, add aria-label to ellipsis buttons"
```

---

## Task 15: Migrate Button + A11y Fix

**Files:**
- Modify: `src/modules/ui/components/Button/Button.vue`
- Modify: `src/modules/ui/components/Button/Button.stories.ts`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/Button/Button.ts`

**A11y fix:** Add optional `ariaLabel` prop for icon-only button usage.

- [ ] **Step 1: Replace Button.vue entirely**

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Spinner from '../Spinner/Spinner.vue';
import type { ComponentSize, ComponentVariant } from '../../types/component.types';

export interface ButtonProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: string | string[];
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
  /** Accessible name for icon-only buttons where slot content is absent or not descriptive. */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
  icon: undefined,
  iconPosition: 'left',
  type: 'button',
  ariaLabel: undefined,
});

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const buttonClasses = computed(() => {
  const base = [
    'inline-flex', 'min-h-11', 'items-center', 'justify-center',
    'font-medium', 'rounded-lg', 'transition-all', 'duration-200',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2',
    'disabled:opacity-50', 'disabled:cursor-not-allowed', 'relative',
  ];
  const sizeClasses: Record<ComponentSize, string[]> = {
    xs: ['text-xs', 'px-2', 'py-1', 'gap-1'],
    sm: ['text-sm', 'px-3', 'py-1.5', 'gap-1.5'],
    md: ['text-base', 'px-4', 'py-2', 'gap-2'],
    lg: ['text-lg', 'px-6', 'py-3', 'gap-2'],
    xl: ['text-xl', 'px-8', 'py-4', 'gap-3'],
  };
  const variantClasses: Record<ComponentVariant, string[]> = {
    primary: ['bg-primary', 'text-white', 'hover:bg-primary-800', 'dark:bg-primary-700', 'dark:hover:bg-primary-800', 'focus:ring-primary'],
    secondary: ['bg-gray-200', 'text-gray-900', 'hover:bg-gray-300', 'dark:bg-gray-700', 'dark:text-gray-100', 'dark:hover:bg-gray-600', 'focus:ring-gray-500'],
    success: ['bg-success', 'text-white', 'hover:bg-success-600', 'dark:bg-success-600', 'dark:hover:bg-success-700', 'focus:ring-success'],
    warning: ['bg-warning', 'text-gray-900', 'dark:text-gray-950', 'hover:bg-warning-600', 'dark:bg-warning', 'dark:hover:bg-warning-600', 'focus:ring-warning'],
    error: ['bg-error', 'text-white', 'hover:bg-error-600', 'dark:bg-error-600', 'dark:hover:bg-error-700', 'focus:ring-error'],
    info: ['bg-info', 'text-white', 'hover:bg-info-600', 'dark:bg-info-600', 'dark:hover:bg-info-700', 'focus:ring-info'],
    outline: ['bg-transparent', 'border-2', 'border-primary', 'text-primary', 'hover:bg-primary', 'hover:text-white', 'dark:border-primary-400', 'dark:text-primary-400', 'dark:hover:bg-primary-800', 'focus:ring-primary'],
    ghost: ['bg-transparent', 'text-gray-700', 'hover:bg-gray-100', 'dark:text-gray-300', 'dark:hover:bg-gray-800', 'focus:ring-gray-500'],
    danger: ['bg-error-600', 'text-white', 'hover:bg-error-700', 'dark:bg-error-700', 'dark:hover:bg-error-800', 'focus:ring-error'],
  };
  return [
    ...base,
    ...sizeClasses[props.size],
    ...variantClasses[props.variant],
    props.fullWidth && 'w-full',
    props.loading && 'cursor-wait',
  ].filter(Boolean);
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) emit('click', event);
};
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :aria-disabled="disabled"
    :aria-label="ariaLabel || undefined"
    @click="handleClick"
  >
    <Spinner v-if="loading" color="inherit" size="sm" class="absolute" aria-hidden="true" />
    <FontAwesomeIcon
      v-if="icon && iconPosition === 'left' && !loading"
      :icon="icon"
      class="h-4 w-4"
    />
    <span :class="{ 'opacity-0': loading }">
      <slot />
    </span>
    <FontAwesomeIcon
      v-if="icon && iconPosition === 'right' && !loading"
      :icon="icon"
      class="h-4 w-4"
    />
  </button>
</template>
```

- [ ] **Step 2: Add IconOnly story to Button.stories.ts**

At the end of `Button.stories.ts`, add:

```ts
export const IconOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Icon-only buttons must use the ariaLabel prop to provide an accessible name.',
      },
    },
  },
  render: () => ({
    components: { Button },
    template: `
      <div class="flex items-center gap-4">
        <Button icon="trash" aria-label="Delete item" variant="danger" />
        <Button icon="pencil" aria-label="Edit item" variant="outline" />
        <Button icon="download" aria-label="Download file" />
      </div>
    `,
  }),
};
```

- [ ] **Step 3: Update index.ts barrel**

Find:
```ts
export type { ButtonProps } from './Button/Button.ts';
```

Replace with:
```ts
export type { ButtonProps } from './Button/Button.vue';
```

- [ ] **Step 4: Delete Button.ts**

```bash
rm src/modules/ui/components/Button/Button.ts
```

- [ ] **Step 5: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

- [ ] **Step 6: Commit**

```bash
git add src/modules/ui/components/Button/ src/modules/ui/components/index.ts
git commit -m "fix(a11y)+refactor(ui): migrate Button to script setup, add ariaLabel prop"
```

---

## Task 16: Migrate Stepper

**Files:**
- Modify: `src/modules/ui/components/Stepper/Stepper.vue`
- Modify: `src/modules/ui/components/index.ts`
- Delete: `src/modules/ui/components/Stepper/Stepper.ts`

- [ ] **Step 1: Replace Stepper.vue script block**

Replace `<script lang="ts" src="./Stepper.ts" />` with:

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export interface StepperStep {
  id: number;
  title: string;
  shortTitle: string;
  icon: string;
}

export interface StepperProps {
  steps: StepperStep[];
  modelValue: number;
  animated?: boolean;
}

const props = withDefaults(defineProps<StepperProps>(), {
  animated: true,
});

defineEmits<{ 'update:modelValue': [page: number] }>();

const totalSteps = computed(() => props.steps.length);
const isEntered = ref(false);

onMounted(() => {
  requestAnimationFrame(() => { isEntered.value = true; });
});

const currentTitle = computed(() => props.steps[props.modelValue - 1]?.title ?? '');
const ariaLabel = computed(() => `Step ${props.modelValue} of ${totalSteps.value}: ${currentTitle.value}`);
</script>
```

Keep the existing `<template>` and `<style>` unchanged. Note: in the template, `ariaLabel()` is called as a function — change it to just `ariaLabel` (remove the `()`) since it's now a computed ref:

In the template, find:
```html
:aria-label="ariaLabel()"
```

Replace with:
```html
:aria-label="ariaLabel"
```

Also find `totalSteps` used as a plain value in the template and ensure it works as a computed (it will — Vue templates auto-unwrap computed refs).

- [ ] **Step 2: Update index.ts barrel**

Find:
```ts
export type { StepperProps, StepperStep } from './Stepper/Stepper.ts';
```

Replace with:
```ts
export type { StepperProps, StepperStep } from './Stepper/Stepper.vue';
```

- [ ] **Step 3: Delete Stepper.ts**

```bash
rm src/modules/ui/components/Stepper/Stepper.ts
```

- [ ] **Step 4: Verify**

```bash
yarn build && yarn lint && yarn type-check
```

- [ ] **Step 5: Commit**

```bash
git add src/modules/ui/components/Stepper/ src/modules/ui/components/index.ts
git commit -m "refactor(ui): migrate Stepper to script setup"
```

---

## Task 17: Final Quality Gate

- [ ] **Step 1: Run full quality pipeline**

```bash
yarn quality
```

Expected: all stages pass — `build` → `lint` → `type-check` → `format:check` → `test` → `build-storybook`.

- [ ] **Step 2: Verify zero .ts companion files remain**

```bash
ls src/modules/ui/components/**/*.ts | grep -v stories | grep -v spec | grep -v types | grep -v utils | grep -v composables | grep -v Toast.ts
```

Expected: no output (all companion `.ts` files deleted). `Toast.ts` is a types-only file for `Toast.vue` — check if it exports types used by barrel and if so, move them to `Toast.vue` with the same dual-script or inline approach.

- [ ] **Step 3: Check Toast.ts**

```bash
cat src/modules/ui/components/Toast/Toast.ts
```

If it contains only type exports (`ToastProps`, `ToastVariant`, `TOAST_VARIANTS`), update `index.ts` to import from `./Toast/Toast.vue` and delete `Toast.ts` following the same pattern as other components. `TOAST_VARIANTS` is a runtime value, so use the dual-script pattern identical to Spinner.

- [ ] **Step 4: Confirm all accessibility fixes are live**

Manual checklist (use browser devtools → Accessibility tree):
- [ ] Toggle: wrapper is `<div>`, button has `aria-labelledby` or `aria-label="Toggle"`
- [ ] Button: icon-only usage has `aria-label`
- [ ] Autocomplete: `aria-selected` is `false` when just navigating, `true` after selection
- [ ] Autocomplete: typing in a non-default language shows `minCharsText` if prop provided
- [ ] Pagination: `...` buttons show descriptive `aria-label` in devtools
- [ ] Toast: no `aria-live` attribute on the `role="alert"` element
- [ ] InfoBanner: error variant has no `aria-live`; info/success/warning have `aria-live="polite"`

- [ ] **Step 5: Final commit if anything was fixed in step 3**

```bash
git add -A
git commit -m "chore(ui): final cleanup — migrate Toast types, verify quality gate"
```
