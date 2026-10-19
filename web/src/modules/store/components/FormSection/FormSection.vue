<script setup lang="ts">
interface Props {
  title: string;
}

defineProps<Props>();
</script>

<template>
  <section class="py-6 first:pt-0 last:pb-0">
    <h3 class="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
      {{ title }}
    </h3>
    <div class="flex flex-col gap-4">
      <slot />
    </div>
  </section>
</template>
