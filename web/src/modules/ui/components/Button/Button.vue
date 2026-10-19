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
    'inline-flex',
    'min-h-11',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'relative',
  ];
  const sizeClasses: Record<ComponentSize, string[]> = {
    xs: ['text-xs', 'px-2', 'py-1', 'gap-1'],
    sm: ['text-sm', 'px-3', 'py-1.5', 'gap-1.5'],
    md: ['text-base', 'px-4', 'py-2', 'gap-2'],
    lg: ['text-lg', 'px-6', 'py-3', 'gap-2'],
    xl: ['text-xl', 'px-8', 'py-4', 'gap-3'],
  };
  const variantClasses: Record<ComponentVariant, string[]> = {
    primary: [
      'bg-primary',
      'text-white',
      'hover:bg-primary-800',
      'dark:bg-primary-700',
      'dark:hover:bg-primary-800',
      'focus:ring-primary',
    ],
    secondary: [
      'bg-gray-200',
      'text-gray-900',
      'hover:bg-gray-300',
      'dark:bg-gray-700',
      'dark:text-gray-100',
      'dark:hover:bg-gray-600',
      'focus:ring-gray-500',
    ],
    success: [
      'bg-success',
      'text-white',
      'hover:bg-success-600',
      'dark:bg-success-600',
      'dark:hover:bg-success-700',
      'focus:ring-success',
    ],
    warning: [
      'bg-warning',
      'text-gray-900',
      'dark:text-gray-950',
      'hover:bg-warning-600',
      'dark:bg-warning',
      'dark:hover:bg-warning-600',
      'focus:ring-warning',
    ],
    error: [
      'bg-error',
      'text-white',
      'hover:bg-error-600',
      'dark:bg-error-600',
      'dark:hover:bg-error-700',
      'focus:ring-error',
    ],
    info: [
      'bg-info',
      'text-white',
      'hover:bg-info-600',
      'dark:bg-info-600',
      'dark:hover:bg-info-700',
      'focus:ring-info',
    ],
    outline: [
      'bg-transparent',
      'border-2',
      'border-primary',
      'text-primary',
      'hover:bg-primary',
      'hover:text-white',
      'dark:border-primary-400',
      'dark:text-primary-400',
      'dark:hover:bg-primary-800',
      'focus:ring-primary',
    ],
    ghost: [
      'bg-transparent',
      'text-gray-700',
      'hover:bg-gray-100',
      'dark:text-gray-300',
      'dark:hover:bg-gray-800',
      'focus:ring-gray-500',
    ],
    danger: [
      'bg-error-600',
      'text-white',
      'hover:bg-error-700',
      'dark:bg-error-700',
      'dark:hover:bg-error-800',
      'focus:ring-error',
    ],
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
