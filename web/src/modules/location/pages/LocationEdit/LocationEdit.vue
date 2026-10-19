<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import TitleCard from '@/modules/shared/components/TitleCard/TitleCard.vue';
import {
  Autocomplete,
  Button,
  InfoBanner,
  Input,
  Section,
  Skeleton,
  Spinner,
  Textarea,
} from '@/modules/ui/components';
import { useLocationEdit } from '@/modules/location/composables/useLocationEdit';

const {
  storeName,
  loading,
  loadError,
  form,
  errors,
  isSubmitting,
  clearFieldError,
  submit,
  goBack,
  reload,
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
} = useLocationEdit();

const hasAdvancedAddressFields = computed(() => {
  const f = form;
  const t = (s: string | undefined) => (s ?? '').trim();
  return Boolean(
    t(f.street) || t(f.neighborhood) || t(f.city) || t(f.state) || t(f.postalCode) || t(f.country)
  );
});

const hasSelectedAddress = computed(() => Boolean(form.fullAddress?.trim()));

void mapContainerRef; // NOSONAR: bound via ref="mapContainerRef" in template; script-side TS does not count template usage
</script>

<template>
  <div
    class="min-h-screen w-full py-4 px-4 sm:py-8 sm:px-6 text-gray-800 dark:text-gray-100 motion-safe:transition-colors motion-safe:duration-300 motion-reduce:transition-none"
  >
    <div class="flex flex-col max-w-4xl w-full mx-auto gap-4 sm:gap-6 lg:gap-8 min-w-0">
      <div class="flex flex-col gap-1 min-w-0">
        <TitleCard
          :title="loading ? 'Cargando…' : 'Editar dirección'"
          icon="map-marker-alt"
          :actions="[]"
          :show-back-button="true"
        />
        <p
          v-if="!loading && !loadError && storeName"
          class="text-sm px-1 sm:px-2 text-gray-600 dark:text-gray-400"
        >
          {{ storeName }}
        </p>
      </div>

      <div v-if="loading" class="flex flex-col gap-4">
        <Skeleton variant="rectangular" class="h-48 w-full rounded-xl" />
        <Skeleton variant="text" class="h-6 w-2/3 max-w-md" />
        <Skeleton variant="text" class="h-10 w-full" />
        <Skeleton variant="text" class="h-10 w-full" />
      </div>

      <InfoBanner
        v-else-if="loadError"
        variant="error"
        title="No se pudo cargar"
        :description="loadError"
        :icon="['fas', 'exclamation-circle']"
      >
        <template #actions>
          <div class="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              class="min-h-[44px] sm:min-h-0 touch-manipulation"
              @click="reload"
            >
              Reintentar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="min-h-[44px] sm:min-h-0 touch-manipulation"
              @click="goBack"
            >
              Volver
            </Button>
          </div>
        </template>
      </InfoBanner>

      <template v-else>
        <InfoBanner
          variant="info"
          title="Guardado en interfaz"
          description="El envío al API se activará cuando exista el endpoint de actualización de ubicación. El mapa y el autocompletado ya puedes usarlos para preparar la dirección."
          :icon="['fas', 'info-circle']"
          class="shrink-0"
        />

        <form class="flex flex-col gap-6" @submit.prevent="submit">
          <Section
            title="Ubicación en mapa"
            subtitle="Busca una dirección o usa tu ubicación para colocar el pin. Puedes afinar el punto arrastrando el marcador."
            :icon="['fas', 'map-marker-alt']"
            icon-color="green"
            :collapsible="false"
          >
            <div class="flex flex-col gap-6">
              <div class="flex flex-col gap-4">
                <InfoBanner
                  v-if="!geolocationSupported || geolocationError"
                  variant="warning"
                  :title="
                    !geolocationSupported
                      ? 'Geolocalización no disponible'
                      : geolocationErrorCode === 'PERMISSION_DENIED'
                        ? 'Permiso de ubicación denegado'
                        : 'No se pudo obtener tu ubicación'
                  "
                  :description="
                    !geolocationSupported
                      ? 'Tu navegador no admite geolocalización. Usa la búsqueda de dirección para elegir el punto.'
                      : geolocationErrorCode === 'PERMISSION_DENIED'
                        ? 'Activa el acceso a la ubicación en la configuración del navegador para usar «Usar mi ubicación».'
                        : geolocationError
                  "
                  :icon="[
                    'fas',
                    geolocationErrorCode === 'PERMISSION_DENIED'
                      ? 'location-crosshairs'
                      : 'map-marker-alt',
                  ]"
                  :action-label="geolocationSupported ? 'Reintentar' : undefined"
                  :action-handler="geolocationSupported ? handleUseMyLocation : undefined"
                  class="shrink-0"
                />

                <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div class="flex-1 min-w-0">
                    <Autocomplete
                      id="location-address-search"
                      v-model="addressSearchQuery"
                      label="Buscar dirección"
                      placeholder="Escribe calle, ciudad o código postal…"
                      helper-text="Elige un resultado para mover el mapa y fijar la dirección principal."
                      :prefix-icon="['fas', 'search']"
                      :fetch-suggestions="getSuggestions"
                      :error="!!addressPlaceError"
                      :error-message="addressPlaceError"
                      full-width
                      name="location-address-search"
                      @select="handleAddressSelect"
                    />
                  </div>
                  <div class="shrink-0">
                    <Button
                      type="button"
                      variant="secondary"
                      :icon="['fas', 'location-crosshairs']"
                      icon-position="left"
                      class="w-full sm:w-auto min-h-11 touch-manipulation"
                      :disabled="!isMapReady || !geolocationSupported || isGeolocating"
                      :loading="isGeolocating"
                      @click="handleUseMyLocation"
                    >
                      Usar mi ubicación
                    </Button>
                  </div>
                </div>

                <div
                  class="relative h-80 min-h-[280px] sm:h-96 sm:min-h-[320px] w-full rounded-lg border overflow-hidden border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50"
                >
                  <div
                    ref="mapContainerRef"
                    class="h-full w-full"
                    aria-label="Mapa para ajustar la ubicación"
                    role="application"
                    aria-roledescription="mapa interactivo"
                  />
                  <div
                    v-if="!isMapReady || mapLoadError"
                    class="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <p v-if="!mapLoadError" class="text-sm text-gray-500 dark:text-gray-400">
                      Cargando mapa…
                    </p>
                    <p v-else class="text-sm text-error px-4 text-center" role="alert">
                      {{ mapLoadError }}
                    </p>
                  </div>
                </div>

                <div
                  class="flex gap-4 rounded-xl border p-4 shadow-sm transition-colors duration-200"
                  :class="
                    hasSelectedAddress
                      ? 'border-primary-200 bg-white dark:border-primary-800/50 dark:bg-gray-800/95'
                      : 'border-dashed border-gray-300 bg-gray-50/80 dark:border-gray-600 dark:bg-gray-800/40'
                  "
                  aria-live="polite"
                  aria-labelledby="location-selected-address-label"
                >
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                    :class="
                      hasSelectedAddress
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400'
                        : 'bg-gray-200/80 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    "
                    aria-hidden="true"
                  >
                    <FontAwesomeIcon :icon="['fas', 'map-marker-alt']" class="h-5 w-5" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p
                      id="location-selected-address-label"
                      class="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300"
                    >
                      Dirección seleccionada
                    </p>
                    <p
                      class="mt-2 text-pretty wrap-break-word leading-relaxed"
                      :class="
                        hasSelectedAddress
                          ? 'text-base font-medium text-gray-900 dark:text-gray-50'
                          : 'text-sm font-normal text-gray-500 dark:text-gray-400'
                      "
                    >
                      <template v-if="hasSelectedAddress">{{ form.fullAddress }}</template>
                      <template v-else>
                        Busca una dirección o usa tu ubicación para indicar dónde está el local.
                      </template>
                    </p>
                    <div
                      v-if="isReverseGeocoding"
                      class="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
                    >
                      <Spinner size="sm" color="primary" class="shrink-0" />
                      <span>Actualizando dirección según el marcador…</span>
                    </div>
                    <p v-if="errors.fullAddress" class="mt-3 text-sm text-error" role="alert">
                      {{ errors.fullAddress }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section
            title="Detalles del local"
            subtitle="La búsqueda y el marcador rellenan automáticamente la dirección y el desglose. Aquí solo ajusta lo que tus clientes o mensajería necesitan saber a mano."
            :icon="['fas', 'store']"
            icon-color="blue"
            :collapsible="false"
          >
            <div class="flex flex-col gap-6">
              <Input
                v-model="form.name"
                label="Etiqueta corta (opcional)"
                placeholder="Ej. Sucursal centro"
                :prefix-icon="['fas', 'tag']"
                full-width
                name="location-name"
              />

              <Textarea
                v-model="form.addressReference"
                label="Referencias"
                placeholder="Entre calles, piso, acceso por…"
                helper-text="Opcional. Ayuda a ubicar el local."
                :rows="2"
                full-width
                name="address-reference"
              />

              <Section
                title="Revisar o ajustar calle, colonia y código postal"
                subtitle="Opcional. Ajusta si el autocompletado no acertó algún campo."
                :icon="['fas', 'road']"
                icon-color="gray"
                :collapsible="true"
                :default-expanded="hasAdvancedAddressFields"
                collapsible-header-aria-label="Mostrar u ocultar calle, colonia y código postal"
              >
                <div class="flex flex-col gap-4">
                  <Input
                    v-model="form.street"
                    label="Calle y número"
                    placeholder="Av. Insurgentes 123"
                    :prefix-icon="['fas', 'road']"
                    full-width
                    name="street"
                    @update:model-value="clearFieldError('fullAddress')"
                  />
                  <Input
                    v-model="form.neighborhood"
                    label="Colonia"
                    placeholder="Centro"
                    :prefix-icon="['fas', 'map-marker-alt']"
                    full-width
                    name="neighborhood"
                  />
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      v-model="form.city"
                      label="Ciudad"
                      placeholder="Ciudad de México"
                      :prefix-icon="['fas', 'city']"
                      full-width
                      name="city"
                      @update:model-value="clearFieldError('fullAddress')"
                    />
                    <Input
                      v-model="form.state"
                      label="Estado"
                      placeholder="CDMX"
                      :prefix-icon="['fas', 'map']"
                      full-width
                      name="state"
                    />
                  </div>
                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      v-model="form.postalCode"
                      label="Código postal"
                      placeholder="06600"
                      :prefix-icon="['fas', 'envelope']"
                      full-width
                      name="postal-code"
                    />
                    <Input
                      v-model="form.country"
                      label="País"
                      placeholder="México"
                      :prefix-icon="['fas', 'globe']"
                      full-width
                      name="country"
                    />
                  </div>
                </div>
              </Section>
            </div>
          </Section>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              class="w-full min-h-[44px] touch-manipulation sm:w-auto sm:min-h-0"
              @click="goBack"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              class="w-full min-h-[44px] touch-manipulation sm:w-auto sm:min-w-[160px]"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              Guardar
            </Button>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>
