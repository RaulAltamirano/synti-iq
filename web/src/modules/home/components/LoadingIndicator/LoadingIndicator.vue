<template>
  <!-- Indicador de carga principal -->
  <div
    v-if="loading"
    class="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
  >
    <div class="flex flex-col items-center">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
      <span class="text-white mt-2 text-sm font-medium">Cargando imágenes...</span>
    </div>
  </div>

  <!-- Indicador de progreso de carga para cada imagen -->
  <div
    v-if="isChangingImage && !loading"
    class="absolute bottom-0 left-0 h-1 bg-white/70 z-30 transition-all duration-300"
    :style="{ width: `${loadingProgress}%` }"
  ></div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  isChangingImage: {
    type: Boolean,
    default: false,
  },
  loadingProgress: {
    type: Number,
    default: 0,
  },
});
</script>

<style scoped>
/* Agregar animación para el indicador de progreso */
@keyframes pulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
