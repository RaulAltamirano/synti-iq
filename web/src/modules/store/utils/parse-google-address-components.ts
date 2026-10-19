/**
 * Maps Google Geocoder / Places address component arrays to flat fields used in CreateLocationForm.
 */

export interface NormalizedAddressComponent {
  longName: string;
  shortName: string;
  types: string[];
}

export interface ParsedAddressBreakdown {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const EMPTY_BREAKDOWN: ParsedAddressBreakdown = {
  street: '',
  neighborhood: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

function hasType(types: string[], t: string): boolean {
  return types.includes(t);
}

function pickFirstLongName(
  components: NormalizedAddressComponent[],
  typePredicates: string[]
): string {
  for (const type of typePredicates) {
    const c = components.find((x) => hasType(x.types, type));
    if (c?.longName) return c.longName.trim();
  }
  return '';
}

/**
 * Geocoder `address_components` items use long_name / short_name / types.
 */
export function normalizeGeocoderComponent(
  raw: google.maps.GeocoderAddressComponent
): NormalizedAddressComponent {
  return {
    longName: raw.long_name?.trim() ?? '',
    shortName: raw.short_name?.trim() ?? '',
    types: raw.types ?? [],
  };
}

/**
 * Places API (New) AddressComponent uses longText / shortText / types.
 */
export function normalizePlacesComponent(raw: {
  longText?: string | null;
  shortText?: string | null;
  types?: string[] | null;
}): NormalizedAddressComponent {
  return {
    longName: raw.longText?.trim() ?? '',
    shortName: raw.shortText?.trim() ?? '',
    types: raw.types ?? [],
  };
}

function buildStreetLine(components: NormalizedAddressComponent[]): string {
  const number = pickFirstLongName(components, ['street_number']);
  const route = pickFirstLongName(components, ['route']);
  const subpremise = pickFirstLongName(components, ['subpremise', 'floor', 'room']);
  const line = [route, number].filter(Boolean).join(' ').trim();
  if (!line) return '';
  if (subpremise) return `${line}, ${subpremise}`;
  return line;
}

/**
 * Pure parse from a normalized component list (works for both Geocoder and Places after normalization).
 */
export function parseNormalizedAddressComponents(
  components: NormalizedAddressComponent[]
): ParsedAddressBreakdown {
  if (!components.length) return { ...EMPTY_BREAKDOWN };

  const street = buildStreetLine(components);
  let neighborhood = pickFirstLongName(components, [
    'neighborhood',
    'sublocality_level_1',
    'sublocality',
  ]);
  if (!neighborhood) {
    neighborhood = pickFirstLongName(components, ['sublocality_level_2']);
  }

  let city = pickFirstLongName(components, ['locality']);
  if (!city) {
    city = pickFirstLongName(components, ['administrative_area_level_2']);
  }

  const state = pickFirstLongName(components, ['administrative_area_level_1']);
  const postalCode = pickFirstLongName(components, ['postal_code']);
  const country = pickFirstLongName(components, ['country']);

  return {
    street,
    neighborhood,
    city,
    state,
    postalCode,
    country,
  };
}

export function parseGeocoderAddressComponents(
  components: google.maps.GeocoderAddressComponent[] | null | undefined
): ParsedAddressBreakdown {
  if (!components?.length) return { ...EMPTY_BREAKDOWN };
  return parseNormalizedAddressComponents(components.map(normalizeGeocoderComponent));
}

export function parsePlacesAddressComponents(
  components:
    | Array<{ longText?: string | null; shortText?: string | null; types?: string[] | null }>
    | null
    | undefined
): ParsedAddressBreakdown {
  if (!components?.length) return { ...EMPTY_BREAKDOWN };
  return parseNormalizedAddressComponents(components.map(normalizePlacesComponent));
}
