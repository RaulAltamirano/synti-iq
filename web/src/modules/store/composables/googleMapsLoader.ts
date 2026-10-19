import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const DEFAULT_MAPS_VERSION = 'weekly';

let optionsSet = false;

/**
 * Returns the Google Maps API key from environment.
 * Only VITE_ prefixed vars are exposed in Vite builds.
 */
export function getGoogleMapsApiKey(): string {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return typeof key === 'string' ? key.trim() : '';
}

/**
 * Returns true if an API key is configured (non-empty).
 */
export function hasGoogleMapsApiKey(): boolean {
  return getGoogleMapsApiKey().length > 0;
}

export type LoadGoogleMapsResult = {
  google: typeof google;
};

/**
 * Loads the Google Maps JavaScript API and returns the global google namespace.
 * Rejects if API key is missing or if the script fails to load.
 */
export async function loadGoogleMapsApi(): Promise<LoadGoogleMapsResult> {
  if (!hasGoogleMapsApiKey()) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not configured'));
  }
  if (!optionsSet) {
    setOptions({
      key: getGoogleMapsApiKey(),
      v: DEFAULT_MAPS_VERSION,
    });
    optionsSet = true;
  }
  await importLibrary('maps');
  const google = (globalThis as unknown as { google: typeof google }).google;
  return { google };
}
