import { ref, watch, nextTick, onUnmounted, type Ref } from 'vue';
import { loadGoogleMapsApi, hasGoogleMapsApiKey } from './googleMapsLoader';

export const LOCATION_PICKER_DEFAULT_CENTER = { lat: 19.4326, lng: -99.1332 };

function isValidCoord(value: number): boolean {
  return typeof value === 'number' && !Number.isNaN(value) && value !== 0;
}

function hasValidCoordinates(lat: number, lng: number): boolean {
  return isValidCoord(lat) && isValidCoord(lng);
}

/** Google Maps JS colorScheme values (see `google.maps.ColorScheme`). */
const MAP_COLOR_LIGHT = 'LIGHT' as const;
const MAP_COLOR_DARK = 'DARK' as const;

export interface UseLocationPickerMapOptions {
  mapContainerRef: { value: HTMLElement | null };
  /** When false, map is torn down; when true, map initializes when container has size. */
  isActive: { value: boolean };
  /** Read-only snapshot used to pick the map's initial center. Updates go through `onMarkerPositionChange`. */
  coordinates: { readonly latitude: number; readonly longitude: number };
  onMarkerPositionChange?: (lat: number, lng: number) => void;
  /** When set, map tiles match app light/dark theme and update when it changes. */
  isDark?: Ref<boolean>;
}

export interface CenterAndMoveMarkerOptions {
  /** When false, `onMarkerPositionChange` is not invoked (e.g. caller already has the address). */
  notify?: boolean;
}

export interface UseLocationPickerMapReturn {
  isMapReady: { value: boolean };
  mapLoadError: { value: string | null };
  centerAndMoveMarker: (lat: number, lng: number, opts?: CenterAndMoveMarkerOptions) => void;
}

export function useLocationPickerMap(
  options: UseLocationPickerMapOptions
): UseLocationPickerMapReturn {
  const { mapContainerRef, isActive, coordinates, onMarkerPositionChange, isDark } = options;

  const isMapReady = ref(false);
  const mapLoadError = ref<string | null>(null);

  let mapInstance: google.maps.Map | null = null;
  let markerInstance: google.maps.marker.AdvancedMarkerElement | null = null;
  let dragendListener: google.maps.MapsEventListener | null = null;

  function getInitialPosition(): { lat: number; lng: number } {
    const lat = coordinates.latitude;
    const lng = coordinates.longitude;
    if (hasValidCoordinates(lat, lng)) {
      return { lat, lng };
    }
    return { ...LOCATION_PICKER_DEFAULT_CENTER };
  }

  function centerAndMoveMarker(lat: number, lng: number, opts?: CenterAndMoveMarkerOptions) {
    if (!mapInstance || !markerInstance) return;
    const position = { lat, lng };
    mapInstance.setCenter(position);
    mapInstance.setZoom(15);
    markerInstance.position = position;
    if (opts?.notify !== false) {
      onMarkerPositionChange?.(lat, lng);
    }
  }

  function cleanup() {
    if (dragendListener) {
      dragendListener.remove();
      dragendListener = null;
    }
    if (markerInstance) {
      markerInstance.map = null;
      markerInstance = null;
    }
    mapInstance = null;
    isMapReady.value = false;
    const container = mapContainerRef.value;
    if (container) {
      container.innerHTML = '';
    }
  }

  async function initMap() {
    const container = mapContainerRef.value;
    if (!container || !isActive.value) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;
    if (width === 0 || height === 0) return;

    if (!hasGoogleMapsApiKey()) {
      mapLoadError.value = 'Configure VITE_GOOGLE_MAPS_API_KEY in your .env file';
      return;
    }

    mapLoadError.value = null;

    try {
      const { google: g } = await loadGoogleMapsApi();
      const position = getInitialPosition();

      const { AdvancedMarkerElement } = (await g.maps.importLibrary(
        'marker'
      )) as google.maps.MarkerLibrary;

      const colorScheme = isDark?.value ? MAP_COLOR_DARK : MAP_COLOR_LIGHT;

      mapInstance = new g.maps.Map(container, {
        center: position,
        zoom: 15,
        mapId: 'DEMO_MAP_ID',
        colorScheme,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      markerInstance = new AdvancedMarkerElement({
        position,
        map: mapInstance,
        gmpDraggable: true,
      });

      dragendListener = markerInstance.addListener('dragend', () => {
        const pos = markerInstance?.position;
        if (pos) {
          const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
          const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;
          onMarkerPositionChange?.(lat, lng);
        }
      });

      isMapReady.value = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load map';
      mapLoadError.value = message;
    }
  }

  watch(
    isActive,
    () => {
      if (!isActive.value) {
        cleanup();
        return;
      }
      void nextTick(() => initMap());
    },
    { immediate: true }
  );

  if (isDark) {
    watch(isDark, (dark) => {
      if (!mapInstance) return;
      mapInstance.setOptions({ colorScheme: dark ? MAP_COLOR_DARK : MAP_COLOR_LIGHT });
    });
  }

  onUnmounted(cleanup);

  return {
    isMapReady,
    mapLoadError,
    centerAndMoveMarker,
  };
}
