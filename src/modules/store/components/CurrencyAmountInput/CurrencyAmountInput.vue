<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  FIELD_HELPER_CLASSES,
  FIELD_ICON_CLASSES,
  FIELD_LABEL_CLASSES,
} from '@/modules/ui/types/component.types';
import { STORE_FORM_LIMITS } from '@/modules/store/constants/store-form-limits';
import {
  formatCurrencyAmountDisplay,
  parseCurrencyAmountInput,
  type CurrencyAmountValue,
} from '@/modules/store/utils/currency-amount';

interface Props {
  modelValue?: CurrencyAmountValue;
  label?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  id?: string;
  name?: string;
  max?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  helperText: '',
  placeholder: '0',
  disabled: false,
  required: false,
  error: false,
  errorMessage: '',
  id: '',
  name: '',
  max: STORE_FORM_LIMITS.SALES_MAX,
});

const emit = defineEmits<{
  'update:modelValue': [value: CurrencyAmountValue];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const displayValue = ref('');
const isFocused = ref(false);

const helperId = computed(() => (props.id ? `${props.id}-help` : undefined));
const errorId = computed(() => (props.id ? `${props.id}-error` : undefined));

const ariaDescribedBy = computed(() => {
  const parts: string[] = [];
  if (props.helperText && !props.error && helperId.value) parts.push(helperId.value);
  if (props.error && props.errorMessage && errorId.value) parts.push(errorId.value);
  return parts.length ? parts.join(' ') : undefined;
});

const inputClasses = computed(() => {
  const base = [
    'w-full',
    'rounded-lg',
    'border',
    'pl-9',
    'pr-4',
    'py-2',
    'text-base',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-1',
    'focus:ring-offset-white',
    'dark:focus:ring-offset-0',
    'dark:focus:ring-offset-gray-950',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'bg-[var(--ui-field-bg)]',
    'text-[var(--ui-field-text)]',
    'placeholder:text-[var(--ui-field-placeholder)]',
  ];

  if (props.error) {
    base.push('border-error', 'focus:ring-error/80', 'focus:border-error');
  } else if (isFocused.value) {
    base.push(
      'border-[var(--ui-focus-ring)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]'
    );
  } else {
    base.push(
      'border-[var(--ui-field-border)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]'
    );
  }

  return base;
});

function syncFromModelValue(value: CurrencyAmountValue | undefined): void {
  if (value === '' || value == null) {
    displayValue.value = '';
    return;
  }

  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    displayValue.value = '';
    return;
  }

  displayValue.value = formatCurrencyAmountDisplay(numeric);
}

function handleInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value;
  const parsed = parseCurrencyAmountInput(raw, props.max);
  displayValue.value = parsed.display;
  emit('update:modelValue', parsed.value);
}

function handleFocus(event: FocusEvent): void {
  isFocused.value = true;
  emit('focus', event);
}

function handleBlur(event: FocusEvent): void {
  isFocused.value = false;
  syncFromModelValue(props.modelValue);
  emit('blur', event);
}

watch(
  () => props.modelValue,
  (value) => {
    const parsed = parseCurrencyAmountInput(displayValue.value, props.max);
    const external = value === '' || value == null ? '' : value;
    const internal = parsed.value === '' ? '' : parsed.value;
    if (external !== internal) {
      syncFromModelValue(value);
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex w-full min-w-0 flex-col">
    <label
      v-if="label"
      :for="id || undefined"
      class="mb-1 block text-sm font-medium"
      :class="FIELD_LABEL_CLASSES"
    >
      {{ label }}
      <span v-if="required" class="ml-1 text-error" aria-hidden="true">*</span>
    </label>

    <div class="relative">
      <span
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base font-medium"
        :class="FIELD_ICON_CLASSES"
        aria-hidden="true"
      >
        $
      </span>

      <input
        :id="id || undefined"
        :name="name || undefined"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        :aria-invalid="error"
        :aria-describedby="ariaDescribedBy"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>

    <p
      v-if="helperText && !error"
      :id="helperId"
      class="mt-1 text-sm"
      :class="FIELD_HELPER_CLASSES"
    >
      {{ helperText }}
    </p>

    <p v-if="error && errorMessage" :id="errorId" class="mt-1 text-sm text-error" role="alert">
      {{ errorMessage }}
    </p>
  </div>
</template>
