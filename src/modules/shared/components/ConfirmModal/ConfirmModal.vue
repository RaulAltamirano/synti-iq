<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        ref="overlayRef"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        :class="isDark ? 'bg-black/60' : 'bg-gray-900/50'"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`${id}-title`"
        @click="handleOverlayClick"
      >
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isVisible"
            class="w-full max-w-sm rounded-xl shadow-xl"
            :class="isDark ? 'bg-gray-800' : 'bg-white'"
          >
            <div class="p-6 text-center">
              <div
                class="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4"
                :class="iconContainerClasses"
              >
                <FontAwesomeIcon :icon="displayIcon" class="w-7 h-7" :class="iconClasses" />
              </div>

              <h3
                :id="`${id}-title`"
                class="text-lg font-semibold mb-2"
                :class="isDark ? 'text-white' : 'text-gray-900'"
              >
                {{ title }}
              </h3>

              <p
                class="text-sm leading-relaxed"
                :class="isDark ? 'text-gray-400' : 'text-gray-500'"
              >
                {{ message }}
              </p>
            </div>

            <div
              class="flex gap-3 p-4 border-t"
              :class="isDark ? 'border-gray-700' : 'border-gray-100'"
            >
              <button
                type="button"
                class="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150"
                :class="cancelButtonClasses"
                :disabled="loading"
                @click="handleCancel"
              >
                {{ cancelText }}
              </button>

              <button
                type="button"
                class="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-150 disabled:opacity-50"
                :class="confirmButtonClasses"
                :disabled="loading"
                @click="handleConfirm"
              >
                <span v-if="loading" class="inline-flex items-center justify-center gap-2">
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="3"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {{ loadingText }}
                </span>
                <span v-else>{{ confirmText }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useTheme } from '../../composables/useTheme';

export type ConfirmModalVariant = 'danger' | 'warning' | 'info';

const overlayRef = ref<HTMLElement | null>(null);

interface Props {
  id?: string;
  isVisible: boolean;
  variant?: ConfirmModalVariant;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
  loading?: boolean;
  icon?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  id: () => `confirm-modal-${Date.now()}`,
  variant: 'danger',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loadingText: 'Processing...',
  loading: false,
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const { isDark } = useTheme();

const variantStyles = computed(() => {
  const styles = {
    danger: {
      iconContainer: isDark.value ? 'bg-red-500/10' : 'bg-red-50',
      icon: isDark.value ? 'text-red-400' : 'text-red-500',
      confirmBtn: 'bg-red-500 hover:bg-red-600 active:bg-red-700',
      defaultIcon: ['fas', 'trash-alt'],
    },
    warning: {
      iconContainer: isDark.value ? 'bg-amber-500/10' : 'bg-amber-50',
      icon: isDark.value ? 'text-amber-400' : 'text-amber-500',
      confirmBtn: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700',
      defaultIcon: ['fas', 'exclamation-triangle'],
    },
    info: {
      iconContainer: isDark.value ? 'bg-blue-500/10' : 'bg-blue-50',
      icon: isDark.value ? 'text-blue-400' : 'text-blue-500',
      confirmBtn: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
      defaultIcon: ['fas', 'info-circle'],
    },
  };
  return styles[props.variant];
});

const iconContainerClasses = computed(() => variantStyles.value.iconContainer);
const iconClasses = computed(() => variantStyles.value.icon);
const confirmButtonClasses = computed(() => variantStyles.value.confirmBtn);

const cancelButtonClasses = computed(() =>
  isDark.value
    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 active:bg-gray-500'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
);

const displayIcon = computed(() => props.icon || variantStyles.value.defaultIcon);

const handleConfirm = () => {
  if (!props.loading) {
    emit('confirm');
  }
};

const handleCancel = () => {
  if (!props.loading) {
    emit('cancel');
  }
};

const handleOverlayClick = (event: MouseEvent) => {
  if (event.target === overlayRef.value && !props.loading) {
    handleCancel();
  }
};
</script>
