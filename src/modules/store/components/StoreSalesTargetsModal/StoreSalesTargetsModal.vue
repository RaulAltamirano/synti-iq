<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, InfoBanner } from '@/modules/ui';
import CurrencyAmountInput from '@/modules/store/components/CurrencyAmountInput/CurrencyAmountInput.vue';
import { formatCurrencyAmountDisplay } from '@/modules/store/utils/currency-amount';
import { useTheme } from '@/modules/shared/composables/useTheme';
import { STORE_FORM_LIMITS } from '@/modules/store/constants/store-form-limits';

interface Props {
  isOpen: boolean;
  initialDaily: number | undefined;
  initialMonthly: number | undefined;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  save: [];
}>();

const { isDark } = useTheme();

const dailyValue = ref<number | ''>('');
const monthlyValue = ref<number | ''>('');
const dailyError = ref('');
const monthlyError = ref('');
const overlayRef = ref<HTMLElement | null>(null);

const modalTitleId = 'store-sales-targets-modal-title';

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      dailyValue.value = props.initialDaily != null ? props.initialDaily : '';
      monthlyValue.value = props.initialMonthly != null ? props.initialMonthly : '';
      dailyError.value = '';
      monthlyError.value = '';
    }
  }
);

function parseTarget(value: number | '', field: 'daily' | 'monthly'): boolean {
  if (value === '') {
    if (field === 'daily') dailyError.value = '';
    else monthlyError.value = '';
    return true;
  }
  if (!Number.isFinite(value) || value < 0) {
    if (field === 'daily') dailyError.value = 'Introduce un número válido mayor o igual a 0.';
    else monthlyError.value = 'Introduce un número válido mayor o igual a 0.';
    return false;
  }
  if (value > STORE_FORM_LIMITS.SALES_MAX) {
    const maxLabel = formatCurrencyAmountDisplay(STORE_FORM_LIMITS.SALES_MAX);
    if (field === 'daily') dailyError.value = `El valor no puede superar $${maxLabel}.`;
    else monthlyError.value = `El valor no puede superar $${maxLabel}.`;
    return false;
  }
  if (field === 'daily') dailyError.value = '';
  else monthlyError.value = '';
  return true;
}

function validate(): boolean {
  const okD = parseTarget(dailyValue.value, 'daily');
  const okM = parseTarget(monthlyValue.value, 'monthly');
  return okD && okM;
}

function handleClose(): void {
  emit('close');
}

function handleSave(): void {
  if (!validate()) return;
  emit('save');
}

function onOverlayClick(e: MouseEvent): void {
  if (e.target === overlayRef.value) handleClose();
}

onKeyStroke('Escape', () => {
  if (props.isOpen) handleClose();
});

const panelClasses = computed(() =>
  [
    'relative w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]',
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
                Editar metas de ventas
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

            <div class="overflow-y-auto flex-1 min-h-0 p-4 sm:p-5 flex flex-col gap-5">
              <InfoBanner
                variant="info"
                title="Cambios locales"
                description="Las metas aún no se guardan en el servidor. Esta vista es solo para probar el flujo."
              />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CurrencyAmountInput
                  id="store-sales-daily"
                  v-model="dailyValue"
                  label="Meta diaria"
                  :max="STORE_FORM_LIMITS.SALES_MAX"
                  :error="!!dailyError"
                  :error-message="dailyError"
                  name="store-sales-daily"
                />
                <CurrencyAmountInput
                  id="store-sales-monthly"
                  v-model="monthlyValue"
                  label="Meta mensual"
                  :max="STORE_FORM_LIMITS.SALES_MAX"
                  :error="!!monthlyError"
                  :error-message="monthlyError"
                  name="store-sales-monthly"
                />
              </div>
            </div>

            <div
              class="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end p-4 sm:p-5 border-t shrink-0"
              :class="isDark ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'"
            >
              <Button
                type="button"
                variant="ghost"
                class="w-full sm:w-auto min-h-11 touch-manipulation"
                @click="handleClose"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                class="w-full sm:w-auto min-h-11 touch-manipulation"
                @click="handleSave"
              >
                Guardar
              </Button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
