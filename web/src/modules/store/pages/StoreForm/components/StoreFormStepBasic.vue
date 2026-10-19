<script setup lang="ts">
import { Field } from 'vee-validate';
import { Input } from '@/modules/ui';
import CurrencyAmountInput from '@/modules/store/components/CurrencyAmountInput/CurrencyAmountInput.vue';
import FormSection from '@/modules/store/components/FormSection/FormSection.vue';
import PhoneNumberInput from '@/modules/store/components/PhoneNumberInput/PhoneNumberInput.vue';
import StoreTypePicker from '@/modules/store/components/StoreTypePicker/StoreTypePicker.vue';
import { STORE_FORM_LIMITS } from '@/modules/store/constants/store-form-limits';
import { toFieldErrorProps } from '@/modules/store/utils/form-field-error';

interface Props {
  disabled?: boolean;
  required?: boolean;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  required: true,
});
</script>

<template>
  <FormSection title="Store identity">
    <Field v-slot="{ componentField, errorMessage }" name="name">
      <Input
        id="store-name"
        v-bind="componentField"
        label="Store name"
        placeholder="e.g. Downtown Store"
        :prefix-icon="['fas', 'store']"
        :error="!!errorMessage"
        :error-message="errorMessage ?? ''"
        :required="required"
        :disabled="disabled"
        :maxlength="STORE_FORM_LIMITS.STORE_NAME_MAX"
        autocomplete="organization"
        full-width
        name="store-name"
      />
    </Field>

    <Field v-slot="{ value, handleChange, handleBlur, errorMessage }" name="storeType">
      <StoreTypePicker
        :model-value="value"
        :disabled="disabled"
        :required="required"
        v-bind="toFieldErrorProps(errorMessage)"
        @update:model-value="handleChange"
        @blur="handleBlur"
      />
    </Field>
  </FormSection>

  <FormSection title="Contact">
    <Field
      v-slot="{ value, handleChange, handleBlur, errorMessage }"
      name="phoneNumber"
      :validate-on-model-update="false"
      :validate-on-input="false"
    >
      <PhoneNumberInput
        :model-value="value"
        label=""
        :disabled="disabled"
        v-bind="toFieldErrorProps(errorMessage)"
        @update:model-value="handleChange"
        @blur="handleBlur"
      />
    </Field>

    <Field v-slot="{ componentField, errorMessage }" name="email">
      <Input
        id="store-email"
        v-bind="componentField"
        type="email"
        label="Email"
        placeholder="store@example.com"
        :prefix-icon="['fas', 'envelope']"
        :error="!!errorMessage"
        :error-message="errorMessage ?? ''"
        :disabled="disabled"
        :maxlength="STORE_FORM_LIMITS.EMAIL_MAX_LENGTH"
        autocomplete="email"
        full-width
        name="store-email"
      />
    </Field>
  </FormSection>

  <FormSection title="Sales targets">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field v-slot="{ value, handleChange, handleBlur, errorMessage }" name="dailySalesTarget">
        <CurrencyAmountInput
          id="daily-sales-target"
          :model-value="value"
          label="Daily target"
          :max="STORE_FORM_LIMITS.SALES_MAX"
          v-bind="toFieldErrorProps(errorMessage)"
          :disabled="disabled"
          name="daily-sales-target"
          @update:model-value="handleChange"
          @blur="handleBlur"
        />
      </Field>

      <Field v-slot="{ value, handleChange, handleBlur, errorMessage }" name="monthlySalesTarget">
        <CurrencyAmountInput
          id="monthly-sales-target"
          :model-value="value"
          label="Monthly target"
          :max="STORE_FORM_LIMITS.SALES_MAX"
          v-bind="toFieldErrorProps(errorMessage)"
          :disabled="disabled"
          name="monthly-sales-target"
          @update:model-value="handleChange"
          @blur="handleBlur"
        />
      </Field>
    </div>
  </FormSection>
</template>
