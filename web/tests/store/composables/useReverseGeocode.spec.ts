import { describe, it, expect, vi, beforeEach } from 'vitest';

const loadGoogleMapsApi = vi.fn();

vi.mock('@/modules/store/composables/googleMapsLoader', () => ({
  loadGoogleMapsApi,
}));

describe('useReverseGeocode', () => {
  let geocode: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    geocode = vi.fn(
      (
        _req: google.maps.GeocoderRequest,
        cb: (r: google.maps.GeocoderResult[] | null, s: google.maps.GeocoderStatus) => void
      ) => {
        cb(
          [
            {
              formatted_address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
              address_components: [
                { long_name: '1600', short_name: '1600', types: ['street_number'] },
                {
                  long_name: 'Amphitheatre Parkway',
                  short_name: 'Amphitheatre Pkwy',
                  types: ['route'],
                },
                {
                  long_name: 'Mountain View',
                  short_name: 'Mountain View',
                  types: ['locality', 'political'],
                },
                {
                  long_name: 'CA',
                  short_name: 'CA',
                  types: ['administrative_area_level_1', 'political'],
                },
                { long_name: '94043', short_name: '94043', types: ['postal_code'] },
                { long_name: 'United States', short_name: 'US', types: ['country', 'political'] },
              ],
            } as google.maps.GeocoderResult,
          ],
          'OK' as google.maps.GeocoderStatus
        );
      }
    );

    const Geocoder = vi.fn(function MockGeocoder(this: { geocode: typeof geocode }) {
      this.geocode = geocode;
    });

    loadGoogleMapsApi.mockResolvedValue({
      google: {
        maps: {
          importLibrary: vi.fn(async (lib: string) => {
            if (lib === 'geocoding') return { Geocoder };
            return {};
          }),
        },
      },
    });
  });

  async function loadComposable() {
    const { useReverseGeocode } = await import('@/modules/store/composables/useReverseGeocode');
    return useReverseGeocode();
  }

  it('invokes callback with formatted address and parsed breakdown on OK', async () => {
    const { reverseGeocode } = await loadComposable();
    const onResult = vi.fn();
    await reverseGeocode(37.42, -122.08, onResult);

    expect(geocode).toHaveBeenCalled();
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith({
      formattedAddress: '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
      street: 'Amphitheatre Parkway 1600',
      neighborhood: '',
      city: 'Mountain View',
      state: 'CA',
      postalCode: '94043',
      country: 'United States',
    });
  });

  it('does not invoke callback when geocoder returns non-OK status', async () => {
    vi.resetModules();
    geocode = vi.fn(
      (
        _req: google.maps.GeocoderRequest,
        cb: (r: google.maps.GeocoderResult[] | null, s: google.maps.GeocoderStatus) => void
      ) => {
        cb([], 'ZERO_RESULTS' as google.maps.GeocoderStatus);
      }
    );
    const GeocoderFail = vi.fn(function MockGeocoderFail(this: { geocode: typeof geocode }) {
      this.geocode = geocode;
    });

    loadGoogleMapsApi.mockResolvedValue({
      google: {
        maps: {
          importLibrary: vi.fn(async (lib: string) => {
            if (lib === 'geocoding') return { Geocoder: GeocoderFail };
            return {};
          }),
        },
      },
    });

    const { useReverseGeocode } = await import('@/modules/store/composables/useReverseGeocode');
    const { reverseGeocode } = useReverseGeocode();
    const onResult = vi.fn();
    await reverseGeocode(0, 0, onResult);
    expect(onResult).not.toHaveBeenCalled();
  });
});
