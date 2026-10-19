<script setup lang="ts">
import StoreScheduleEditor from '@/modules/store/components/StoreScheduleEditor/StoreScheduleEditor.vue';
import type { StoreScheduleModelValue } from '@/modules/store/components/StoreScheduleEditor/StoreScheduleEditor.ts';

interface Props {
  modelValue: StoreScheduleModelValue;
  disabled?: boolean;
  validationError?: string;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  validationError: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: StoreScheduleModelValue];
}>();
</script>

<template>
  <StoreScheduleEditor
    :model-value="modelValue"
    :disabled="disabled"
    :validation-error="validationError"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
