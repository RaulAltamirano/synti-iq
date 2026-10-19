import { describe, it, expect } from 'vitest';
import {
  parseGeocoderAddressComponents,
  parseNormalizedAddressComponents,
  parsePlacesAddressComponents,
} from '@/modules/store/utils/parse-google-address-components';

function geo(
  long_name: string,
  short_name: string,
  types: string[]
): google.maps.GeocoderAddressComponent {
  return { long_name, short_name, types } as google.maps.GeocoderAddressComponent;
}

describe('parse-google-address-components', () => {
  it('parses CDMX-style Geocoder components (street, colonia, city, state, CP, country)', () => {
    const components = [
      geo('123', '123', ['street_number']),
      geo('Av. Insurgentes Sur', 'Av. Insurgentes Sur', ['route']),
      geo('Roma Norte', 'Roma Norte', ['neighborhood', 'political']),
      geo('Cuauhtémoc', 'Cuauhtémoc', ['sublocality_level_1', 'sublocality', 'political']),
      geo('Ciudad de México', 'CDMX', ['locality', 'political']),
      geo('Ciudad de México', 'CDMX', ['administrative_area_level_1', 'political']),
      geo('06600', '06600', ['postal_code']),
      geo('Mexico', 'MX', ['country', 'political']),
    ];

    const result = parseGeocoderAddressComponents(components);

    expect(result.street).toBe('Av. Insurgentes Sur 123');
    expect(result.neighborhood).toBe('Roma Norte');
    expect(result.city).toBe('Ciudad de México');
    expect(result.state).toBe('Ciudad de México');
    expect(result.postalCode).toBe('06600');
    expect(result.country).toBe('Mexico');
  });

  it('parses US-style components without mixing administrative levels into city', () => {
    const components = [
      geo('1600', '1600', ['street_number']),
      geo('Amphitheatre Parkway', 'Amphitheatre Pkwy', ['route']),
      geo('Mountain View', 'Mountain View', ['locality', 'political']),
      geo('CA', 'CA', ['administrative_area_level_1', 'political']),
      geo('94043', '94043', ['postal_code']),
      geo('United States', 'US', ['country', 'political']),
    ];

    const result = parseGeocoderAddressComponents(components);

    expect(result.street).toBe('Amphitheatre Parkway 1600');
    expect(result.neighborhood).toBe('');
    expect(result.city).toBe('Mountain View');
    expect(result.state).toBe('CA');
    expect(result.postalCode).toBe('94043');
    expect(result.country).toBe('United States');
  });

  it('returns empty breakdown for null or empty input', () => {
    expect(parseGeocoderAddressComponents(null)).toEqual({
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    });
  });

  it('parsePlacesAddressComponents maps longText/shortText to same rules', () => {
    const result = parsePlacesAddressComponents([
      { longText: '45', shortText: '45', types: ['street_number'] },
      { longText: 'Main St', shortText: 'Main St', types: ['route'] },
      { longText: 'Brooklyn', shortText: 'Brooklyn', types: ['sublocality_level_1', 'political'] },
      { longText: 'New York', shortText: 'New York', types: ['locality', 'political'] },
      { longText: 'NY', shortText: 'NY', types: ['administrative_area_level_1', 'political'] },
      { longText: '11201', shortText: '11201', types: ['postal_code'] },
      { longText: 'United States', shortText: 'US', types: ['country', 'political'] },
    ]);

    expect(result.street).toBe('Main St 45');
    expect(result.neighborhood).toBe('Brooklyn');
    expect(result.city).toBe('New York');
    expect(result.state).toBe('NY');
  });

  it('parseNormalizedAddressComponents handles empty list', () => {
    expect(parseNormalizedAddressComponents([])).toEqual({
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    });
  });
});
