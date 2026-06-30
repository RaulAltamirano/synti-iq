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
  return [
    'rounded-full',
    'animate-pulse',
    ...sizeClasses[props.size],
    ...colorClasses[props.color],
  ];
});

const getAnimationDelay = (index: number) => `${(index - 1) * 0.15}s`;
</script>

<template>
  <!-- Spinner Variant -->
  <svg
    v-if="props.variant === 'spinner'"
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
  <div v-else-if="props.variant === 'dots'" :class="dotsClasses" aria-label="Loading" role="status">
    <span
      v-for="i in 3"
      :key="i"
      :class="[dotSizeClasses, 'rounded-full', 'bg-current', 'animate-bounce']"
      :style="{ animationDelay: getAnimationDelay(i) }"
    />
  </div>

  <!-- Pulse Variant -->
  <div
    v-else-if="props.variant === 'pulse'"
    :class="pulseClasses"
    aria-label="Loading"
    role="status"
  />
</template>
