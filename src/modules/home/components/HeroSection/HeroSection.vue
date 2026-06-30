<script setup lang="ts">
/** Cover + BackgroundImage pattern is mirrored in ProfileHeroCard (profile header). */
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import BackgroundImage from '../BackgroundImage/BackgroundImage.vue';
import { useGreeting } from '../../composables/useGreeting';
import { useAuthStore } from '@/modules/auth/stores/authStore';
import { useTheme } from '@/modules/shared/composables/useTheme';
import { useImageGalleryStore } from '../../stores/useGalleryStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { burstMotionVars, useHeartBurst } from '../../composables/useHeartBurst';

const { isDark } = useTheme();
const authStore = useAuthStore();
const firstName = computed(() => authStore.currentUser?.firstName ?? null);
const { greetingPrefix, displayName, greeting } = useGreeting(firstName);
const isLiked = ref(false);
const galleryStore = useImageGalleryStore();
const { images } = storeToRefs(galleryStore);
const { nextImage, prevImage } = galleryStore;
const { particles: heartBurstParticles, spawnBurst } = useHeartBurst();

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

const onLikeClick = () => {
  const willLike = !isLiked.value;
  if (willLike) {
    spawnBurst(15);
  }
  isLiked.value = willLike;
};
</script>

<template>
  <section
    aria-labelledby="hero-heading"
    class="relative w-full overflow-hidden aspect-[21/9] min-h-[200px] sm:min-h-[280px]"
  >
    <BackgroundImage />

    <!-- Overlay suave para legibilidad -->
    <div
      class="absolute inset-0 z-[1] pointer-events-none"
      :class="
        isDark
          ? 'bg-gradient-to-t from-black/60 via-black/20 to-transparent'
          : 'bg-gradient-to-t from-black/40 via-black/10 to-transparent'
      "
    />

    <!-- Desvanecimiento al fondo -->
    <div
      class="absolute bottom-0 left-0 right-0 h-24 sm:h-32 md:h-40 z-[2] pointer-events-none"
      :class="
        isDark
          ? 'bg-gradient-to-b from-transparent to-gray-900'
          : 'bg-gradient-to-b from-transparent to-gray-50'
      "
    />

    <!-- Saludo: serif editorial + nombre en sans -->
    <div class="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
      <h1
        id="hero-heading"
        class="flex max-w-4xl flex-col items-center gap-1 text-center sm:gap-1.5 md:gap-2"
        :aria-label="greeting"
      >
        <template v-if="displayName">
          <span
            class="font-greeting text-fluid-hero-greeting font-normal leading-snug tracking-wide text-white/88"
          >
            {{ greetingPrefix }},
          </span>
          <span
            class="font-hero text-fluid-hero-display font-semibold leading-tight tracking-tight text-balance text-white drop-shadow-2xl"
          >
            {{ displayName }}
          </span>
        </template>
        <template v-else>
          <span
            class="font-greeting text-fluid-hero-display font-normal leading-tight tracking-wide text-balance text-white/92 drop-shadow-2xl"
          >
            {{ greetingPrefix }}.
          </span>
        </template>
      </h1>
    </div>

    <!-- Botones: abajo a la derecha -->
    <div
      class="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-20 flex items-center gap-1.5 sm:gap-2"
      role="group"
      aria-label="Controles de galería"
    >
      <!-- Anterior -->
      <button
        type="button"
        class="min-h-11 min-w-11 flex items-center justify-center rounded-full transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
        :class="
          isDark
            ? 'bg-black/40 hover:bg-black/60 text-white'
            : 'bg-white/40 hover:bg-white/60 text-gray-800'
        "
        :disabled="images.length <= 1"
        aria-label="Imagen anterior"
        @click="prevImage"
      >
        <FontAwesomeIcon icon="chevron-left" class="w-4 h-4" />
      </button>

      <!-- Siguiente -->
      <button
        type="button"
        class="min-h-11 min-w-11 flex items-center justify-center rounded-full transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
        :class="
          isDark
            ? 'bg-black/40 hover:bg-black/60 text-white'
            : 'bg-white/40 hover:bg-white/60 text-gray-800'
        "
        :disabled="images.length <= 1"
        aria-label="Siguiente imagen"
        @click="nextImage"
      >
        <FontAwesomeIcon icon="chevron-right" class="w-4 h-4" />
      </button>

      <!-- Corazón + estallido (degradado por familia: warning / primary+info / violet) -->
      <div class="relative shrink-0 overflow-visible">
        <button
          type="button"
          class="relative z-10 min-h-11 min-w-11 flex items-center justify-center rounded-full transition-all duration-200 touch-manipulation"
          :class="isDark ? 'bg-black/40 hover:bg-black/60' : 'bg-white/40 hover:bg-white/60'"
          aria-label="Me encanta"
          @click="onLikeClick"
        >
          <FontAwesomeIcon
            :icon="isLiked ? ['fas', 'heart'] : ['far', 'heart']"
            class="w-4 h-4 transition-colors"
            :class="isLiked ? 'text-error-500' : isDark ? 'text-white' : 'text-gray-800'"
          />
        </button>
        <div
          class="pointer-events-none absolute left-1/2 top-1/2 z-20 h-0 w-0 -translate-x-1/2 -translate-y-1/2 overflow-visible"
          aria-hidden="true"
        >
          <span
            v-for="p in heartBurstParticles"
            :key="p.id"
            class="hero-heart-burst-piece absolute left-0 top-0"
            :style="burstMotionVars(p)"
          >
            <svg
              class="hero-heart-burst-svg drop-shadow-lg"
              :width="p.sizePx"
              :height="p.sizePx"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <defs>
                <linearGradient :id="p.gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" :stop-color="p.colorFrom" />
                  <stop offset="100%" :stop-color="p.colorTo" />
                </linearGradient>
              </defs>
              <path :fill="`url(#${p.gradientId})`" :d="HEART_PATH" />
            </svg>
          </span>
        </div>
      </div>

      <!-- Ver colección -->
      <RouterLink
        to="/gallery"
        class="min-h-11 min-w-11 sm:min-w-0 sm:px-3 flex items-center justify-center gap-1.5 rounded-full transition-all duration-200 touch-manipulation"
        :class="
          isDark
            ? 'bg-black/40 hover:bg-black/60 text-white'
            : 'bg-white/40 hover:bg-white/60 text-gray-800'
        "
        aria-label="Ver colección"
      >
        <FontAwesomeIcon icon="images" class="w-4 h-4 shrink-0" />
        <span class="hidden sm:inline text-xs font-medium">Ver colección</span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.hero-heart-burst-piece {
  animation: hero-heart-burst var(--hb-dur, 1s) cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transform: translate(-50%, -50%);
}

@keyframes hero-heart-burst {
  0% {
    transform: translate(-50%, -50%) translate(0, 0) scale(0.25) rotate(0deg);
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) translate(var(--hb-tx), var(--hb-ty)) scale(1.08)
      rotate(var(--hb-spin));
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-heart-burst-piece {
    animation: none;
    opacity: 0;
  }
}
</style>
