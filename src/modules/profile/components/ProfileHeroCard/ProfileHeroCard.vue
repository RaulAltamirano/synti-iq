<script setup lang="ts">
import { storeToRefs } from 'pinia';
import BackgroundImage from '@/modules/home/components/BackgroundImage/BackgroundImage.vue';
import { useImageGalleryStore } from '@/modules/home/stores/useGalleryStore';
import { useTheme } from '@/modules/shared/composables/useTheme';
import { Avatar } from '@/modules/ui/components';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export interface ProfileHeroCardProps {
  userFullName: string | null;
  userEmail: string | null;
  userId: string | number | null;
}

defineProps<ProfileHeroCardProps>();

const { isDark } = useTheme();
const galleryStore = useImageGalleryStore();
const { images } = storeToRefs(galleryStore);
const { nextImage, prevImage } = galleryStore;
</script>

<template>
  <article
    class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg transition-shadow duration-200 dark:border-gray-700 dark:bg-gray-900 dark:shadow-none"
    aria-labelledby="profile-hero-heading"
  >
    <!-- Cover: controles arriba a la derecha (sobre la foto), no en la franja del avatar -->
    <div
      class="relative z-0 isolate aspect-video max-h-44 w-full min-h-24 overflow-hidden sm:max-h-52 sm:min-h-28 md:max-h-56 md:min-h-32"
    >
      <BackgroundImage />

      <div
        class="pointer-events-none absolute inset-0 z-[1]"
        :class="
          isDark
            ? 'bg-gradient-to-t from-black/55 via-black/15 to-transparent'
            : 'bg-gradient-to-t from-black/35 via-black/10 to-transparent'
        "
        aria-hidden="true"
      />

      <!-- Degradado más alto y con “via” para evitar corte duro sobre el avatar -->
      <div
        class="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] h-20 bg-gradient-to-b from-transparent via-white/70 to-white sm:h-24 dark:via-gray-900/75 dark:to-gray-900"
        aria-hidden="true"
      />

      <nav
        class="absolute right-4 top-4 z-30 flex items-center gap-2"
        aria-label="Cover image gallery"
      >
        <button
          type="button"
          class="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full transition-all duration-200 touch-manipulation disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50"
          :class="
            isDark
              ? 'bg-black/45 text-white hover:bg-black/65'
              : 'bg-white/50 text-gray-800 hover:bg-white/75'
          "
          :disabled="images.length <= 1"
          aria-label="Previous cover image"
          @click="prevImage"
        >
          <FontAwesomeIcon icon="chevron-left" class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full transition-all duration-200 touch-manipulation disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50"
          :class="
            isDark
              ? 'bg-black/45 text-white hover:bg-black/65'
              : 'bg-white/50 text-gray-800 hover:bg-white/75'
          "
          :disabled="images.length <= 1"
          aria-label="Next cover image"
          @click="nextImage"
        >
          <FontAwesomeIcon icon="chevron-right" class="h-4 w-4" />
        </button>
      </nav>
    </div>

    <!--
      Barra inferior. Avatar: bottom-full + translate-y-1/2 (centro en el borde cover).
      Móvil: pt-16 deja hueco bajo la mitad inferior del avatar.
      sm+: fila con items-center + hueco invisible (mismo ancho/offset que el avatar) para alinear
      nombre y correo a la altura media del círculo, no arrastrados abajo por padding.
    -->
    <div class="relative z-10 bg-white px-5 pb-6 pt-16 dark:bg-gray-900 sm:px-8 sm:pt-3">
      <div
        class="absolute bottom-full left-1/2 z-30 -translate-x-1/2 translate-y-1/2 sm:left-8 sm:translate-x-0"
      >
        <Avatar
          :name="userFullName || 'User'"
          :color-seed="userId != null ? String(userId) : undefined"
          size="2xl"
          class="shrink-0 font-bold shadow-lg ring-4 ring-white dark:ring-gray-900"
        />
      </div>

      <div
        class="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left"
      >
        <span
          class="pointer-events-none hidden h-32 w-32 shrink-0 sm:ml-8 sm:block"
          aria-hidden="true"
        />
        <div class="flex w-full flex-col justify-center sm:min-h-32 sm:flex-1 sm:justify-center">
          <h2
            id="profile-hero-heading"
            class="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100"
          >
            {{ userFullName || 'User' }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ userEmail || 'Not available' }}
          </p>
        </div>
      </div>
    </div>
  </article>
</template>
