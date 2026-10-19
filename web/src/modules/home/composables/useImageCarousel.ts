import { computed, Ref, ComputedRef } from 'vue';

/**
 * Interface para el retorno del composable useImageCarousel
 */
interface UseImageCarouselReturn {
  imagesCount: ComputedRef<number>;
  currentImage: ComputedRef<string | null>;
  nextImage: () => void;
  prevImage: () => void;
  setCurrentImage: (index: number) => void;
}

/**
 * Composable para manejar la navegación de un carrusel de imágenes
 * @param currentIndexRef - Ref con el índice actual
 * @param imagesRef - Ref con el array de URLs de imágenes
 * @returns Métodos y estado computado para controlar el carrusel
 */
export function useImageCarousel(
  currentIndexRef: Ref<number>,
  imagesRef: Ref<string[]>
): UseImageCarouselReturn {
  // Propiedades computadas
  const imagesCount = computed<number>(() => imagesRef.value.length);

  const currentImage = computed<string | null>(() => {
    if (imagesRef.value.length === 0) return null;
    return imagesRef.value[currentIndexRef.value];
  });

  /**
   * Avanzar a la siguiente imagen
   */
  function nextImage(): void {
    if (imagesCount.value <= 1) return;
    currentIndexRef.value = (currentIndexRef.value + 1) % imagesCount.value;
  }

  /**
   * Retroceder a la imagen anterior
   */
  function prevImage(): void {
    if (imagesCount.value <= 1) return;
    currentIndexRef.value = (currentIndexRef.value - 1 + imagesCount.value) % imagesCount.value;
  }

  /**
   * Ir a una imagen específica
   * @param index - Índice de la imagen destino
   */
  function setCurrentImage(index: number): void {
    if (index < 0 || index >= imagesCount.value) return;
    currentIndexRef.value = index;
  }

  return {
    // Estado computado
    imagesCount,
    currentImage,

    // Métodos
    nextImage,
    prevImage,
    setCurrentImage,
  };
}
