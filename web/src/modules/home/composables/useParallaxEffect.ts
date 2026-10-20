import { ref, type Ref } from 'vue';
import { useAnimationFrame } from './useAnimationFrame';

interface ParallaxOptions {
  maxMovement?: number;
  scale?: number;
  springStrength?: number;
  friction?: number;
  restThreshold?: number;
}

interface UseParallaxEffectReturn {
  parallaxX: Ref<number>;
  parallaxY: Ref<number>;
  imageScale: Ref<number>;
  isReducedMotion: Ref<boolean>;
  isTouchDevice: Ref<boolean>;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseLeave: () => void;
  startParallaxAnimation: () => void;
  stopParallaxAnimation: () => void;
}

function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function useParallaxEffect(
  containerRef: Ref<HTMLElement | null>,
  options: ParallaxOptions = {}
): UseParallaxEffectReturn {
  const {
    maxMovement = 12,
    scale = 1.1,
    springStrength = 0.08,
    friction = 0.8,
    restThreshold = 0.01,
  } = options;

  const parallaxX = ref(0);
  const parallaxY = ref(0);
  const targetParallaxX = ref(0);
  const targetParallaxY = ref(0);
  const imageScale = ref(scale);
  const isHovering = ref(false);
  const isReducedMotion = ref(false);
  const isTouchDevice = ref(detectTouchDevice());

  // Variables para la simulación física
  let velocityX = 0;
  let velocityY = 0;

  // Crear instancia de animationFrame controller
  const { startAnimation, stopAnimation, isAnimating } = useAnimationFrame(animate);

  /**
   * Detectar preferencia de movimiento reducido
   */
  function checkReducedMotion(): void {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      isReducedMotion.value = mediaQuery.matches;

      // Escuchar cambios en la preferencia
      mediaQuery.addEventListener('change', (e) => {
        isReducedMotion.value = e.matches;
        if (e.matches) {
          // Resetear a posición inicial si se activa movimiento reducido
          parallaxX.value = 0;
          parallaxY.value = 0;
          velocityX = 0;
          velocityY = 0;
        }
      });
    }
  }

  /**
   * Verificar si el parallax está en reposo (cerca del centro)
   */
  function checkIfAtRest(): boolean {
    const isVelocityNearZero =
      Math.abs(velocityX) < restThreshold && Math.abs(velocityY) < restThreshold;
    const isPositionNearZero =
      Math.abs(parallaxX.value) < restThreshold && Math.abs(parallaxY.value) < restThreshold;
    return !isHovering.value && isVelocityNearZero && isPositionNearZero;
  }

  function handleMouseMove(e: MouseEvent): void {
    if (isReducedMotion.value || isTouchDevice.value) return;
    if (!containerRef.value) return;

    const rect = containerRef.value.getBoundingClientRect();

    // Solo actualizar si el ratón está realmente dentro del contenedor.
    // Evita saltos del parallax cuando el menú del avatar (u otros overlays) se cierra
    // y el siguiente mousemove llega con coordenadas fuera del hero (ej. sobre la navbar).
    const isInside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!isInside) {
      handleMouseLeave();
      return;
    }

    isHovering.value = true;

    // Asegurar que la animación esté corriendo
    if (!isAnimating()) {
      startAnimation();
    }

    // Normalizar posición del ratón entre -1 y 1 (clamp para evitar valores fuera de rango)
    let relativeX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    let relativeY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    relativeX = Math.max(-1, Math.min(1, relativeX));
    relativeY = Math.max(-1, Math.min(1, relativeY));

    // Aplicar curva de ease-out para movimiento más natural
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
    const easedX = easeOutCubic(Math.abs(relativeX)) * Math.sign(relativeX);
    const easedY = easeOutCubic(Math.abs(relativeY)) * Math.sign(relativeY);

    // Establecer objetivos con límites de movimiento
    targetParallaxX.value = -easedX * maxMovement;
    targetParallaxY.value = -easedY * maxMovement;
  }

  /**
   * Manejador para cuando el mouse sale del elemento
   */
  function handleMouseLeave(): void {
    isHovering.value = false;
    targetParallaxX.value = 0;
    targetParallaxY.value = 0;
  }

  function animate(): void {
    if (isReducedMotion.value || isTouchDevice.value) return;

    // Parámetros para la simulación física
    const spring = springStrength;
    const dampingFactor = friction;

    if (isHovering.value) {
      // Calcular fuerza del resorte hacia el objetivo
      const deltaX = targetParallaxX.value - parallaxX.value;
      const deltaY = targetParallaxY.value - parallaxY.value;

      // Aplicar velocidad con amortiguación
      velocityX = velocityX * dampingFactor + deltaX * spring;
      velocityY = velocityY * dampingFactor + deltaY * spring;
    } else {
      // Volver a posición central con movimiento suave
      const deltaX = 0 - parallaxX.value;
      const deltaY = 0 - parallaxY.value;

      // Menor velocidad de retorno para efecto más suave
      velocityX = velocityX * dampingFactor + deltaX * spring * 0.5;
      velocityY = velocityY * dampingFactor + deltaY * spring * 0.5;
    }

    // Aplicar velocidad a la posición
    parallaxX.value += velocityX;
    parallaxY.value += velocityY;

    // Optimización: pausar animación cuando está en reposo
    if (checkIfAtRest()) {
      // Resetear a valores exactos para evitar drift
      parallaxX.value = 0;
      parallaxY.value = 0;
      velocityX = 0;
      velocityY = 0;
      stopAnimation();
    }
  }

  function startParallaxAnimation(): void {
    checkReducedMotion();
    isTouchDevice.value = detectTouchDevice();
    if (!isReducedMotion.value && !isTouchDevice.value) {
      startAnimation();
    }
  }

  function stopParallaxAnimation(): void {
    stopAnimation();
  }

  return {
    parallaxX,
    parallaxY,
    imageScale,
    isReducedMotion,
    isTouchDevice,
    handleMouseMove,
    handleMouseLeave,
    startParallaxAnimation,
    stopParallaxAnimation,
  };
}
