<script lang="js" src="./ToggleThemeButton.ts" />

<template>
  <Teleport to="body">
    <!-- Botón con animaciones -->
    <button
      ref="buttonRef"
      aria-label="Change theme"
      class="fixed z-50 p-3 rounded-full shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md transition-all bottom-4 right-4 md:top-4 md:bottom-auto md:right-4 hover:shadow-2xl"
      @click="toggleTheme"
    >
      <div class="relative w-6 h-6">
        <Transition name="icon" mode="out-in">
          <!-- Icono oscuro -->
          <svg
            v-if="isDark"
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 text-indigo-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>

          <!-- Icono claro -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 text-amber-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
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
/* Transiciones del icono */
.icon-enter-active,
.icon-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.icon-enter-from,
.icon-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
