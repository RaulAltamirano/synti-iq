import { nextTick } from 'vue';

export const useInfiniteScroll = (options: {
  containerRef: any;
  triggerRef: any;
  onIntersect: any;
  threshold?: 0.1 | undefined;
  rootMargin?: '0px 0px 100px 0px' | undefined;
  enabled?: true | undefined;
}) => {
  const {
    containerRef,
    triggerRef,
    onIntersect,
    threshold = 0.1,
    rootMargin = '0px 0px 100px 0px',
    enabled = true,
  } = options;

  let observer: IntersectionObserver | null = null;
  let scrollListener: (() => void) | null = null;
  let lastScrollTime = 0;
  const THROTTLE_MS = 100;

  const setupObserver = () => {
    cleanupObserver();

    if (!enabled.value || !containerRef.value || !triggerRef.value) {
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      {
        root: containerRef.value,
        rootMargin,
        threshold,
      }
    );

    observer.observe(triggerRef.value);
  };

  const setupScrollListener = () => {
    if (!enabled.value || !containerRef.value || !triggerRef.value) {
      return;
    }

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime < THROTTLE_MS) return;
      lastScrollTime = now;

      if (!containerRef.value || !triggerRef.value) {
        return;
      }

      const container = containerRef.value;
      const trigger = triggerRef.value;
      const containerRect = container.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();

      if (triggerRect.top - containerRect.bottom < 150) {
        onIntersect();
      }
    };

    containerRef.value.addEventListener('scroll', handleScroll, { passive: true });
    scrollListener = handleScroll;

    return () => {
      if (containerRef.value) {
        containerRef.value.removeEventListener('scroll', handleScroll);
      }
    };
  };

  const cleanupObserver = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  const cleanupScrollListener = () => {
    if (scrollListener && containerRef.value) {
      containerRef.value.removeEventListener('scroll', scrollListener);
      scrollListener = null;
    }
  };

  const initialize = () => {
    nextTick(() => {
      setupObserver();
      setupScrollListener();
    });
  };

  const cleanup = () => {
    cleanupObserver();
    cleanupScrollListener();
  };

  return {
    initialize,
    cleanup,
    refresh: initialize,
  };
};
