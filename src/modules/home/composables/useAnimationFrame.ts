// /utils/animationUtils.js

/**
 * Composable para manejar animaciones con requestAnimationFrame
 * @param {Function} callback - Función que se ejecutará en cada frame de animación
 * @param {Object} options - Opciones adicionales
 * @returns {Object} - Métodos para controlar la animación
 */
export function useAnimationFrame(callback: (arg0: any) => void, options = {}) {
  const {
    autoStart = false,
    fps = null, // Si se especifica, limita los frames por segundo
  } = options;

  let animationFrameId: number | null = null;
  let lastFrameTime = 0;
  let isRunning = false;

  // Si se especifica FPS, calculamos el intervalo mínimo entre frames
  const frameInterval = fps ? 1000 / fps : 0;

  /**
   * Función que ejecuta la animación
   * @param {number} timestamp - Marca de tiempo proporcionada por requestAnimationFrame
   */
  function animate(timestamp: number) {
    // Si es la primera ejecución o no hay limitación de FPS
    if (!lastFrameTime || !frameInterval || timestamp - lastFrameTime >= frameInterval) {
      lastFrameTime = timestamp;
      callback(timestamp);
    }

    // Continuar el ciclo de animación si sigue activo
    if (isRunning) {
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  /**
   * Inicia la animación
   */
  function startAnimation() {
    if (!isRunning) {
      isRunning = true;
      lastFrameTime = 0;
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  /**
   * Detiene la animación
   */
  function stopAnimation() {
    isRunning = false;

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  /**
   * Reinicia la animación (útil si necesitas resetear el estado)
   */
  function restartAnimation() {
    stopAnimation();
    startAnimation();
  }

  // Iniciar automáticamente si se especifica
  if (autoStart) {
    startAnimation();
  }

  return {
    startAnimation,
    stopAnimation,
    restartAnimation,
    isAnimating: () => isRunning,
  };
}
