<script lang="ts">
import { computed as vueComputed } from 'vue';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  icon?: string | string[];
  visible?: boolean;
  duration?: number;
}

export const DEFAULT_DURATION = 3000;

export const TOAST_VARIANTS: Record<ToastVariant, { bg: string; text: string; icon: string[] }> = {
  default: {
    bg: 'bg-gray-800 dark:bg-gray-700',
    text: 'text-white',
    icon: ['fas', 'info-circle'],
  },
  success: {
    bg: 'bg-success-600 dark:bg-success-700',
    text: 'text-white',
    icon: ['fas', 'check-circle'],
  },
  error: {
    bg: 'bg-error-600 dark:bg-error-700',
    text: 'text-white',
    icon: ['fas', 'exclamation-circle'],
  },
  warning: {
    bg: 'bg-warning-500 dark:bg-warning-600',
    text: 'text-gray-900 dark:text-gray-950',
    icon: ['fas', 'exclamation-triangle'],
  },
  info: {
    bg: 'bg-info-600 dark:bg-info-700',
    text: 'text-white',
    icon: ['fas', 'info-circle'],
  },
};

export function useToastStyles(variant: ToastVariant = 'default') {
  const config = TOAST_VARIANTS[variant];

  const containerClasses = vueComputed(() => [
    'pointer-events-auto flex min-w-0 items-center gap-3 rounded-lg px-4 py-3 shadow-lg',
    'min-w-[280px] max-w-[90vw]',
    config.bg,
    config.text,
  ]);

  const defaultIcon = config.icon;

  return {
    containerClasses,
    defaultIcon,
  };
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = withDefaults(
  defineProps<{
    message: string;
    variant?: ToastVariant;
    icon?: string | string[];
    visible?: boolean;
  }>(),
  {
    variant: 'default',
    visible: false,
    icon: undefined,
  }
);

defineEmits<{
  close: [];
}>();

const config = computed(() => TOAST_VARIANTS[props.variant]);
const closeButtonHoverClasses = 'hover:bg-black/10 dark:hover:bg-white/10';

/** Inner bar: symmetric vertical padding only (safe-area lives on the outer shell). */
const barClasses = computed(() => [
  'pointer-events-auto flex min-w-0 items-center gap-3 rounded-lg px-4 py-3 shadow-lg',
  'min-w-toast max-w-toast-viewport',
  config.value.bg,
  config.value.text,
]);

/**
 * Outer shell: bottom inset + safe-area so the bar keeps equal py-3 inside the colored box.
 * (Mixing pb-[env(safe-area)] with py-3 on one node caused uneven vertical padding.)
 */
const shellClasses =
  'pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]';

const displayIcon = computed(() => {
  if (props.icon) {
    return Array.isArray(props.icon) ? props.icon : ['fas', props.icon];
  }
  return config.value.icon;
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div v-if="visible" :class="shellClasses">
        <div :class="barClasses" role="alert">
          <span class="inline-flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
            <FontAwesomeIcon :icon="displayIcon" class="block h-5 w-5" />
          </span>
          <span class="min-w-0 flex-1 text-sm font-medium leading-snug">{{ message }}</span>
          <button
            type="button"
            class="inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200"
            :class="closeButtonHoverClasses"
            aria-label="Close"
            @click="$emit('close')"
          >
            <span class="inline-flex items-center justify-center" aria-hidden="true">
              <FontAwesomeIcon :icon="['fas', 'times']" class="block h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
