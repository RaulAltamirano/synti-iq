import { ref, onBeforeUnmount } from 'vue';

export function useGalleryControls() {
  const controlsVisible = ref(false);
  const isInteracting = ref(false);
  let hideTimeout: string | number | NodeJS.Timeout | null | undefined = null;
  let debounceTimeout: string | number | NodeJS.Timeout | null | undefined = null;
  const controlsTimeout = 3000;
  const debounceDelay = 50;

  // Implementación manual de debounce
  const debounce = (fn: { (): void; apply?: any }, delay: number | undefined) => {
    return (...args: any) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  };

  const showControls = () => {
    controlsVisible.value = true;
  };

  const hideControls = () => {
    if (!isInteracting.value) {
      controlsVisible.value = false;
    }
  };

  const resetHideTimer = () => {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      isInteracting.value = false;
      hideControls();
    }, controlsTimeout);
  };

  const handleInteraction = () => {
    isInteracting.value = true;
    showControls();
    resetHideTimer();
  };

  // Versión debounceada manualmente
  const debouncedHandleInteraction = debounce(handleInteraction, debounceDelay);

  const scheduleHideControls = () => {
    if (!('ontouchstart' in window)) {
      hideTimeout = setTimeout(hideControls, controlsTimeout);
    }
  };

  const activateControls = (immediate = false) => {
    isInteracting.value = true;
    showControls();
    if (!immediate) {
      resetHideTimer();
    }
  };

  const handleMouseLeave = () => {
    if (!('ontouchstart' in window)) {
      scheduleHideControls();
    }
  };

  onBeforeUnmount(() => {
    clearTimeout(hideTimeout);
    clearTimeout(debounceTimeout);
  });

  return {
    controlsVisible,
    handleInteraction: debouncedHandleInteraction,
    handleMouseLeave,
    activateControls,
    scheduleHideControls,
  };
}
