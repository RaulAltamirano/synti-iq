import { ref, onMounted, onBeforeUnmount } from 'vue';

export function useA11y() {
  const prefersReducedMotion = ref(false);

  // Comprobar preferencia de reducción de movimiento
  const checkReducedMotion = () => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.value = mediaQuery.matches;
  };

  // Listener para cambios en la preferencia de reducción de movimiento
  const reducedMotionChangeHandler = (event) => {
    prefersReducedMotion.value = event.matches;
  };

  onMounted(() => {
    // Comprobar inicialmente
    checkReducedMotion();

    // Configurar listener para cambios
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', reducedMotionChangeHandler);
  });

  onBeforeUnmount(() => {
    // Limpiar listener
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.removeEventListener('change', reducedMotionChangeHandler);
  });

  return {
    prefersReducedMotion,
  };
}
