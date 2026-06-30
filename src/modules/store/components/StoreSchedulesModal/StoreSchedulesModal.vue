<script setup lang="ts">
import { computed, ref } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, InfoBanner } from '@/modules/ui';
import { useTheme } from '@/modules/shared/composables/useTheme';
import type { StoreScheduleItem } from '@/modules/store/types/store-details.types';

interface Props {
  isOpen: boolean;
  schedules: StoreScheduleItem[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const { isDark } = useTheme();

const overlayRef = ref<HTMLElement | null>(null);
const modalTitleId = 'store-schedules-modal-title';

function formatHours(open: string, close: string): string {
  return `${open} - ${close}`;
}

function handleClose(): void {
  emit('close');
}

function onOverlayClick(e: MouseEvent): void {
  if (e.target === overlayRef.value) handleClose();
}

onKeyStroke('Escape', () => {
  if (props.isOpen) handleClose();
});

const hasRows = computed(() => props.schedules.length > 0);

const panelClasses = computed(() =>
  [
    'relative w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]',
    isDark.value ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200',
  ].join(' ')
);
</script>

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
        v-if="isOpen"
        ref="overlayRef"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        :class="isDark ? 'bg-black/60' : 'bg-gray-900/50'"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="modalTitleId"
        @click="onOverlayClick"
      >
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="isOpen" :class="panelClasses" @click.stop>
            <div
              class="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 border-b shrink-0"
              :class="isDark ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50'"
            >
              <h2
                :id="modalTitleId"
                class="text-lg font-semibold min-w-0"
                :class="isDark ? 'text-white' : 'text-gray-900'"
              >
                Horarios de atención
              </h2>
              <button
                type="button"
                class="shrink-0 rounded-lg p-2 transition-colors duration-200 cursor-pointer min-h-11 min-w-11 inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                :class="
                  isDark
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                "
                aria-label="Cerrar"
                @click="handleClose"
              >
                <FontAwesomeIcon :icon="['fas', 'times']" class="h-5 w-5" />
              </button>
            </div>

            <div class="overflow-y-auto flex-1 min-h-0 p-4 sm:p-5 flex flex-col gap-4">
              <template v-if="hasRows">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    v-for="s in schedules"
                    :key="s.dayOfWeek"
                    class="flex justify-between items-center py-2 px-3 rounded-lg border transition-colors duration-200"
                    :class="isDark ? 'border-gray-600' : 'border-gray-200'"
                  >
                    <span
                      class="text-sm font-medium"
                      :class="isDark ? 'text-gray-100' : 'text-gray-800'"
                    >
                      {{ s.dayLabel }}
                    </span>
                    <span class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                      {{ formatHours(s.openTime, s.closeTime) }}
                    </span>
                  </div>
                </div>
              </template>
              <div
                v-else
                class="rounded-lg border border-dashed px-4 py-8 text-center transition-colors duration-200"
                :class="isDark ? 'border-gray-600 bg-gray-900/20' : 'border-gray-300 bg-gray-50'"
              >
                <FontAwesomeIcon
                  :icon="['fas', 'clock']"
                  class="mx-auto mb-3 text-2xl opacity-50"
                  :class="isDark ? 'text-gray-500' : 'text-gray-400'"
                />
                <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
                  No hay horarios definidos para esta tienda.
                </p>
              </div>

              <InfoBanner
                variant="info"
                title="Solo lectura"
                description="Los horarios se muestran tal como están registrados. La edición desde aquí estará disponible cuando el API lo permita."
              />
            </div>

            <div
              class="flex justify-end p-4 sm:p-5 border-t shrink-0"
              :class="isDark ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'"
            >
              <Button
                type="button"
                variant="primary"
                class="w-full sm:w-auto min-h-11 touch-manipulation"
                @click="handleClose"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
