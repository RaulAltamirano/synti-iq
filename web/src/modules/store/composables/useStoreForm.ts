import { computed, ref, onMounted, toRef, nextTick, unref } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import {
  getInitialFormState,
  formToPayload,
} from '@/modules/store/composables/useStoreFormPayload';
import {
  cloneScheduleRows,
  useStoreScheduleForm,
} from '@/modules/store/composables/useStoreScheduleForm';
import { useStoreFormMap } from '@/modules/store/composables/useStoreFormMap';
import {
  useStoreFormGeolocation,
  GeolocationError,
} from '@/modules/store/composables/useStoreFormGeolocation';
import { useReverseGeocode } from '@/modules/store/composables/useReverseGeocode';
import type { ReverseGeocodeResult } from '@/modules/store/composables/useReverseGeocode';
import { usePlacesAutocomplete } from '@/modules/store/composables/usePlacesAutocomplete';
import type { StoreFormState } from '@/modules/store/types/store-form.types';
import { STORE_FORM_LIMITS } from '@/modules/store/constants/store-form-limits';
import { createStore } from '@/modules/store/services/storeApi';
import { useToast } from '@/modules/ui';
import {
  WIZARD_STORAGE_KEY,
  WIZARD_STEPS,
  STEP1_FIELD_FOCUS_ORDER,
  STEP2_FIELD_FOCUS_ORDER,
} from '@/modules/store/composables/store-form-wizard.constants';
import {
  storeWizardSchema,
  STORE_WIZARD_STEP1_FIELDS,
  STORE_WIZARD_STEP2_FIELDS,
} from '@/modules/store/schemas/store-wizard.schema';
import type { StepperStep } from '@/modules/ui/components/Stepper/Stepper.ts';
import { getFieldError, hasFieldError } from '@/modules/store/utils/form-field-error';
import type { StoreScheduleModelValue } from '@/modules/store/components/StoreScheduleEditor/StoreScheduleEditor.ts';

const storeWizardTypedSchema = toTypedSchema(storeWizardSchema);

