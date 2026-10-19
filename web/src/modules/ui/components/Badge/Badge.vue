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
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-full',
    'transition-colors',
  ];
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
    return [
      ...baseClasses,
      'w-2',
      'h-2',
      'p-0',
      'rounded-full',
      ...dotBgOnly[props.variant].split(/\s+/),
    ];
  }
  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...variantClasses[props.variant].split(/\s+/),
  ];
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
