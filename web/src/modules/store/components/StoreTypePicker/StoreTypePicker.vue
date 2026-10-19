<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { FIELD_HELPER_CLASSES, FIELD_LABEL_CLASSES } from '@/modules/ui/types/component.types';
import { STORE_TYPE_OPTIONS } from '@/modules/store/composables/store-form-wizard.constants';

interface Props {
  modelValue?: string;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  id?: string;
  name?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: 'Store type',
  helperText: '',
  disabled: false,
  required: false,
  error: false,
  errorMessage: '',
  id: 'store-type',
  name: 'store-type',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  blur: [event: FocusEvent];
}>();

const helperId = computed(() => `${props.id}-help`);
const errorId = computed(() => `${props.id}-error`);

function handleSelect(value: string): void {
  if (props.disabled) return;
  emit('update:modelValue', value);
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event);
}

function isSelected(value: string): boolean {
  return props.modelValue === value;
}

function cardClasses(value: string): string[] {
  const selected = isSelected(value);
  const base = [
    'relative',
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'gap-2.5',
    'rounded-xl',
    'border',
    'p-5',
    'min-h-[7.5rem]',
    'text-center',
    'transition-colors',
    'duration-200',
    'touch-manipulation',
    'focus:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-primary',
    'focus-visible:ring-offset-2',
    'dark:focus-visible:ring-offset-gray-900',
  ];

  if (props.disabled) {
    base.push('cursor-not-allowed', 'opacity-50');
  } else {
    base.push('cursor-pointer');
  }

  if (props.error && !selected) {
    base.push(
      'border-error/40',
      'bg-white',
      'hover:border-error/60',
      'dark:border-error/40',
      'dark:bg-gray-800'
    );
  } else if (selected) {
    base.push('border-primary', 'bg-white', 'dark:border-primary', 'dark:bg-gray-800');
  } else {
    base.push(
      'border-gray-200',
      'bg-white',
      'hover:border-gray-300',
      'dark:border-gray-600',
      'dark:bg-gray-800',
      'dark:hover:border-gray-500'
    );
  }

  return base;
}

function iconWrapperClasses(value: string): string[] {
  const selected = isSelected(value);
  if (selected) return ['bg-primary'];
  if (props.error) return ['bg-gray-100', 'dark:bg-gray-700/60'];
  return ['bg-gray-100', 'dark:bg-gray-700/80'];
}

function iconClasses(value: string): string[] {
  const selected = isSelected(value);
  if (selected) return ['text-white'];
  if (props.error) return ['text-gray-400', 'dark:text-gray-500'];
  return ['text-gray-500', 'dark:text-gray-400'];
}

function labelClasses(value: string): string[] {
  const selected = isSelected(value);
  if (selected) return ['font-semibold', 'text-gray-900', 'dark:text-white'];
  return ['font-medium', 'text-gray-700', 'dark:text-gray-300'];
}

function descriptionClasses(value: string): string[] {
  const selected = isSelected(value);
  if (selected) return ['text-gray-500', 'dark:text-gray-400'];
  return ['text-gray-500', 'dark:text-gray-500'];
}
</script>

<template>
  <div class="flex w-full min-w-0 flex-col">
    <span
      v-if="label"
      :id="`${id}-label`"
      class="mb-2 block text-sm font-medium"
      :class="FIELD_LABEL_CLASSES"
    >
      {{ label }}
      <span v-if="required" class="ml-0.5 text-error" aria-hidden="true">*</span>
    </span>

    <div
      :id="id"
      tabindex="-1"
      role="radiogroup"
      :aria-labelledby="label ? `${id}-label` : undefined"
      :aria-required="required"
      :aria-invalid="error"
      :aria-describedby="
        [error && errorMessage ? errorId : '', helperText && !error ? helperId : '']
          .filter(Boolean)
          .join(' ') || undefined
      "
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      @blur="handleBlur"
    >
      <button
        v-for="option in STORE_TYPE_OPTIONS"
        :key="option.value"
        type="button"
        role="radio"
        :name="name"
        :class="cardClasses(option.value)"
        :aria-checked="isSelected(option.value)"
        :aria-label="`${option.label}. ${option.description}`"
        :disabled="disabled"
        :tabindex="isSelected(option.value) ? 0 : -1"
        @click="handleSelect(option.value)"
      >
        <span
          v-if="isSelected(option.value)"
          class="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-100/25"
          aria-hidden="true"
        >
          <FontAwesomeIcon
            :icon="['fas', 'check']"
            size="2xs"
            class="text-gray-900 dark:text-white"
          />
        </span>
        <span
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-200"
          :class="iconWrapperClasses(option.value)"
          aria-hidden="true"
        >
          <FontAwesomeIcon
            :icon="['fas', option.icon]"
            class="h-5 w-5"
            :class="iconClasses(option.value)"
          />
        </span>
        <span class="text-sm leading-tight" :class="labelClasses(option.value)">
          {{ option.label }}
        </span>
        <span class="text-xs leading-snug" :class="descriptionClasses(option.value)">
          {{ option.description }}
        </span>
      </button>
    </div>

    <p
      v-if="helperText && !error"
      :id="helperId"
      class="mt-2 text-sm"
      :class="FIELD_HELPER_CLASSES"
    >
      {{ helperText }}
    </p>

    <p v-if="error && errorMessage" :id="errorId" class="mt-2 text-sm text-error" role="alert">
      {{ errorMessage }}
    </p>
  </div>
</template>
