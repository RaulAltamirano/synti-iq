<script setup lang="ts">
import { computed, useId } from 'vue';
import type { ComponentSize } from '../../types/component.types';

export interface ToggleProps {
  modelValue: boolean;
  disabled?: boolean;
  size?: ComponentSize;
  label?: string;
  labelPosition?: 'left' | 'right';
}

const props = withDefaults(defineProps<ToggleProps>(), {
  disabled: false,
  size: 'md',
  label: '',
  labelPosition: 'right',
});

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const labelId = useId();
const switchAriaLabelledby = computed(() => (props.label ? labelId : undefined));
const switchAriaLabel = computed(() => (props.label ? undefined : 'Toggle'));

const toggle = () => {
  if (!props.disabled) emit('update:modelValue', !props.modelValue);
};

const sizeConfig = computed(() => {
  const configs: Record<
    ComponentSize,
    { track: string; thumb: string; translate: string; text: string }
  > = {
    xs: { track: 'w-6 h-3', thumb: 'w-2.5 h-2.5', translate: 'translate-x-3', text: 'text-xs' },
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4', text: 'text-sm' },
    md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5', text: 'text-base' },
    lg: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6', text: 'text-lg' },
    xl: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7', text: 'text-xl' },
  };
  return configs[props.size];
});

const trackClasses = computed(() => {
  const base = [
    'relative',
    'inline-flex',
    'items-center',
    'rounded-full',
    'transition-colors',
    'duration-200',
    'ease-in-out',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-primary',
    sizeConfig.value.track,
    props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    props.modelValue ? 'bg-primary dark:bg-primary' : 'bg-gray-300 dark:bg-gray-600',
  ];
  return base;
});

const thumbClasses = computed(() => [
  'absolute',
  'left-0.5',
  'inline-block',
  'rounded-full',
  'bg-white',
  'shadow',
  'transform',
  'transition-transform',
  'duration-200',
  'ease-in-out',
  sizeConfig.value.thumb,
  props.modelValue ? sizeConfig.value.translate : '',
]);

const labelClasses = computed(() => [
  sizeConfig.value.text,
  'select-none',
  props.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300',
]);
</script>

<template>
  <div
    class="inline-flex items-center gap-2"
    :class="{ 'cursor-not-allowed': disabled, 'cursor-pointer': !disabled }"
  >
    <span v-if="label && labelPosition === 'left'" :id="labelId" :class="labelClasses">
      {{ label }}
    </span>

    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-labelledby="switchAriaLabelledby"
      :aria-label="switchAriaLabel"
      :disabled="disabled"
      :class="trackClasses"
      @click="toggle"
    >
      <span :class="thumbClasses" />
    </button>

    <span v-if="label && labelPosition === 'right'" :id="labelId" :class="labelClasses">
      {{ label }}
    </span>
  </div>
</template>
