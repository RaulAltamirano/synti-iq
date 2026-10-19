import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { fetchRandomImages } from '../services/unsplashService';

type ImageURL = string;
type LoadedImagesMap = Record<number, boolean>;

export type FetchImagesOptions = {
  force?: boolean;
};

function clearLoadedImagesMap(map: LoadedImagesMap): void {
  for (const key of Object.keys(map)) {
    delete map[Number(key)];
  }
}

export const useImageGalleryStore = defineStore('imageGallery', () => {
  const images = ref<ImageURL[]>([]);
  const currentImageIndex = ref<number>(0);
  const loading = ref<boolean>(true);
  const isChangingImage = ref<boolean>(false);
  const loadingProgress = ref<number>(0);
  const loadedImages: LoadedImagesMap = reactive({});
  const fallbackImage: ImageURL = '/images/default-coding-bg.jpg';
  let progressAnimationId: number | null = null;

  // Acciones
  /**
   * Carga la galería una vez por vida útil del store (navegación SPA).
   * Evita llamar a Unsplash en cada montaje de BackgroundImage.
   */
  async function fetchImages(options: FetchImagesOptions = {}): Promise<void> {
    const { force = false } = options;
    if (!force && images.value.length > 0) {
      return;
    }

    loading.value = true;

    try {
      const imageUrls: ImageURL[] = await fetchRandomImages();
      clearLoadedImagesMap(loadedImages);
      images.value = [...imageUrls];
      currentImageIndex.value = 0;
    } catch {
      clearLoadedImagesMap(loadedImages);
      images.value = [fallbackImage];
      currentImageIndex.value = 0;
    } finally {
      loading.value = false;
    }
  }

  function preloadImages(): void {
    images.value.forEach((src, index) => {
      if (loadedImages[index]) {
        return;
      }
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedImages[index] = true;
      };
      img.onerror = () => {
        loadedImages[index] = false;
      };
    });
  }

  function handleImageLoad(index: number): void {
    loadedImages[index] = true;

    if (index === currentImageIndex.value) {
      loading.value = false;
      isChangingImage.value = false;
      loadingProgress.value = 100;
    }
  }

  function startImageTransition(): void {
    isChangingImage.value = true;
    loadingProgress.value = 0;

    if (progressAnimationId !== null) {
      cancelAnimationFrame(progressAnimationId);
    }

    const startTime = Date.now();
    const duration = 700;

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      loadingProgress.value = Math.min(100, (elapsed / duration) * 100);

      if (elapsed < duration) {
        progressAnimationId = requestAnimationFrame(animateProgress);
      } else {
        isChangingImage.value = false;
      }
    };

    animateProgress();
  }

  function cleanup(): void {
    if (progressAnimationId !== null) {
      cancelAnimationFrame(progressAnimationId);
      progressAnimationId = null;
    }
  }

  function nextImage(): void {
    if (images.value.length <= 1) return;
    startImageTransition();
    currentImageIndex.value = (currentImageIndex.value + 1) % images.value.length;
  }

  function prevImage(): void {
    if (images.value.length <= 1) return;
    startImageTransition();
    currentImageIndex.value =
      (currentImageIndex.value - 1 + images.value.length) % images.value.length;
  }

  return {
    images,
    currentImageIndex,
    loading,
    isChangingImage,
    loadingProgress,
    loadedImages,
    fetchImages,
    preloadImages,
    handleImageLoad,
    startImageTransition,
    cleanup,
    nextImage,
    prevImage,
  };
});
