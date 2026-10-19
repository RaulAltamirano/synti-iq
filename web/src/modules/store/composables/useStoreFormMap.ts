import { computed, type Ref } from 'vue';
import { useTheme } from '@/modules/shared/composables/useTheme';
import { useLocationPickerMap, type UseLocationPickerMapReturn } from './useLocationPickerMap';

const LOCATION_STEP = 2;

export interface UseStoreFormMapOptions {
  mapContainerRef: { value: HTMLElement | null };
  currentStep: { value: number };
  coordinates: { latitude: number; longitude: number };
  onMarkerPositionChange?: (lat: number, lng: number) => void;
}

export type UseStoreFormMapReturn = UseLocationPickerMapReturn;

export function useStoreFormMap(options: UseStoreFormMapOptions): UseStoreFormMapReturn {
  const { mapContainerRef, currentStep, coordinates, onMarkerPositionChange } = options;
  const { isDark } = useTheme();

  const isActive = computed(() => currentStep.value === LOCATION_STEP) as Ref<boolean>;

  return useLocationPickerMap({
    mapContainerRef,
    isActive,
    coordinates,
    onMarkerPositionChange,
    isDark,
  });
}
