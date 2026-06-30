import { loadGoogleMapsApi } from './googleMapsLoader';
import {
  parseGeocoderAddressComponents,
  type ParsedAddressBreakdown,
} from '@/modules/store/utils/parse-google-address-components';

export interface ReverseGeocodeResult extends ParsedAddressBreakdown {
  formattedAddress: string;
}

/**
 * Reverse geocode coordinates to a formatted address using Google Geocoding API.
 * Updates the given location object with name and fullAddress on success.
 * Requires Geocoding API to be enabled for the API key.
 */
export function useReverseGeocode() {
  async function reverseGeocode(
    lat: number,
    lng: number,
    onResult: (result: ReverseGeocodeResult) => void
  ): Promise<void> {
    try {
      const { google } = await loadGoogleMapsApi();
      const { Geocoder } = (await google.maps.importLibrary(
        'geocoding'
      )) as google.maps.GeocodingLibrary;
      const geocoder = new Geocoder();
      await new Promise<void>((resolve) => {
        geocoder.geocode(
          { location: { lat, lng } },
          (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
            if (status === 'OK' && results?.[0]) {
              const formattedAddress = results[0].formatted_address ?? '';
              const breakdown = parseGeocoderAddressComponents(results[0].address_components);
              onResult({ formattedAddress, ...breakdown });
            }
            resolve();
          }
        );
      });
    } catch {
      // Silently ignore (e.g. Geocoding API not enabled or network error)
    }
  }

  return { reverseGeocode };
}
