<script setup lang="ts">
import { computed } from 'vue';

export interface TotpInputProps {
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
  acceptBackupCode?: boolean;
  id?: string;
  /** Emit 'complete' when value length reaches one of these. Enables auto-submit. */
  autoSubmitLengths?: number[];
}

const props = withDefaults(defineProps<TotpInputProps>(), {
  placeholder: '000000',
  disabled: false,
  error: null,
  acceptBackupCode: false,
  id: undefined,
  autoSubmitLengths: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  complete: [];
}>();

const sizeClasses = computed(() =>
  props.acceptBackupCode ? 'text-lg tracking-wider' : 'text-2xl tracking-widest'
);

const inputClasses = computed(() => {
  const base = 'focus:ring-primary';
  const state = props.disabled
    ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'
    : props.error
      ? 'border-red-500 dark:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500';
  return `${base} ${state} ${sizeClasses.value}`;
});

function handleInput(event: Event) {
  const input = event.target as HTMLInputElement;
  let value = input.value;

  if (props.acceptBackupCode) {
    value = value.replace(/[^A-Za-z0-9-]/g, '').slice(0, 14);
  } else {
    value = value.replace(/\D/g, '').slice(0, 6);
  }

  emit('update:modelValue', value);

  if (
    props.autoSubmitLengths?.length &&
    props.autoSubmitLengths.includes(value.length) &&
    !props.disabled
  ) {
    emit('complete');
  }
}
</script>

<template>
  <div class="space-y-1">
    <input
      :id="id"
      :value="modelValue"
      type="text"
      :inputmode="acceptBackupCode ? 'text' : 'numeric'"
      :maxlength="acceptBackupCode ? 14 : 6"
      :placeholder="placeholder"
      :disabled="disabled"
      autocomplete="one-time-code"
      class="w-full px-4 py-3 rounded-lg text-center font-mono tracking-widest transition-colors border focus:outline-none focus:ring-2"
      :class="inputClasses"
      @input="handleInput"
    />
    <p v-if="error" class="text-sm text-red-500 dark:text-red-400">
      {{ error }}
    </p>
  </div>
</template>
