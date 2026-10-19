<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '@/modules/shared/composables/useTheme';

const { isDark, themeStore } = useTheme();

const toggleTheme = (): void => {
  themeStore.toggleTheme();
};

/** Estado tras la acción (patrón recomendado para lectores de pantalla). */
const themeToggleLabel = computed(() =>
  isDark.value ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
);
</script>

<template>
  <Teleport to="body">
    <button
      type="button"
      :aria-label="themeToggleLabel"
      class="fixed z-50 p-3 rounded-full shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md transition-all bottom-4 right-4 md:top-4 md:bottom-auto md:right-4 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      @click="toggleTheme"
    >
      <div class="relative w-6 h-6">
        <Transition name="theme-icon" mode="out-in">
          <svg
            v-if="isDark"
            key="moon"
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 text-indigo-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          <svg
            v-else
            key="sun"
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 text-amber-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </Transition>
      </div>
    </button>
  </Teleport>
</template>

<style scoped>
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.theme-icon-enter-from,
.theme-icon-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
