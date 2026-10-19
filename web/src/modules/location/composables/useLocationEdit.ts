import { reactive, ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from '@/modules/shared/composables/useTheme';
import { useToast } from '@/modules/ui/composables/useToast';
import { getStoreById } from '@/modules/store/services/storeApi';
import { useLocationPickerMap } from '@/modules/store/composables/useLocationPickerMap';
import { usePlacesAutocomplete } from '@/modules/store/composables/usePlacesAutocomplete';
import type { PlaceDetails } from '@/modules/store/composables/usePlacesAutocomplete';
import { useReverseGeocode } from '@/modules/store/composables/useReverseGeocode';
import {
  useStoreFormGeolocation,
  GeolocationError,
} from '@/modules/store/composables/useStoreFormGeolocation';
import type { CreateLocationForm } from '@/modules/store/types/store-form.types';
import type { StoreLocationApi } from '@/modules/store/types/store-api.types';

const SAFE_RETURN_PREFIXES = [
  '/store',
  '/location',
  '/profile',
  '/users',
  '/checkout',
  '/home',
] as const;

function isSafeReturnPath(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  const pathname = path.split('?')[0];
  return SAFE_RETURN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const ZERO_COORDS = { latitude: 0, longitude: 0 } as const;

function emptyLocationForm(): CreateLocationForm {
  return {
    name: '',
    fullAddress: '',
    addressReference: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    coordinates: { ...ZERO_COORDS },
  };
}

function locationApiToForm(loc: StoreLocationApi | null | undefined): CreateLocationForm {
  if (!loc) return emptyLocationForm();
  return {
    name: loc.name ?? '',
    fullAddress: loc.fullAddress ?? '',
    addressReference: loc.addressReference ?? '',
    street: loc.street ?? '',
    neighborhood: loc.neighborhood ?? '',
    city: loc.city ?? '',
    state: loc.state ?? '',
    postalCode: loc.postalCode ?? '',
    country: loc.country ?? '',
    coordinates: { ...ZERO_COORDS },
  };
}

function queryParamSingle(q: unknown): string {
  if (typeof q === 'string') return q;
  if (Array.isArray(q) && typeof q[0] === 'string') return q[0];
  return '';
}

function applyParsedAddressToForm(
  target: CreateLocationForm,
  parsed: Pick<
    PlaceDetails,
    'formattedAddress' | 'street' | 'neighborhood' | 'city' | 'state' | 'postalCode' | 'country'
  >
): void {
  target.fullAddress = parsed.formattedAddress;
  target.street = parsed.street;
  target.neighborhood = parsed.neighborhood;
  target.city = parsed.city;
  target.state = parsed.state;
  target.postalCode = parsed.postalCode;
  target.country = parsed.country;
}

export function useLocationEdit() {
  const route = useRoute();
  const router = useRouter();
  const { isDark } = useTheme();
  const toast = useToast();

  const locationId = computed(() => route.params.locationId as string);
  const storeIdFromQuery = computed(() => queryParamSingle(route.query.storeId));

  const storeName = ref('');
  const loading = ref(true);
  const loadError = ref<string | null>(null);
  const isSubmitting = ref(false);

  const form = reactive<CreateLocationForm>(emptyLocationForm());
  const errors = reactive<Partial<Record<keyof CreateLocationForm, string>>>({});

  const mapContainerRef = ref<HTMLElement | null>(null);
  const addressSearchQuery = ref('');
  const addressPlaceError = ref('');
  const geolocationError = ref('');
  const geolocationErrorCode = ref<GeolocationError['code'] | null>(null);
  const isGeolocating = ref(false);
  const isReverseGeocoding = ref(false);
  const geolocationSupported = ref(true);

  const { getSuggestions, getPlaceDetails } = usePlacesAutocomplete();
  const { reverseGeocode } = useReverseGeocode();
  const { getCurrentLocation } = useStoreFormGeolocation();

  const isMapActive = computed(() => !loading.value && loadError.value === null);

  async function handleMarkerPositionChange(lat: number, lng: number): Promise<void> {
    form.coordinates!.latitude = lat;
    form.coordinates!.longitude = lng;
    isReverseGeocoding.value = true;
    try {
      await reverseGeocode(lat, lng, (result) => {
        applyParsedAddressToForm(form, result);
        addressSearchQuery.value = result.formattedAddress;
        clearFieldError('fullAddress');
      });
    } finally {
      isReverseGeocoding.value = false;
    }
  }

  const { isMapReady, mapLoadError, centerAndMoveMarker } = useLocationPickerMap({
    mapContainerRef,
    isActive: isMapActive,
    coordinates: form.coordinates!,
    onMarkerPositionChange: handleMarkerPositionChange,
    isDark,
  });

  async function handleAddressSelect(selected: { value: string }): Promise<void> {
    addressPlaceError.value = '';
    const details = await getPlaceDetails(selected.value);
    if (!details) {
      addressPlaceError.value = 'No se pudo cargar esa dirección. Intenta de nuevo.';
      return;
    }
    applyParsedAddressToForm(form, details);
    form.coordinates!.latitude = details.latitude;
    form.coordinates!.longitude = details.longitude;
    centerAndMoveMarker(details.latitude, details.longitude);
    addressSearchQuery.value = details.formattedAddress;
    clearFieldError('fullAddress');
  }

  async function handleUseMyLocation(): Promise<void> {
    geolocationError.value = '';
    geolocationErrorCode.value = null;
    isGeolocating.value = true;
    try {
      const { latitude, longitude } = await getCurrentLocation();
      form.coordinates!.latitude = latitude;
      form.coordinates!.longitude = longitude;
      centerAndMoveMarker(latitude, longitude);
    } catch (err) {
      const message =
        err instanceof GeolocationError ? err.message : 'No se pudo obtener tu ubicación';
      const code = err instanceof GeolocationError ? err.code : null;
      geolocationError.value = message;
      geolocationErrorCode.value = code ?? null;
    } finally {
      isGeolocating.value = false;
    }
  }

  function clearErrors() {
    (Object.keys(errors) as (keyof CreateLocationForm)[]).forEach((k) => {
      delete errors[k];
    });
  }

  function clearFieldError(key: keyof CreateLocationForm) {
    delete errors[key];
  }

  function validate(): boolean {
    clearErrors();
    const full = form.fullAddress?.trim();
    const street = form.street?.trim();
    const city = form.city?.trim();
    if (!full && !(street && city)) {
      errors.fullAddress = 'Indica la dirección completa, o bien calle y número junto con ciudad.';
    }
    return Object.keys(errors).length === 0;
  }

  function resolveReturnNavigation(): void {
    const raw = queryParamSingle(route.query.returnTo);
    let returnTo = raw;
    if (returnTo) {
      try {
        returnTo = decodeURIComponent(returnTo);
      } catch {
        returnTo = raw;
      }
    }
    if (returnTo && isSafeReturnPath(returnTo)) {
      void router.replace(returnTo);
      return;
    }
    if (globalThis.history.length > 1) {
      router.back();
      return;
    }
    const sid = storeIdFromQuery.value;
    if (sid) {
      void router.push({ name: 'StoreDetails', params: { id: sid } });
    }
  }

  async function load() {
    const locId = locationId.value;
    const sid = storeIdFromQuery.value;

    if (!locId) {
      loadError.value = 'ID de ubicación no válido';
      loading.value = false;
      return;
    }
    if (!sid) {
      loadError.value =
        'Falta el contexto de la tienda (storeId). Abre la edición desde el detalle de la tienda o un enlace válido.';
      loading.value = false;
      return;
    }

    loading.value = true;
    loadError.value = null;

    try {
      const api = await getStoreById(sid);
      if (!api.location?.id || api.location.id !== locId) {
        storeName.value = '';
        loadError.value = 'La ubicación no coincide con esta tienda o no existe.';
        Object.assign(form, emptyLocationForm());
        return;
      }
      storeName.value = api.name;
      Object.assign(form, locationApiToForm(api.location));
      addressSearchQuery.value = form.fullAddress;
    } catch (e) {
      storeName.value = '';
      loadError.value = e instanceof Error ? e.message : 'No se pudo cargar la tienda';
      Object.assign(form, emptyLocationForm());
    } finally {
      loading.value = false;
    }
  }

  function goBack() {
    resolveReturnNavigation();
  }

  async function submit() {
    if (!validate()) return;
    isSubmitting.value = true;
    try {
      await new Promise((r) => setTimeout(r, 400));
      toast.success(
        'Cambios registrados solo en la interfaz. Conecta el endpoint PATCH cuando esté listo.'
      );
      resolveReturnNavigation();
    } finally {
      isSubmitting.value = false;
    }
  }

  watch(
    () => [route.params.locationId, route.query.storeId] as const,
    () => {
      void load();
    },
    { immediate: true }
  );

  onMounted(() => {
    geolocationSupported.value = !!navigator?.geolocation;
  });

  return {
    storeName,
    loading,
    loadError,
    form,
    errors,
    isSubmitting,
    clearFieldError,
    submit,
    goBack,
    reload: load,
    mapContainerRef,
    isMapReady,
    mapLoadError,
    addressSearchQuery,
    addressPlaceError,
    getSuggestions,
    handleAddressSelect,
    isGeolocating,
    geolocationSupported,
    geolocationError,
    geolocationErrorCode,
    handleUseMyLocation,
    isReverseGeocoding,
  };
}
