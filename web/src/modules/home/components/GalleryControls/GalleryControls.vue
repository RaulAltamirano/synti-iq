<template>
  <div class="hidden sm:flex absolute inset-y-0 left-2 sm:left-4 items-center z-20">
    <button
      class="p-2 sm:p-3 rounded-full bg-black/40 text-white hover:bg-black/60 focus:ring-2 focus:ring-white/50 active:scale-95 transition-all duration-300"
      :class="{ 'opacity-30 cursor-not-allowed': imagesCount <= 1 }"
      :disabled="imagesCount <= 1"
      aria-label="Imagen anterior"
      @click="$emit('prev')"
    >
      <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        ></path>
      </svg>
    </button>
  </div>

  <div class="hidden sm:flex absolute inset-y-0 right-2 sm:right-4 items-center z-20">
    <button
      class="p-2 sm:p-3 rounded-full bg-black/40 text-white hover:bg-black/60 focus:ring-2 focus:ring-white/50 active:scale-95 transition-all duration-300"
      :class="{ 'opacity-30 cursor-not-allowed': imagesCount <= 1 }"
      :disabled="imagesCount <= 1"
      aria-label="Siguiente imagen"
      @click="$emit('next')"
    >
      <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        ></path>
      </svg>
    </button>
  </div>

  <div
    class="hidden sm:flex absolute bottom-3 sm:bottom-4 right-3 sm:right-4 items-center gap-2 z-20"
  >
    <button
      class="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 focus:ring-2 focus:ring-white/50 active:scale-95 transition-all duration-300"
      aria-label="Pausar/Reproducir"
      @click="$emit('toggle-autoplay')"
    >
      <svg v-if="autoplay" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 9v6m4-6v6"
        ></path>
      </svg>
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
        ></path>
      </svg>
    </button>

    <div class="flex items-center bg-black/40 rounded-lg px-3 py-1.5 backdrop-blur-sm">
      <input
        type="range"
        min="2000"
        max="10000"
        step="1000"
        :value="intervalTime"
        class="w-20 h-1.5"
        @change="$emit('update-interval', $event.target.value)"
      />
      <span class="text-white text-xs ml-2 font-medium">{{ intervalTime / 1000 }}s</span>
    </div>
  </div>

  <div
    class="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-1.5 z-20"
  >
    <button
      v-for="index in imagesCount"
      :key="index - 1"
      class="w-3 h-3 sm:w-2 sm:h-2 min-w-[12px] min-h-[12px] rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
      :class="currentIndex === index - 1 ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'"
      :aria-label="`Ir a imagen ${index}`"
      @click="$emit('select', index - 1)"
    ></button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  currentIndex: {
    type: Number,
    required: true,
  },
  imagesCount: {
    type: Number,
    required: true,
  },
  autoplay: {
    type: Boolean,
    default: true,
  },
  intervalTime: {
    type: Number,
    default: 5000,
  },
});

defineEmits(['prev', 'next', 'select', 'toggle-autoplay', 'update-interval']);
</script>

<style scoped>
/* Controles semi-transparentes */
button {
  opacity: 0.7;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity, background-color;
}

button:hover {
  opacity: 1;
}

/* Mejorar apariencia del slider */
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 5px;
  height: 3px;
  cursor: pointer;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

input[type='range']:focus {
  outline: none;
}
</style>
