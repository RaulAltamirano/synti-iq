<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Input, Select } from '@/modules/ui';
import { FIELD_HELPER_CLASSES, FIELD_LABEL_CLASSES } from '@/modules/ui/types/component.types';
import {
  DEFAULT_PHONE_DIAL,
  PHONE_COUNTRY_OPTIONS,
  findPhoneCountryByDial,
} from '@/modules/store/constants/phone-country-codes';
import {
  buildE164Phone,
  parseE164Phone,
  sanitizeLocalDigits,
} from '@/modules/store/utils/phone-number';

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
  label: 'Phone',
  helperText: '',
  disabled: false,
  required: false,
  error: false,
  errorMessage: '',
  id: 'store-phone',
  name: 'store-phone',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  blur: [event: FocusEvent];
}>();

const dialCode = ref(DEFAULT_PHONE_DIAL);
const localNumber = ref('');

const countryOptions = PHONE_COUNTRY_OPTIONS.map((c) => ({
  value: c.dial,
  label: `${c.dial} ${c.label}`,
}));

const selectedCountry = computed(() => findPhoneCountryByDial(dialCode.value));

const localMaxLength = computed(() => selectedCountry.value?.localLength ?? 10);

const localPlaceholder = computed(() => {
  const len = localMaxLength.value;
  return '0'.repeat(len);
});

function syncFromModelValue(value: string): void {
  const parsed = parseE164Phone(value);
  dialCode.value = parsed.dial;
  const country = findPhoneCountryByDial(parsed.dial);
  localNumber.value = sanitizeLocalDigits(parsed.local, country?.localLength ?? 10);
}

function emitCombined(): void {
  const country = selectedCountry.value;
  emit('update:modelValue', buildE164Phone(dialCode.value, localNumber.value, country));
}

function handleDialChange(value: string | number | (string | number)[]): void {
  if (typeof value !== 'string') return;
  dialCode.value = value;
  const country = findPhoneCountryByDial(value);
  if (country) {
    localNumber.value = sanitizeLocalDigits(localNumber.value, country.localLength);
  }
  emitCombined();
}

function handleLocalUpdate(value: string | number): void {
  localNumber.value = sanitizeLocalDigits(String(value), localMaxLength.value);
  emitCombined();
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event);
}

watch(
  () => props.modelValue,
  (value) => {
    const built = buildE164Phone(dialCode.value, localNumber.value, selectedCountry.value);
    if ((value ?? '').trim() !== built) {
      syncFromModelValue(value ?? '');
    }
  },
  { immediate: true }
);
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

    <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div class="w-full shrink-0 sm:w-44">
        <Select
          :id="`${id}-country`"
          :model-value="dialCode"
          label="Country"
          :options="countryOptions"
          :disabled="disabled"
          :searchable="true"
          search-placeholder="Search country…"
          full-width
          :name="`${name}-country`"
          @update:model-value="handleDialChange"
        />
      </div>
      <div class="min-w-0 flex-1">
        <Input
          :id="id"
          :model-value="localNumber"
          type="tel"
          label="Number"
          :placeholder="localPlaceholder"
          :prefix-icon="['fas', 'phone']"
          :disabled="disabled"
          :error="error"
          :maxlength="localMaxLength"
          autocomplete="tel-national"
          full-width
          :name="name"
          @update:model-value="handleLocalUpdate"
          @blur="handleBlur"
        />
      </div>
    </div>

    <p v-if="helperText && !error" class="mt-2 text-sm" :class="FIELD_HELPER_CLASSES">
      {{ helperText }}
    </p>

    <p v-if="error && errorMessage" class="mt-2 text-sm text-error" role="alert">
      {{ errorMessage }}
    </p>
  </div>
</template>
