import { describe, it, expect, vi, beforeEach } from 'vitest';

const loadGoogleMapsApi = vi.fn();
const hasGoogleMapsApiKey = vi.fn(() => true);

vi.mock('@/modules/store/composables/googleMapsLoader', () => ({
  loadGoogleMapsApi,
  hasGoogleMapsApiKey,
}));

describe('usePlacesAutocomplete', () => {
  let fetchAutocompleteSuggestions: ReturnType<typeof vi.fn>;
  let fetchFields: ReturnType<typeof vi.fn>;
  let Place: new (options: { id: string }) => {
    id: string;
    fetchFields: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.resetModules();
    fetchAutocompleteSuggestions = vi.fn().mockResolvedValue({
      suggestions: [
        {
          placePrediction: {
            placeId: 'ChIJtest',
            text: { text: 'Calle Falsa 123' },
          },
        },
      ],
    });
    fetchFields = vi.fn().mockResolvedValue({
      place: {
        formattedAddress: 'Calle Falsa 123, CDMX',
        location: {
          lat: () => 19.43,
          lng: () => -99.13,
        },
        addressComponents: [
          { longText: '123', shortText: '123', types: ['street_number'] },
          { longText: 'Calle Falsa', shortText: 'Calle Falsa', types: ['route'] },
          { longText: 'Centro', shortText: 'Centro', types: ['neighborhood', 'political'] },
          { longText: 'Ciudad de México', shortText: 'CDMX', types: ['locality', 'political'] },
          { longText: 'CDMX', shortText: 'CDMX', types: ['administrative_area_level_1', 'political'] },
          { longText: '01234', shortText: '01234', types: ['postal_code'] },
          { longText: 'Mexico', shortText: 'MX', types: ['country', 'political'] },
        ],
      },
    });
    class AutocompleteSessionToken {}
    class AutocompleteSuggestion {
      static fetchAutocompleteSuggestions = fetchAutocompleteSuggestions;
    }
    Place = class MockPlace {
      id: string;
      fetchFields = fetchFields;
      constructor(options: { id: string }) {
        this.id = options.id;
      }
    } as unknown as typeof Place;

    const importLibrary = vi.fn(async (lib: string) => {
      if (lib === 'places') {
        return {
          AutocompleteSessionToken,
          AutocompleteSuggestion,
          Place,
        };
      }
      return {};
    });

    loadGoogleMapsApi.mockResolvedValue({
      google: {
        maps: { importLibrary },
      },
    });
  });

  async function loadComposable() {
    const { usePlacesAutocomplete } =
      await import('@/modules/store/composables/usePlacesAutocomplete');
    return usePlacesAutocomplete();
  }

  it('returns empty array for blank query without calling fetch', async () => {
    const { getSuggestions } = await loadComposable();
    const result = await getSuggestions('   ');
    expect(result).toEqual([]);
    expect(fetchAutocompleteSuggestions).not.toHaveBeenCalled();
  });

  it('maps suggestions and passes sessionToken to fetchAutocompleteSuggestions', async () => {
    const { getSuggestions } = await loadComposable();
    const result = await getSuggestions('cal');
    expect(result).toEqual([{ label: 'Calle Falsa 123', value: 'ChIJtest' }]);
    expect(fetchAutocompleteSuggestions).toHaveBeenCalledTimes(1);
    const req = fetchAutocompleteSuggestions.mock.calls[0][0] as {
      input: string;
      sessionToken: object;
    };
    expect(req.input).toBe('cal');
    expect(req.sessionToken).toBeDefined();
  });

  it('returns place details and uses a new session token after successful getPlaceDetails', async () => {
    const { getSuggestions, getPlaceDetails } = await loadComposable();
    await getSuggestions('cal');
    const tokenAfterFirst = (
      fetchAutocompleteSuggestions.mock.calls[0][0] as { sessionToken: object }
    ).sessionToken;

    const details = await getPlaceDetails('ChIJtest');
    expect(details).toEqual({
      latitude: 19.43,
      longitude: -99.13,
      formattedAddress: 'Calle Falsa 123, CDMX',
      street: 'Calle Falsa 123',
      neighborhood: 'Centro',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '01234',
      country: 'Mexico',
    });
    expect(fetchFields).toHaveBeenCalledWith({
      fields: ['formattedAddress', 'location', 'addressComponents'],
    });

    await getSuggestions('otra');
    const tokenAfterSecond = (
      fetchAutocompleteSuggestions.mock.calls[1][0] as { sessionToken: object }
    ).sessionToken;
    expect(tokenAfterSecond).not.toBe(tokenAfterFirst);
  });
});