function focusElementById(id: string): void {
  const el = document.getElementById(id);
  if (el instanceof HTMLElement) {
    el.focus({ preventScroll: false });
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/** Defensive clamp for values coming from the Google APIs so they always pass schema limits. */
function clampText(value: string, max: number): string {
  const t = value.trim();
  return t.length > max ? t.slice(0, max) : t;
}

function clearWizardStepStorage(): void {
  try {
    sessionStorage.removeItem(WIZARD_STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

export function useStoreForm() {
  const router = useRouter();
  const toast = useToast();

  const initialValues = getInitialFormState();
  if (!initialValues.location.coordinates) {
    initialValues.location.coordinates = { latitude: 0, longitude: 0 };
  }

  const { values, errors, validate, validateField, setFieldValue } = useForm<StoreFormState>({
    validationSchema: storeWizardTypedSchema,
    initialValues,
  });

  const formData = values;

  const isSubmitting = ref(false);
  const currentStep = ref(1);
  const totalSteps = WIZARD_STEPS.length;
  const mapContainerRef = ref<HTMLElement | null>(null);
  const geolocationError = ref('');
  const geolocationErrorCode = ref<GeolocationError['code'] | null>(null);
  const isGeolocating = ref(false);
  const addressSearchQuery = ref('');
  const addressPlaceError = ref('');
  const { getSuggestions, getPlaceDetails } = usePlacesAutocomplete();

  if (!formData.location.coordinates) {
    formData.location.coordinates = { latitude: 0, longitude: 0 };
  }
  const { reverseGeocode } = useReverseGeocode();

  /**
   * Short label for the API's `location.name` (2–100 chars): the first segment of the
   * formatted address (e.g. "C. 14 Pte. S/N"); falls back to the clamped full address.
   */
  function deriveLocationName(details: ReverseGeocodeResult): string {
    const firstSegment = details.formattedAddress.split(',')[0]?.trim() ?? '';
    const candidate = firstSegment.length >= 2 ? firstSegment : details.formattedAddress;
    return clampText(candidate, STORE_FORM_LIMITS.LOCATION_NAME_MAX);
  }

  /**
   * All programmatic writes go through `setFieldValue` (vee-validate `values` is read-only by
   * contract); this also re-validates the fields so a stale "Required" error clears immediately.
   * Values are clamped to the API contract (`CreateLocationDto`) so submission never fails on length.
   */
  function applyLocationDetails(details: ReverseGeocodeResult, name?: string): void {
    setFieldValue(
      'location.name',
      clampText(name ?? deriveLocationName(details), STORE_FORM_LIMITS.LOCATION_NAME_MAX)
    );
    setFieldValue(
      'location.fullAddress',
      clampText(details.formattedAddress, STORE_FORM_LIMITS.LOCATION_FULL_ADDRESS_MAX)
    );
    setFieldValue(
      'location.street',
      clampText(details.street, STORE_FORM_LIMITS.LOCATION_LINE_MAX)
    );
    setFieldValue(
      'location.neighborhood',
      clampText(details.neighborhood, STORE_FORM_LIMITS.LOCATION_LINE_MAX)
    );
    setFieldValue('location.city', clampText(details.city, STORE_FORM_LIMITS.LOCATION_LINE_MAX));
    setFieldValue('location.state', clampText(details.state, STORE_FORM_LIMITS.LOCATION_LINE_MAX));
    setFieldValue(
      'location.postalCode',
      clampText(details.postalCode, STORE_FORM_LIMITS.POSTAL_CODE_MAX)
    );
    setFieldValue(
      'location.country',
      clampText(details.country, STORE_FORM_LIMITS.LOCATION_LINE_MAX)
    );
  }

  function setCoordinates(lat: number, lng: number): void {
    setFieldValue('location.coordinates.latitude', lat);
    setFieldValue('location.coordinates.longitude', lng);
  }

  function handleMarkerPositionChange(lat: number, lng: number): void {
    setCoordinates(lat, lng);
    // Coordinates as immediate fallback: the pin alone satisfies "location is required",
    // even when reverse geocoding is unavailable. A successful lookup upgrades it below.
    const coordsLabel = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    applyLocationDetails(
      {
        formattedAddress: coordsLabel,
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      coordsLabel
    );
    void reverseGeocode(lat, lng, applyLocationDetails);
  }

  const { isMapReady, mapLoadError, centerAndMoveMarker } = useStoreFormMap({
    mapContainerRef,
    currentStep,
    coordinates: formData.location.coordinates,
    onMarkerPositionChange: handleMarkerPositionChange,
  });
  const { getCurrentLocation } = useStoreFormGeolocation();

  async function handleUseMyLocation(): Promise<void> {
    geolocationError.value = '';
    geolocationErrorCode.value = null;
    isGeolocating.value = true;
    try {
      const { latitude, longitude } = await getCurrentLocation();
      setCoordinates(latitude, longitude);
      centerAndMoveMarker(latitude, longitude);
    } catch (err) {
      const message = err instanceof GeolocationError ? err.message : 'Could not get your location';
      const code = err instanceof GeolocationError ? err.code : null;
      geolocationError.value = message;
      geolocationErrorCode.value = code ?? null;
    } finally {
      isGeolocating.value = false;
    }
  }

  async function handleAddressSelect(selected: { value: string }): Promise<void> {
    addressPlaceError.value = '';
    const details = await getPlaceDetails(selected.value);
    if (!details) {
      addressPlaceError.value = 'Could not load that address. Please try again.';
      return;
    }
    applyLocationDetails(details);
    setCoordinates(details.latitude, details.longitude);
    // notify: false — the place already provides the address; skip the redundant
    // reverse geocode that used to overwrite these details with a coarser result.
    centerAndMoveMarker(details.latitude, details.longitude, { notify: false });
    addressSearchQuery.value = details.formattedAddress;
  }

  const geolocationSupported = ref(true);

  const scheduleRowsRef = toRef(formData, 'scheduleRows');
  const { validateSchedules } = useStoreScheduleForm({ scheduleRows: scheduleRowsRef });
  const scheduleValidationError = ref('');

  const errorBag = computed(() => unref(errors) as Record<string, unknown>);

  const locationNameError = computed(() => getFieldError(errorBag.value, 'location.name'));

  const selectedAddressLabel = computed(
    () => formData.location.fullAddress || 'No address selected'
  );

  const scheduleModelValue = computed<StoreScheduleModelValue>(() => ({
    scheduleTimezone: formData.scheduleTimezone,
    scheduleRows: formData.scheduleRows,
  }));

  const geolocationWarning = computed(() => {
    if (geolocationSupported.value && !geolocationError.value) return null;

    if (!geolocationSupported.value) {
      return {
        title: 'Geolocation not available',
        description:
          'Your browser does not support geolocation. Use address search to choose your store location.',
        icon: ['fas', 'map-marker-alt'],
        showRetry: false,
      };
    }

    if (geolocationErrorCode.value === 'PERMISSION_DENIED') {
      return {
        title: 'Location permission denied',
        description: 'Enable location access in your browser settings to use “Use my location”.',
        icon: ['fas', 'location-crosshairs'],
        showRetry: true,
      };
    }

    return {
      title: 'Could not get your location',
      description: geolocationError.value,
      icon: ['fas', 'map-marker-alt'] as const,
      showRetry: true,
    };
  });

  function fieldError(path: string): string {
    return getFieldError(errorBag.value, path);
  }

  async function focusFirstInvalidField(step: number): Promise<void> {
    await nextTick();
    const errBag = errorBag.value;
    if (step === 1) {
      for (const { ruleKey, elementId } of STEP1_FIELD_FOCUS_ORDER) {
        if (hasFieldError(errBag, ruleKey)) {
          focusElementById(elementId);
          return;
        }
      }
    }
    if (step === 2) {
      for (const { ruleKey, elementId } of STEP2_FIELD_FOCUS_ORDER) {
        if (hasFieldError(errBag, ruleKey)) {
          focusElementById(elementId);
          return;
        }
      }
    }
    if (step === 3 && scheduleValidationError.value) {
      const el = document.querySelector<HTMLElement>('.store-schedule-editor__error');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  async function validateFieldsForStep(step: number): Promise<boolean> {
    scheduleValidationError.value = '';
    if (step === 1) {
      let ok = true;
      for (const field of STORE_WIZARD_STEP1_FIELDS) {
        const { valid } = await validateField(field);
        if (!valid) ok = false;
      }
      return ok;
    }
    if (step === 2) {
      let ok = true;
      for (const field of STORE_WIZARD_STEP2_FIELDS) {
        const { valid } = await validateField(field);
        if (!valid) ok = false;
      }
      return ok;
    }
    if (step === 3) {
      const result = validateSchedules();
      scheduleValidationError.value = result.errorMessage;
      return result.valid;
    }
    return true;
  }

  async function validateForm(): Promise<boolean> {
    scheduleValidationError.value = '';
    const { valid: formValid } = await validate();
    const result = validateSchedules();
    if (!result.valid) {
      scheduleValidationError.value = result.errorMessage;
    }
    return !!formValid && result.valid;
  }

  async function goNext(): Promise<void> {
    const valid = await validateFieldsForStep(currentStep.value);
    if (!valid) {
      await focusFirstInvalidField(currentStep.value);
      return;
    }
    if (currentStep.value < totalSteps) {
      currentStep.value += 1;
    }
  }

  function goBack(): void {
    if (currentStep.value > 1) {
      currentStep.value -= 1;
    }
  }

  onMounted(() => {
    geolocationSupported.value = !!navigator?.geolocation;
    // Always start at step 1; discard any step saved from a previous visit.
    clearWizardStepStorage();
  });

  async function saveStore(): Promise<void> {
    if (!(await validateForm())) {
      const errBag = errorBag.value;
      if (STORE_WIZARD_STEP1_FIELDS.some((f) => hasFieldError(errBag, f))) {
        currentStep.value = 1;
      } else if (STORE_WIZARD_STEP2_FIELDS.some((f) => hasFieldError(errBag, f))) {
        currentStep.value = 2;
      } else {
        currentStep.value = 3;
      }
      await focusFirstInvalidField(currentStep.value);
      return;
    }

    isSubmitting.value = true;
    try {
      const payload = formToPayload(formData);
      await createStore(payload);
      clearWizardStepStorage();
      await router.push({ name: 'StoreDashboard' });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not create the store';
      toast.error(message);
    } finally {
      isSubmitting.value = false;
    }
  }

  function cancelForm(): void {
    clearWizardStepStorage();
    router.back();
  }

  function handleScheduleModelUpdate(value: StoreScheduleModelValue): void {
    setFieldValue('scheduleTimezone', value.scheduleTimezone);
    setFieldValue('scheduleRows', cloneScheduleRows(value.scheduleRows));
  }

  function handleFormSubmit(): void {
    if (currentStep.value < totalSteps) {
      void goNext();
      return;
    }
    void saveStore();
  }

  return {
    formData,
    setFieldValue,
    isSubmitting,
    errors,
    currentStep,
    totalSteps,
    wizardSteps: [...WIZARD_STEPS] as StepperStep[],
    mapContainerRef,
    isMapReady,
    mapLoadError,
    geolocationError,
    geolocationErrorCode,
    addressSearchQuery,
    addressPlaceError,
    getSuggestions,
    handleAddressSelect,
    isGeolocating,
    geolocationSupported,
    handleUseMyLocation,
    saveStore,
    cancelForm,
    goNext,
    goBack,
    scheduleValidationError,
    fieldError,
    locationNameError,
    selectedAddressLabel,
    scheduleModelValue,
    geolocationWarning,
    handleScheduleModelUpdate,
    handleFormSubmit,
  };
}
