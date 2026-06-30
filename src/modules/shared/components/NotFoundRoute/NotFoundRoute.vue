<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button } from '@/modules/ui/components';
import ErrorPageShell from '@/modules/shared/components/ErrorPageShell/ErrorPageShell.vue';

const router = useRouter();
const mainRef = ref<HTMLElement | null>(null);

onMounted(() => {
  mainRef.value?.focus({ preventScroll: true });
});

const goHome = async (): Promise<void> => {
  await router.push({ name: 'Home' });
};

const goBack = async (): Promise<void> => {
  if (globalThis.history.length > 1) {
    router.back();
  } else {
    await router.push({ name: 'Home' });
  }
};
</script>

<template>
  <ErrorPageShell>
    <main
      id="main-content"
      ref="mainRef"
      tabindex="-1"
      lang="es"
      class="flex flex-1 flex-col items-center justify-center px-4 py-12 outline-none motion-safe:animate-theme-switch motion-reduce:animate-none sm:px-6 sm:py-16 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      aria-labelledby="error-heading"
    >
      <output
        class="block w-full max-w-lg rounded-2xl border border-gray-200/90 bg-white/90 p-8 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-gray-950/85 sm:p-10"
        aria-live="polite"
        aria-describedby="error-desc"
      >
        <div class="flex flex-col items-center text-center">
          <div
            class="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
            aria-hidden="true"
          >
            <FontAwesomeIcon :icon="['fas', 'map-location-dot']" class="h-7 w-7" />
          </div>

          <p
            id="error-status"
            class="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-700 dark:text-primary-400"
          >
            Error 404
          </p>

          <h1
            id="error-heading"
            class="font-hero text-4xl font-bold tabular-nums tracking-tight text-gray-900 sm:text-5xl dark:text-white"
          >
            Página no encontrada
          </h1>

          <p
            id="error-desc"
            class="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-gray-600 dark:text-gray-300"
          >
            La dirección no existe o cambió. Comprueba la URL o vuelve al inicio.
          </p>

          <nav
            class="mt-10 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:justify-center"
            aria-label="Opciones para salir de esta página"
          >
            <Button
              variant="ghost"
              size="lg"
              :icon="['fas', 'arrow-left']"
              class="cursor-pointer"
              @click="goBack"
            >
              Volver atrás
            </Button>
            <Button
              variant="primary"
              size="lg"
              :icon="['fas', 'home']"
              class="cursor-pointer"
              @click="goHome"
            >
              Ir al inicio
            </Button>
          </nav>
        </div>
      </output>
    </main>
  </ErrorPageShell>
</template>
