<script setup lang="ts">
import AnimatedBackground from '@/modules/shared/components/Backgound/AnimatedBackground.vue';
import ThemeFloatingToggle from '@/modules/shared/components/ThemeFloatingToggle/ThemeFloatingToggle.vue';
</script>

<template>
  <div
    class="relative flex min-h-dvh flex-col text-gray-900 transition-colors duration-200 motion-reduce:transition-none dark:text-gray-100"
  >
    <AnimatedBackground intensity="medium" />
    <ThemeFloatingToggle />
    <div class="relative z-10 flex min-h-0 flex-1 flex-col">
      <slot />
    </div>
  </div>
</template>
