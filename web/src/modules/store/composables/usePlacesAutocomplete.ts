import { loadGoogleMapsApi } from './googleMapsLoader';
import {
  parsePlacesAddressComponents,
  type ParsedAddressBreakdown,
} from '@/modules/store/utils/parse-google-address-components';

export interface PlaceSuggestion {
  label: string;
  value: string;
}

export interface PlaceDetails extends ParsedAddressBreakdown {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

let placesLibrary: google.maps.PlacesLibrary | null = null;
/** Session token for Autocomplete billing; cleared after a successful place details fetch. */
let autocompleteSessionToken: google.maps.places.AutocompleteSessionToken | null = null;

async function ensurePlacesLoaded(): Promise<google.maps.PlacesLibrary> {
  if (placesLibrary) return placesLibrary;
  const { google } = await loadGoogleMapsApi();
  placesLibrary = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;
  return placesLibrary;
}

function readLatLng(
  location: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined
): { lat: number; lng: number } | null {
  if (!location) return null;
  const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
  const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    Number.isNaN(lat) ||
    Number.isNaN(lng)
  ) {
    return null;
  }
  return { lat, lng };
}

/**
 * Google Places Autocomplete (New): AutocompleteSuggestion + Place.fetchFields.
 * @see https://developers.google.com/maps/documentation/javascript/legacy/places-migration-autocomplete
 */
export function usePlacesAutocomplete() {
  async function getSuggestions(query: string): Promise<PlaceSuggestion[]> {
    if (!query?.trim()) return [];
    try {
      const { AutocompleteSuggestion, AutocompleteSessionToken } = await ensurePlacesLoaded();
      if (!autocompleteSessionToken) {
        autocompleteSessionToken = new AutocompleteSessionToken();
      }
      const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query.trim(),
        sessionToken: autocompleteSessionToken,
      });
      const out: PlaceSuggestion[] = [];
      for (const s of suggestions) {
        const pred = s.placePrediction;
        if (!pred?.placeId || !pred.text?.text) continue;
        out.push({ label: pred.text.text, value: pred.placeId });
      }
      return out;
    } catch {
      return [];
    }
  }

  async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!placeId?.trim()) return null;
    try {
      const { Place } = await ensurePlacesLoaded();
      const place = new Place({ id: placeId.trim() });
      const { place: fetched } = await place.fetchFields({
        fields: ['formattedAddress', 'location', 'addressComponents'],
      });
      const formattedAddress = fetched.formattedAddress?.trim() ?? '';
      const coords = readLatLng(fetched.location ?? null);
      if (!coords || !formattedAddress) {
        return null;
      }
      const breakdown = parsePlacesAddressComponents(fetched.addressComponents ?? null);
      autocompleteSessionToken = null;
      return {
        latitude: coords.lat,
        longitude: coords.lng,
        formattedAddress,
        ...breakdown,
      };
    } catch {
      return null;
    }
  }

  return { getSuggestions, getPlaceDetails };
}
