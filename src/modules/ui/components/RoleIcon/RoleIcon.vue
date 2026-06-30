<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { getRoleConfig } from '@/modules/shared/constants';
import type { RoleTone } from '@/modules/shared/constants';
import type { ComponentSize } from '../../types/component.types';

export type RoleIconSize = Extract<ComponentSize, 'sm' | 'md' | 'lg'> | 'xl';

export interface RoleIconProps {
  role?: string;
  size?: RoleIconSize;
  showLabel?: boolean;
}

const props = withDefaults(defineProps<RoleIconProps>(), {
  role: '',
  size: 'md',
  showLabel: false,
});

const config = computed(() => getRoleConfig(props.role));

/** Badge-token sizing: squircle, not a circle, so it reads as an emblem rather than an avatar. */
const emblemSizeClasses: Record<RoleIconSize, string> = {
  sm: 'w-6 h-6 rounded-md',
  md: 'w-8 h-8 rounded-lg',
  lg: 'w-12 h-12 rounded-xl',
  xl: 'w-16 h-16 rounded-2xl',
};

const iconSizeClasses: Record<RoleIconSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-7 h-7',
};

const chipSizeClasses: Record<RoleIconSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1.5',
  md: 'px-2.5 py-1 text-sm gap-2',
  lg: 'px-3 py-1.5 text-sm gap-2',
  xl: 'px-4 py-2 text-base gap-2.5',
};

const toneBgClasses: Record<RoleTone, string> = {
  primary: 'bg-primary-50 dark:bg-primary-900/30',
  success: 'bg-success-50 dark:bg-success-900/30',
  warning: 'bg-warning-50 dark:bg-warning-900/30',
  error: 'bg-error-50 dark:bg-error-900/30',
  info: 'bg-info-50 dark:bg-info-900/30',
  gray: 'bg-gray-100 dark:bg-gray-800/60',
};

/** Defined edge gives the medal/token feel without any glow. */
const toneBorderClasses: Record<RoleTone, string> = {
  primary: 'border-primary-200 dark:border-primary-700/60',
  success: 'border-success-200 dark:border-success-700/60',
  warning: 'border-warning-200 dark:border-warning-700/60',
  error: 'border-error-200 dark:border-error-700/60',
  info: 'border-info-200 dark:border-info-700/60',
  gray: 'border-gray-300 dark:border-gray-600/60',
};

const toneIconClasses: Record<RoleTone, string> = {
  primary: 'text-primary-600 dark:text-primary-400',
  success: 'text-success-600 dark:text-success-400',
  warning: 'text-warning-600 dark:text-warning-400',
  error: 'text-error-600 dark:text-error-400',
  info: 'text-info-600 dark:text-info-400',
  gray: 'text-gray-600 dark:text-gray-400',
};

const toneLabelClasses: Record<RoleTone, string> = {
  primary: 'text-primary-700 dark:text-primary-300',
  success: 'text-success-700 dark:text-success-300',
  warning: 'text-warning-700 dark:text-warning-300',
  error: 'text-error-700 dark:text-error-300',
  info: 'text-info-700 dark:text-info-300',
  gray: 'text-gray-700 dark:text-gray-300',
};

const emblemClasses = computed(() => [
  'inline-flex items-center justify-center shrink-0 border',
  emblemSizeClasses[props.size],
  toneBgClasses[config.value.tone],
  toneBorderClasses[config.value.tone],
]);

const chipClasses = computed(() => [
  'inline-flex items-center rounded-full border font-medium',
  chipSizeClasses[props.size],
  toneBgClasses[config.value.tone],
  toneBorderClasses[config.value.tone],
]);

const iconClasses = computed(() => [
  iconSizeClasses[props.size],
  toneIconClasses[config.value.tone],
]);

const ariaLabel = computed(() => `Role: ${config.value.label}`);
</script>

<template>
  <!-- Chip variant: icon + label in a single bordered pill (medal ribbon style) -->
  <span v-if="showLabel" :class="chipClasses" role="img" :aria-label="ariaLabel">
    <FontAwesomeIcon :icon="['fas', config.icon]" :class="iconClasses" aria-hidden="true" />
    <span class="truncate max-w-[120px]" :class="toneLabelClasses[config.tone]">
      {{ config.label }}
    </span>
  </span>

  <!-- Emblem variant: bordered squircle token -->
  <span v-else :class="emblemClasses" role="img" :aria-label="ariaLabel">
    <FontAwesomeIcon :icon="['fas', config.icon]" :class="iconClasses" aria-hidden="true" />
  </span>
</template>
