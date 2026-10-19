<script setup lang="ts">
import { computed } from 'vue';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: SkeletonVariant;
  class?: string;
}

const props = withDefaults(defineProps<SkeletonProps>(), {
  variant: 'rectangular',
});

const toCssValue = (v: string | number): string =>
  typeof v === 'number' ? `${v}px` : /^\d+$/.test(String(v)) ? `${v}px` : String(v);

const style = computed(() => {
  const s: Record<string, string> = {};
  if (props.width !== undefined) s.width = toCssValue(props.width);
  if (props.height !== undefined) s.height = toCssValue(props.height);
  return s;
});

const variantClasses = computed(() => {
  const base = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  const variantMap: Record<SkeletonVariant, string> = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };
  return `${base} ${variantMap[props.variant]}`;
});
</script>

<template>
  <div
    :class="[variantClasses, $props.class]"
    :style="Object.keys(style).length ? style : undefined"
    aria-hidden="true"
  />
</template>
