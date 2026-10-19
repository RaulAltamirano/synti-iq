<script setup lang="ts">
import { ref } from 'vue';
import { useMotion } from '@vueuse/motion';
import TitleCard from '@/modules/shared/components/TitleCard/TitleCard.vue';
import { useTheme } from '@/modules/shared/composables/useTheme';
import { Stepper } from '@/modules/ui';
import { STORE_FORM_WIZARD_STEP } from '@/modules/store/composables/store-form-wizard.constants';
import { useStoreForm } from '@/modules/store/composables/useStoreForm';
import StoreFormCard from '@/modules/store/pages/StoreForm/components/StoreFormCard.vue';
import StoreFormStepBasic from '@/modules/store/pages/StoreForm/components/StoreFormStepBasic.vue';
import StoreFormStepLocation from '@/modules/store/pages/StoreForm/components/StoreFormStepLocation.vue';
import StoreFormStepSchedule from '@/modules/store/pages/StoreForm/components/StoreFormStepSchedule.vue';
import StoreFormWizardActions from '@/modules/store/pages/StoreForm/components/StoreFormWizardActions.vue';

const formPageRef = ref<HTMLElement | null>(null);
const { isDark } = useTheme();

useMotion(formPageRef, {
  initial: { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
});

const {
  formData,
  isSubmitting,
  currentStep,
  totalSteps,
  wizardSteps,
  mapContainerRef,
  isMapReady,
  mapLoadError,
  addressSearchQuery,
  addressPlaceError,
  locationNameError,
  selectedAddressLabel,
  geolocationWarning,
  getSuggestions,
  handleAddressSelect,
  isGeolocating,
  geolocationSupported,
  handleUseMyLocation,
  cancelForm,
  goBack,
  scheduleValidationError,
  scheduleModelValue,
  handleScheduleModelUpdate,
  handleFormSubmit,
} = useStoreForm();
</script>

<template>
  <div
    class="min-h-screen w-full px-4 py-8 transition-colors duration-300"
    :class="isDark ? 'text-white' : 'text-gray-800'"
  >
    <div ref="formPageRef" class="mx-auto flex w-full max-w-4xl flex-col gap-6 sm:gap-8">
      <TitleCard title="New store" icon="store" :actions="[]" />

      <Stepper v-model="currentStep" :steps="wizardSteps" :animated="true" />

      <form class="flex flex-col pb-6" aria-label="Create store form" @submit.prevent="handleFormSubmit">
        <div v-show="currentStep === STORE_FORM_WIZARD_STEP.BASIC" class="flex flex-col gap-4">
          <StoreFormCard>
            <StoreFormStepBasic
              :disabled="currentStep !== STORE_FORM_WIZARD_STEP.BASIC"
              :required="currentStep === STORE_FORM_WIZARD_STEP.BASIC"
            />
          </StoreFormCard>
        </div>

        <div v-show="currentStep === STORE_FORM_WIZARD_STEP.LOCATION" class="flex flex-col gap-4">
          <StoreFormCard>
            <StoreFormStepLocation
              v-model:map-container-ref="mapContainerRef"
              v-model:address-search-query="addressSearchQuery"
              :disabled="currentStep !== STORE_FORM_WIZARD_STEP.LOCATION"
              :location="formData.location"
              :address-place-error="addressPlaceError"
              :location-name-error="locationNameError"
              :selected-address-label="selectedAddressLabel"
              :geolocation-warning="geolocationWarning"
              :is-map-ready="isMapReady"
              :map-load-error="mapLoadError ?? ''"
              :is-geolocating="isGeolocating"
              :geolocation-supported="geolocationSupported"
              :is-dark="isDark"
              :get-suggestions="getSuggestions"
              @address-select="handleAddressSelect"
              @use-my-location="handleUseMyLocation"
            />
          </StoreFormCard>
        </div>

        <div v-show="currentStep === STORE_FORM_WIZARD_STEP.SCHEDULE" class="flex flex-col gap-4">
          <StoreFormCard>
            <StoreFormStepSchedule
              :model-value="scheduleModelValue"
              :disabled="currentStep !== STORE_FORM_WIZARD_STEP.SCHEDULE"
              :validation-error="scheduleValidationError"
              @update:model-value="handleScheduleModelUpdate"
            />
          </StoreFormCard>
        </div>

        <StoreFormWizardActions
          :current-step="currentStep"
          :total-steps="totalSteps"
          :is-submitting="isSubmitting"
          :is-dark="isDark"
          @back="goBack"
          @cancel="cancelForm"
        />
      </form>
    </div>
  </div>
</template>
