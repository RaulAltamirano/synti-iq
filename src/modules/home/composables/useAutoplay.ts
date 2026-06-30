// /composables/useAutoplay.js
import { ref, watch } from 'vue';

/**
 * Composable para manejar la reproducción automática
 * @param {Function} callback - Función a ejecutar en cada intervalo
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Estado y métodos para controlar el autoplay
 */
export function useAutoplay(callback, options = {}) {
  const {
    defaultInterval = 5000,
    defaultAutoplay = true,
    storageKey = 'galleryIntervalTime',
  } = options;

  // Estado
  const autoplay = ref(defaultAutoplay);
  const intervalTime = ref(defaultInterval);
  const intervalId = ref(null);

  // Cargar configuración desde localStorage al inicio
  function loadSavedInterval() {
    const savedInterval = localStorage.getItem(storageKey);
    if (savedInterval) {
      intervalTime.value = parseInt(savedInterval);
    }
  }

  // Guardar configuración en localStorage
  watch(intervalTime, (newValue) => {
    localStorage.setItem(storageKey, newValue);
  });

  /**
   * Iniciar reproducción automática
   */
  function startAutoplay() {
    stopAutoplay(); // Limpiar intervalo anterior si existe
    intervalId.value = setInterval(callback, intervalTime.value);
  }

  /**
   * Detener reproducción automática
   */
  function stopAutoplay() {
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
  }

  /**
   * Alternar entre reproducción y pausa
   */
  function toggleAutoplay() {
    autoplay.value = !autoplay.value;
    if (autoplay.value) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
  }

  /**
   * Reiniciar el temporizador de autoplay
   */
  function resetAutoplayTimer() {
    if (autoplay.value) {
      stopAutoplay();
      startAutoplay();
    }
  }

  /**
   * Actualizar el intervalo de tiempo
   * @param {number|string} value - Nuevo valor de intervalo
   */
  function updateInterval(value) {
    intervalTime.value = typeof value === 'string' ? parseInt(value) : value;
    resetAutoplayTimer();
  }

  /**
   * Pausar autoplay (para cuando la ventana pierde el foco)
   */
  function pauseAutoplay() {
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
  }

  /**
   * Reanudar autoplay si estaba activado
   */
  function resumeAutoplayIfEnabled() {
    if (autoplay.value && !intervalId.value) {
      startAutoplay();
    }
  }

  // Cargar configuración guardada al inicio
  loadSavedInterval();

  return {
    // Estado
    autoplay,
    intervalTime,

    // Métodos
    toggleAutoplay,
    startAutoplay,
    stopAutoplay,
    resetAutoplayTimer,
    updateInterval,
    pauseAutoplay,
    resumeAutoplayIfEnabled,
  };
}
