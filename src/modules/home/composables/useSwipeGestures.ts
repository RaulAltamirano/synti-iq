import { ref, Ref, onMounted, onUnmounted } from 'vue';

interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  threshold?: number;
  preventDefaultOnSwipe?: boolean;
}

interface UseSwipeGesturesReturn {
  isSwiping: Ref<boolean>;
  swipeDirection: Ref<'left' | 'right' | 'up' | 'down' | null>;
}

export function useSwipeGestures(
  containerRef: Ref<HTMLElement | null>,
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
): UseSwipeGesturesReturn {
  const { threshold = 50, preventDefaultOnSwipe = true } = options;

  const isSwiping = ref(false);
  const swipeDirection = ref<'left' | 'right' | 'up' | 'down' | null>(null);

  let startX = 0;
  let startY = 0;
  let startTime = 0;

  function handleTouchStart(e: TouchEvent): void {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
    isSwiping.value = true;
    swipeDirection.value = null;
  }

  function handleTouchMove(e: TouchEvent): void {
    if (!isSwiping.value || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      if (preventDefaultOnSwipe) {
        e.preventDefault();
      }
    }
  }

  function handleTouchEnd(e: TouchEvent): void {
    if (!isSwiping.value) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const elapsedTime = Date.now() - startTime;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > threshold && absX > absY && elapsedTime < 500) {
      if (deltaX > 0) {
        swipeDirection.value = 'right';
        callbacks.onSwipeRight?.();
      } else {
        swipeDirection.value = 'left';
        callbacks.onSwipeLeft?.();
      }
    } else if (absY > threshold && absY > absX && elapsedTime < 500) {
      if (deltaY > 0) {
        swipeDirection.value = 'down';
        callbacks.onSwipeDown?.();
      } else {
        swipeDirection.value = 'up';
        callbacks.onSwipeUp?.();
      }
    }

    isSwiping.value = false;
  }

  function handleTouchCancel(): void {
    isSwiping.value = false;
    swipeDirection.value = null;
  }

  onMounted(() => {
    const container = containerRef.value;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchCancel, { passive: true });
  });

  onUnmounted(() => {
    const container = containerRef.value;
    if (!container) return;

    container.removeEventListener('touchstart', handleTouchStart);
    container.removeEventListener('touchmove', handleTouchMove);
    container.removeEventListener('touchend', handleTouchEnd);
    container.removeEventListener('touchcancel', handleTouchCancel);
  });

  return {
    isSwiping,
    swipeDirection,
  };
}
