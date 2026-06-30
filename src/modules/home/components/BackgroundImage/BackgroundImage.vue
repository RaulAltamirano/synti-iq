<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useImageGalleryStore } from '../../stores/useGalleryStore';

const galleryStore = useImageGalleryStore();
const { images, currentImageIndex } = storeToRefs(galleryStore);
const { handleImageLoad, fetchImages, preloadImages } = galleryStore;

onMounted(async () => {
  await fetchImages();
  preloadImages();
});
</script>

<template>
  <div class="absolute inset-0 w-full h-full overflow-hidden bg-gray-200">
    <!-- Simultaneous enter/leave (no mode) = crossfade; layers are absolutely stacked -->
    <div class="absolute inset-0">
      <transition name="hero-image">
        <img
          v-if="images.length > 0"
          :key="currentImageIndex"
          :src="images[currentImageIndex]"
          alt=""
          class="cover-image hero-image-layer"
          @load="() => handleImageLoad(currentImageIndex)"
        />
      </transition>
    </div>
  </div>
</template>

<style scoped>
.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-image-layer {
  position: absolute;
  inset: 0;
}

.hero-image-enter-active,
.hero-image-leave-active {
  transition:
    opacity 0.85s cubic-bezier(0.4, 0, 0.2, 1),
    transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-image-enter-from {
  opacity: 0;
  transform: scale(1.045);
}

.hero-image-leave-to {
  opacity: 0;
  transform: scale(1);
}

.hero-image-enter-to,
.hero-image-leave-from {
  opacity: 1;
  transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .hero-image-enter-active,
  .hero-image-leave-active {
    transition-duration: 0.01ms;
    transition-property: opacity;
  }

  .hero-image-enter-from {
    transform: none;
  }
}
</style>
