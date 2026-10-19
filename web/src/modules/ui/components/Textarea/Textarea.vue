<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  FIELD_HELPER_CLASSES,
  FIELD_LABEL_CLASSES,
  type ComponentSize,
} from '../../types/component.types';
import { createFieldFallbackId } from '../../utils/field-id';

export interface TextareaProps {
  modelValue: string;
  size?: ComponentSize;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  rows?: number;
  fullWidth?: boolean;
  name?: string;
  id?: string;
  maxlength?: number;
}

const props = withDefaults(defineProps<TextareaProps>(), {
  modelValue: '',
  size: 'md',
  disabled: false,
  readonly: false,
  placeholder: '',
  label: '',
  helperText: '',
  error: false,
  errorMessage: '',
  required: false,
  rows: 3,
  fullWidth: false,
  name: '',
  id: '',
  maxlength: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  input: [event: Event];
  change: [event: Event];
}>();

const fallbackFieldId = createFieldFallbackId('textarea');
const isFocused = ref(false);

const textareaClasses = computed(() => {
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
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'readonly:cursor-default',
    'resize-y',
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
const helperTextClasses = FIELD_HELPER_CLASSES;

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
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
</script>

<template>
  <div :class="containerClasses">
    <label v-if="label" :for="fieldId" class="mb-1 block text-sm font-medium" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="ml-1 text-error" aria-hidden="true">*</span>
    </label>

    <textarea
      :id="fieldId"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :rows="rows"
      :maxlength="maxlength"
      :class="textareaClasses"
      :aria-invalid="error"
      :aria-describedby="ariaDescribedBy"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <p v-if="helperText && !error" :id="helpId" class="mt-1 text-sm" :class="helperTextClasses">
      {{ helperText }}
    </p>
    <p v-else-if="error && errorMessage" :id="errorId" class="mt-1 text-sm text-error" role="alert">
      {{ errorMessage }}
    </p>
  </div>
</template>
