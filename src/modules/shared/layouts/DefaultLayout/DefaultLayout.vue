<script lang="ts" src="./DefaultLayout.ts" />

<template>
  <div
    class="min-h-screen w-full overflow-x-hidden text-gray-800 dark:text-white"
  >
    <!-- Navbar con useMotion -->
    <div ref="navbar" class="fixed top-0 w-full z-50">
      <Navbar />
    </div>

    <main class="pt-16">
      <!-- AnimatedBackground con useMotion -->
      <div ref="animatedBackground" class="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>

      <div
        ref="scrollContainer"
        class="relative z-10 custom-scrollbar min-h-screen"
      >
        <RouterView v-slot="{ Component }">
          <div ref="routerView" class="relative z-10">
            <component :is="Component" />
          </div>
        </RouterView>
      </div>

      <!-- Scroll to top button -->
      <Transition name="fade">
        <button
          v-show="showScrollTop"
          type="button"
          class="fixed bottom-8 right-8 p-3 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 z-50 max-md:hidden"
          aria-label="Volver arriba"
          @click="scrollToTop"
        >
          <FontAwesomeIcon icon="chevron-up" class="w-5 h-5" />
        </button>
      </Transition>
    </main>
  </div>
</template>

<style>
/* Estilos personalizados para el scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) var(--color-gray-200);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--color-gray-200);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, var(--color-primary), #8b5cf6);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, var(--color-primary-600), #7c3aed);
}

/* Dark mode scrollbar */
.dark .custom-scrollbar {
  scrollbar-color: var(--color-primary-400) var(--color-gray-700);
}

.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: var(--color-gray-700);
}

/* Animaciones */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Remover scrollbar por defecto */
* {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* Optimizaciones para dispositivos táctiles */
@media (hover: none) {
  .custom-scrollbar {
    scrollbar-width: none;
  }

  .custom-scrollbar::-webkit-scrollbar {
    display: none;
  }
}
</style>
