<template>
  <div
    :role="bannerRole"
    :aria-live="bannerRole === 'status' ? 'polite' : undefined"
    :class="bannerClasses"
  >
    <div class="flex items-center gap-4">
      <!-- Icon slot or default icon -->
      <div
        v-if="$slots.icon || icon"
        class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
        :class="iconBgClass"
      >
        <slot name="icon">
          <FontAwesomeIcon
            v-if="icon"
            :icon="resolvedIcon"
            class="w-5 h-5"
            :class="iconColorClass"
          />
        </slot>
      </div>

      <!-- Content: default slot or title+description -->
      <div class="flex-1 min-w-0">
        <slot>
          <p class="text-sm font-semibold" :class="titleClass">
            {{ title }}
          </p>
          <p v-if="description" class="text-sm mt-0.5 opacity-90" :class="descriptionClass">
            {{ description }}
          </p>
        </slot>
      </div>

      <!-- Actions: slot or action button + dismiss -->
      <div class="shrink-0 flex items-center gap-2">
        <slot name="actions">
          <Button
            v-if="actionLabel && actionHandler"
            :variant="actionButtonVariant"
            size="sm"
            @click="handleAction"
          >
            {{ actionLabel }}
          </Button>
        </slot>
        <button
          v-if="dismissable"
          type="button"
          :class="dismissButtonClass"
          :title="dismissTitle"
          aria-label="Dismiss"
          @click="handleDismiss"
        >
          <FontAwesomeIcon :icon="['fas', 'times']" class="text-sm" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Button from '../Button/Button.vue';

export type InfoBannerVariant = 'success' | 'info' | 'warning' | 'error';

export interface InfoBannerProps {
  variant?: InfoBannerVariant;
  title?: string;
  description?: string;
  icon?: string[];
  dismissable?: boolean;
  actionLabel?: string;
  actionHandler?: () => void;
  dismissTitle?: string;
}

const props = withDefaults(defineProps<InfoBannerProps>(), {
  variant: 'info',
  title: '',
  description: '',
  icon: undefined,
  dismissable: false,
  actionLabel: '',
  actionHandler: undefined,
  dismissTitle: 'Dismiss',
});

const emit = defineEmits<{
  remove: [];
}>();

const defaultIcons: Record<InfoBannerVariant, string[]> = {
  success: ['fas', 'user-check'],
  info: ['fas', 'info-circle'],
  warning: ['fas', 'clock'],
  error: ['fas', 'exclamation-triangle'],
};

const resolvedIcon = computed(() => {
  return props.icon ?? defaultIcons[props.variant];
});

/** `error` uses `alert`; other variants use `status` for less intrusive screen reader announcements. */
const bannerRole = computed(() => (props.variant === 'error' ? 'alert' : 'status'));

const variantStyles = computed(() => {
  const v = props.variant;
  const map: Record<
    InfoBannerVariant,
    {
      bg: string;
      border: string;
      title: string;
      desc: string;
      iconBg: string;
      iconColor: string;
      dismissFocusRing: string;
    }
  > = {
    success: {
      bg: 'bg-success-50 dark:bg-success-950/40',
      border: 'border-success-200 dark:border-success-700',
      title: 'text-success-800 dark:text-success-200',
      desc: 'text-success-600 dark:text-success-400',
      iconBg: 'bg-success-100 dark:bg-success-800',
      iconColor: 'text-success-600 dark:text-success-400',
      dismissFocusRing: 'focus:ring-success-500 dark:focus:ring-success-400',
    },
    info: {
      bg: 'bg-info-50 dark:bg-info-950/40',
      border: 'border-info-200 dark:border-info-700',
      title: 'text-info-800 dark:text-info-200',
      desc: 'text-info-600 dark:text-info-400',
      iconBg: 'bg-info-100 dark:bg-info-800',
      iconColor: 'text-info-600 dark:text-info-400',
      dismissFocusRing: 'focus:ring-info-500 dark:focus:ring-info-400',
    },
    warning: {
      bg: 'bg-warning-50 dark:bg-warning-950/40',
      border: 'border-warning-200 dark:border-warning-700',
      title: 'text-warning-800 dark:text-warning-200',
      desc: 'text-warning-600 dark:text-warning-400',
      iconBg: 'bg-warning-100 dark:bg-warning-800',
      iconColor: 'text-warning-600 dark:text-warning-400',
      dismissFocusRing: 'focus:ring-warning-500 dark:focus:ring-warning-400',
    },
    error: {
      bg: 'bg-error-50 dark:bg-error-950/40',
      border: 'border-error-200 dark:border-error-700',
      title: 'text-error-800 dark:text-error-200',
      desc: 'text-error-600 dark:text-error-400',
      iconBg: 'bg-error-100 dark:bg-error-800',
      iconColor: 'text-error-600 dark:text-error-400',
      dismissFocusRing: 'focus:ring-error-500 dark:focus:ring-error-400',
    },
  };
  return map[v];
});

const bannerClasses = computed(() => {
  const s = variantStyles.value;
  return ['p-4 rounded-lg border transition-colors duration-200', s.bg, s.border].join(' ');
});

const iconBgClass = computed(() => variantStyles.value.iconBg);
const iconColorClass = computed(() => variantStyles.value.iconColor);
const titleClass = computed(() => variantStyles.value.title);
const descriptionClass = computed(() => variantStyles.value.desc);

const actionButtonVariant = computed(() => {
  const map: Record<InfoBannerVariant, string> = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
  };
  return map[props.variant];
});

const dismissButtonClass = computed(() => {
  const s = variantStyles.value;
  return [
    'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
    s.dismissFocusRing,
    s.iconColor,
    'hover:opacity-80',
  ].join(' ');
});

const handleAction = () => {
  props.actionHandler?.();
};

const handleDismiss = () => {
  emit('remove');
};
</script>
