<script setup lang="ts">
import { computed, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  FIELD_HELPER_CLASSES,
  FIELD_ICON_CLASSES,
  FIELD_LABEL_CLASSES,
  type ComponentSize,
} from '../../types/component.types';
import { createFieldFallbackId } from '../../utils/field-id';

export interface InputProps {
  modelValue: string | number;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'time';
  size?: ComponentSize;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  prefixIcon?: string | string[];
  suffixIcon?: string | string[];
  fullWidth?: boolean;
  name?: string;
  id?: string;
  autocomplete?: string;
  maxlength?: number;
  min?: string | number;
  max?: string | number;
}

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: '',
  type: 'text',
  size: 'md',
  disabled: false,
  readonly: false,
  placeholder: '',
  label: '',
  helperText: '',
  error: false,
  errorMessage: '',
  required: false,
  prefixIcon: undefined,
  suffixIcon: undefined,
  fullWidth: false,
  name: '',
  id: '',
  autocomplete: '',
  maxlength: undefined,
  min: undefined,
  max: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  input: [event: Event];
  change: [event: Event];
}>();

const fallbackFieldId = createFieldFallbackId('input');
const isFocused = ref(false);
const showPassword = ref(false);

const inputType = computed(() => {
  if (props.type === 'password') return showPassword.value ? 'text' : 'password';
  return props.type;
});

const inputClasses = computed(() => {
  const baseClasses = [
    'w-full',
    'rounded-lg',
    'border',
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
    'readonly:cursor-default',
  ];
  const sizeClasses: Record<ComponentSize, string[]> = {
    xs: ['text-xs', 'px-2', 'py-1'],
    sm: ['text-sm', 'px-3', 'py-1.5'],
    md: ['text-base', 'px-4', 'py-2'],
    lg: ['text-lg', 'px-5', 'py-2.5'],
    xl: ['text-xl', 'px-6', 'py-3'],
  };
  if (props.error) {
    baseClasses.push('border-error', 'focus:ring-error/80', 'focus:border-error');
  } else if (isFocused.value) {
    baseClasses.push(
      'border-[var(--ui-focus-ring)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]'
    );
  } else {
    baseClasses.push(
      'border-[var(--ui-field-border)]',
      'focus:ring-[color:color-mix(in_srgb,var(--ui-focus-ring)_45%,transparent)]',
      'focus:border-[var(--ui-focus-ring)]'
    );
  }
  baseClasses.push(
    'bg-[var(--ui-field-bg)]',
    'text-[var(--ui-field-text)]',
    'placeholder:text-[var(--ui-field-placeholder)]'
  );
  if (props.prefixIcon) baseClasses.push('pl-10');
  if (props.type === 'password') baseClasses.push('pr-12');
  else if (props.suffixIcon) baseClasses.push('pr-10');
  return [...baseClasses, ...sizeClasses[props.size], props.fullWidth && 'w-full'].filter(Boolean);
});

const containerClasses = computed(() => [props.fullWidth && 'w-full'].filter(Boolean));

const fieldId = computed(() => props.id || props.name || fallbackFieldId);
const helpId = computed(() => `${fieldId.value}-help`);
const errorId = computed(() => `${fieldId.value}-error`);
const ariaDescribedBy = computed(() => {
  const parts: string[] = [];
  if (props.helperText && !props.error) parts.push(helpId.value);
  if (props.error && props.errorMessage) parts.push(errorId.value);
  return parts.length ? parts.join(' ') : undefined;
});

const labelClasses = FIELD_LABEL_CLASSES;
const iconClasses = FIELD_ICON_CLASSES;
const passwordToggleClasses =
  'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300';
const helperTextClasses = FIELD_HELPER_CLASSES;

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
  emit('input', event);
};
const handleChange = (event: Event) => emit('change', event);
const handleFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit('focus', event);
};
const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  emit('blur', event);
};
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div :class="containerClasses">
    <label v-if="label" :for="fieldId" class="mb-1 block text-sm font-medium" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="ml-1 text-error" aria-hidden="true">*</span>
    </label>

    <div class="relative">
      <div
        v-if="prefixIcon"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transform"
        :class="iconClasses"
      >
        <FontAwesomeIcon :icon="prefixIcon" class="h-5 w-5" />
      </div>

      <input
        :id="fieldId"
        :name="name"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :class="inputClasses"
        :aria-invalid="error"
        :aria-describedby="ariaDescribedBy"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <div
        v-if="suffixIcon || type === 'password'"
        class="absolute right-3 top-1/2 -translate-y-1/2 transform"
      >
        <FontAwesomeIcon
          v-if="suffixIcon && type !== 'password'"
          :icon="suffixIcon"
          class="pointer-events-none h-5 w-5"
          :class="iconClasses"
        />
        <button
          v-else-if="type === 'password'"
          type="button"
          class="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-950"
          :class="passwordToggleClasses"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="togglePasswordVisibility"
        >
          <FontAwesomeIcon :icon="showPassword ? 'eye-slash' : 'eye'" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <p v-if="helperText && !error" :id="helpId" class="mt-1 text-sm" :class="helperTextClasses">
      {{ helperText }}
    </p>
    <p v-else-if="error && errorMessage" :id="errorId" class="mt-1 text-sm text-error" role="alert">
      {{ errorMessage }}
    </p>
  </div>
</template>
