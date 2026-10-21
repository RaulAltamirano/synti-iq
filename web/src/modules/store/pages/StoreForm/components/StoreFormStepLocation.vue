<script setup lang="ts">
import { Field } from 'vee-validate';
import { Autocomplete, Button, InfoBanner, Input, Textarea } from '@/modules/ui';
import FormSection from '@/modules/store/components/FormSection/FormSection.vue';
import { LOCATION_SEARCH_INPUT_ID } from '@/modules/store/composables/store-form-wizard.constants';
import { STORE_FORM_LIMITS } from '@/modules/store/constants/store-form-limits';
import type { StoreFormState } from '@/modules/store/types/store-form.types';

interface GeolocationWarning {
  title: string;
  description: string;
  icon: string | string[];
  showRetry: boolean;
}

interface Props {
  disabled?: boolean;
  location: StoreFormState['location'];
  addressPlaceError: string;
  locationNameError: string;
  selectedAddressLabel: string;
  geolocationWarning: GeolocationWarning | null;
  isMapReady: boolean;
  mapLoadError?: string | null;
  isGeolocating: boolean;
  geolocationSupported: boolean;
  isDark: boolean;
  getSuggestions: (query: string) => Promise<{ value: string; label: string }[]>;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  addressSelect: [selected: { value: string }];
  useMyLocation: [];
}>();

const mapContainerRef = defineModel<HTMLElement | null>('mapContainerRef', { default: null });
const addressSearchQuery = defineModel<string>('addressSearchQuery', { default: '' });

function addressSearchErrorMessage(): string {
  return props.addressPlaceError || props.locationNameError;
}
</script>

<template>
  <FormSection title="Pin on map">
    <InfoBanner
      v-if="geolocationWarning"
      variant="warning"
      :title="geolocationWarning.title"
      :description="geolocationWarning.description"
      :icon="geolocationWarning.icon"
      :action-label="geolocationWarning.showRetry ? 'Try again' : undefined"
      :action-handler="geolocationWarning.showRetry ? () => emit('useMyLocation') : undefined"
      class="shrink-0"
    />

    <div class="flex flex-col gap-4">
      <div
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
        :class="{ 'opacity-60': disabled }"
      >
        <div class="min-w-0 flex-1">
          <Autocomplete
            :id="LOCATION_SEARCH_INPUT_ID"
            :model-value="addressSearchQuery"
            label="Search address"
            placeholder="Type an address to search…"
            :prefix-icon="['fas', 'search']"
            :fetch-suggestions="getSuggestions"
            :disabled="disabled"
            :error="!!addressPlaceError || !!locationNameError"
            :error-message="addressSearchErrorMessage()"
            full-width
            :name="LOCATION_SEARCH_INPUT_ID"
            @update:model-value="addressSearchQuery = $event"
            @select="emit('addressSelect', $event)"
          />
        </div>

        <div class="shrink-0">
          <Button
            type="button"
            variant="secondary"
            :icon="['fas', 'location-crosshairs']"
            icon-position="left"
            class="min-h-11 w-full touch-manipulation sm:w-auto"
            :disabled="disabled || !isMapReady || !geolocationSupported || isGeolocating"
            :loading="isGeolocating"
            @click="emit('useMyLocation')"
          >
            Use my location
          </Button>
        </div>
      </div>

      <div
        class="relative h-80 min-h-[280px] w-full overflow-hidden rounded-lg border sm:h-96 sm:min-h-[320px]"
        :class="isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'"
      >
        <div
          ref="mapContainerRef"
          class="h-full w-full"
          aria-label="Map to select store location"
          role="application"
          aria-roledescription="interactive map"
        />

        <div
          v-if="!isMapReady || mapLoadError"
          class="absolute inset-0 flex items-center justify-center rounded-lg"
          :class="isDark ? 'bg-gray-700/50' : 'bg-gray-50'"
        >
          <p
            v-if="!mapLoadError"
            class="text-sm"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            Loading map…
          </p>
          <p v-else class="px-4 text-center text-sm text-error" role="alert">
            {{ mapLoadError }}
          </p>
        </div>
      </div>

      <div
        class="rounded-lg border px-4 py-3"
        :class="[
          isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-100',
          { 'opacity-60': disabled },
        ]"
      >
        <p
          class="line-clamp-2 text-sm leading-snug"
          :class="locationNameError ? 'text-error' : isDark ? 'text-gray-300' : 'text-gray-700'"
          aria-label="Selected address"
          :aria-invalid="!!locationNameError"
        >
          {{ selectedAddressLabel }}
        </p>
        <p v-if="locationNameError" class="mt-1 text-xs text-error" role="alert">
          {{ locationNameError }}
        </p>
      </div>
    </div>
  </FormSection>

  <FormSection title="Address details">
    <Field v-slot="{ componentField, errorMessage }" name="location.addressReference">
      <Textarea
        id="location-reference"
        v-bind="componentField"
        label="Address reference"
        placeholder="e.g. Between 1st Ave and Main St"
        :error="!!errorMessage"
        :error-message="errorMessage ?? ''"
        :disabled="disabled"
        :rows="2"
        :maxlength="STORE_FORM_LIMITS.LOCATION_REFERENCE_MAX"
        full-width
        name="location-reference"
      />
    </Field>

    <Field v-slot="{ componentField, errorMessage }" name="location.street">
      <Input
        id="location-street"
        v-bind="componentField"
        label="Street and number"
        placeholder="123 Main St"
        :prefix-icon="['fas', 'road']"
        :error="!!errorMessage"
        :error-message="errorMessage ?? ''"
        :disabled="disabled"
        :maxlength="STORE_FORM_LIMITS.LOCATION_LINE_MAX"
        full-width
        name="location-street"
      />
    </Field>

    <Input
      id="location-neighborhood"
      :model-value="location.neighborhood ?? ''"
      label="Neighborhood"
      placeholder="—"
      :prefix-icon="['fas', 'map-marker-alt']"
      readonly
      :disabled="disabled"
      full-width
      name="location-neighborhood"
    />

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input
        id="location-city"
        :model-value="location.city ?? ''"
        label="City"
        placeholder="—"
        :prefix-icon="['fas', 'city']"
        readonly
        :disabled="disabled"
        full-width
        name="location-city"
      />
      <Input
        id="location-state"
        :model-value="location.state ?? ''"
        label="State / region"
        placeholder="—"
        :prefix-icon="['fas', 'map']"
        readonly
        :disabled="disabled"
        full-width
        name="location-state"
      />
    </div>

    <Input
      id="location-postal-code"
      :model-value="location.postalCode ?? ''"
      label="Postal code"
      placeholder="—"
      :prefix-icon="['fas', 'envelope']"
      readonly
      :disabled="disabled"
      full-width
      name="location-postal-code"
    />
  </FormSection>
</template>
