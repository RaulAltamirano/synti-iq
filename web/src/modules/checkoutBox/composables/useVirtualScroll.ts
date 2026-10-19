import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

interface VirtualScrollOptions {
  itemHeight: number;
  buffer: number;
  debounceDelay?: number;
}

export function useVirtualScroll<T>(items: T[], options: VirtualScrollOptions) {
  const containerRef = ref<HTMLElement | null>(null);
  const scrollTop = ref(0);
  const containerHeight = ref(0);

  const finalOptions = {
    itemHeight: options.itemHeight || 100,
    buffer: options.buffer || 5,
    debounceDelay: options.debounceDelay || 16,
  };

  let scrollTimeout: number | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const visibleRange = computed(() => {
    if (!containerHeight.value) return { start: 0, end: 20 };

    const { itemHeight, buffer } = finalOptions;

    const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - buffer);

    const visibleCount = Math.ceil(containerHeight.value / itemHeight) + buffer * 2;
    const end = Math.min(items.length, start + visibleCount);

    return { start, end };
  });

  const visibleItems = computed(() => {
    const { start, end } = visibleRange.value;
    return items.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
    }));
  });

  const totalHeight = computed(() => items.length * finalOptions.itemHeight);

  const offsetY = computed(() => visibleRange.value.start * finalOptions.itemHeight);

  const handleScroll = () => {
    if (scrollTimeout) {
      window.clearTimeout(scrollTimeout);
    }

    scrollTimeout = window.setTimeout(() => {
      if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop;
      }
    }, finalOptions.debounceDelay);
  };

  onMounted(() => {
    if (containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight;
      containerRef.value.addEventListener('scroll', handleScroll);

      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          containerHeight.value = entry.contentRect.height;
        }
      });

      resizeObserver.observe(containerRef.value);
    }
  });

  onUnmounted(() => {
    if (scrollTimeout) {
      window.clearTimeout(scrollTimeout);
    }
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll);
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  watch(
    () => items.length,
    () => {
      if (containerRef.value) {
        containerRef.value.scrollTop = 0;
        scrollTop.value = 0;
      }
    }
  );

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    itemHeight: finalOptions.itemHeight,
  };
}
