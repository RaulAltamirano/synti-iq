import { ref, watch, onScopeDispose } from 'vue';

export function useDebounceSearch<T>(value: T, delay: number = 300) {
  const debouncedValue = ref<T>(value);
  let timeout: number | null = null;

  const stopWatch = watch(
    () => value,
    (newValue) => {
      if (timeout) {
        window.clearTimeout(timeout);
      }

      timeout = window.setTimeout(() => {
        debouncedValue.value = newValue;
      }, delay);
    },
    { immediate: true }
  );

  onScopeDispose(() => {
    stopWatch();
    if (timeout) {
      window.clearTimeout(timeout);
    }
  });

  return debouncedValue;
}
