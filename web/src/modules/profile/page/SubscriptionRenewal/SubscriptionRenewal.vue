<template>
  <div
    class="flex justify-center items-start min-h-screen transition-colors duration-300 py-8 px-4"
  >
    <div class="flex flex-col max-w-5xl w-full space-y-6">
      <!-- Header con título y botón de regreso -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            class="p-3 rounded-lg transition-all bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center shadow-md"
            @click="goBack"
          >
            <FontAwesomeIcon
              :icon="['fas', 'arrow-left']"
              class="text-lg text-gray-600 dark:text-gray-300"
            />
          </button>
          <div class="flex items-center gap-3">
            <FontAwesomeIcon
              :icon="['fas', 'credit-card']"
              class="text-2xl text-purple-600 dark:text-purple-400"
            />
            <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 tracking-wide">
              {{ isRenewal ? 'Renovar Suscripción' : 'Contratar Suscripción' }}
            </h1>
          </div>
        </div>
      </div>

      <!-- Mensaje informativo según el tipo -->
      <div
        v-if="!isRenewal"
        v-motion="{
          initial: { opacity: 0, y: -10 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        }"
        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <div class="flex items-start">
          <FontAwesomeIcon
            :icon="['fas', 'info-circle']"
            class="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0"
          />
          <div class="text-sm text-blue-800 dark:text-blue-200">
            <p class="font-medium mb-1">¡Bienvenido!</p>
            <p>
              Estás a punto de contratar tu primera suscripción. Selecciona el plan que mejor se
              adapte a tus necesidades y completa el proceso de pago.
            </p>
          </div>
        </div>
      </div>

      <!-- Stepper Indicator -->
      <div
        v-motion="{
          initial: { opacity: 0, y: -10 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1 } },
        }"
        class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md"
      >
        <div class="flex items-center justify-between max-w-3xl mx-auto">
          <!-- Step 1 -->
          <div class="flex items-center flex-1">
            <div
              class="flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all duration-300 text-sm"
              :class="
                currentStep >= 1
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              "
            >
              <span v-if="currentStep > 1" class="text-white">
                <FontAwesomeIcon :icon="['fas', 'check']" class="h-5 w-5" />
              </span>
              <span v-else>1</span>
            </div>
            <span
              class="ml-3 text-sm font-medium"
              :class="
                currentStep >= 1
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400'
              "
            >
              Seleccionar Plan
            </span>
          </div>

          <!-- Connector Line 1 -->
          <div
            class="flex-1 h-1 mx-4 transition-all duration-300 rounded"
            :class="currentStep >= 2 ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'"
          ></div>

          <!-- Step 2 -->
          <div class="flex items-center flex-1">
            <div
              class="flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all duration-300 text-sm"
              :class="
                currentStep >= 2
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              "
            >
              <span v-if="currentStep > 2" class="text-white">
                <FontAwesomeIcon :icon="['fas', 'check']" class="h-5 w-5" />
              </span>
              <span v-else>2</span>
            </div>
            <span
              class="ml-3 text-sm font-medium"
              :class="
                currentStep >= 2
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400'
              "
            >
              Dirección
            </span>
          </div>

          <!-- Connector Line 2 -->
          <div
            class="flex-1 h-1 mx-4 transition-all duration-300 rounded"
            :class="currentStep >= 3 ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'"
          ></div>

          <!-- Step 3 -->
          <div class="flex items-center flex-1">
            <div
              class="flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all duration-300 text-sm"
              :class="
                currentStep >= 3
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              "
            >
              3
            </div>
            <span
              class="ml-3 text-sm font-medium"
              :class="
                currentStep >= 3
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400'
              "
            >
              Pago
            </span>
          </div>
        </div>
      </div>

      <!-- Contenido del Wizard -->
      <div
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.2 } },
        }"
        class="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-md"
      >
        <!-- Step 1: Plan Selection -->
        <PlanSelectionStep
          v-if="currentStep === 1"
          :selected-plan="selectedPlan"
          @update:selected-plan="updateSelectedPlan"
        />

        <!-- Step 2: Address Form -->
        <AddressFormStep
          v-if="currentStep === 2"
          :address-data="addressData"
          @update:address-data="updateAddressData"
        />

        <!-- Step 3: Payment -->
        <PaymentStep
          v-if="currentStep === 3"
          :selected-plan="selectedPlan"
          :address-data="addressData"
          :is-renewal="isRenewal"
        />
      </div>

      <!-- Footer con Navegación -->
      <div
        v-motion="{
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.3 } },
        }"
        class="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md"
      >
        <button
          v-if="currentStep > 1"
          class="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
          @click="previousStep"
        >
          <FontAwesomeIcon :icon="['fas', 'arrow-left']" class="h-4 w-4 mr-2" />
          Anterior
        </button>
        <div v-else></div>

        <div class="flex gap-3 w-full sm:w-auto">
          <button
            class="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            @click="goBack"
          >
            Cancelar
          </button>
          <button
            v-if="currentStep < 3"
            :disabled="!canProceedToNextStep"
            :class="[
              'w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center',
              canProceedToNextStep
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md'
                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed',
            ]"
            @click="nextStep"
          >
            Siguiente
            <FontAwesomeIcon :icon="['fas', 'arrow-right']" class="h-4 w-4 ml-2" />
          </button>
          <button
            v-else
            :disabled="!canProceedToNextStep"
            :class="[
              'w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center',
              canProceedToNextStep
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md'
                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed',
            ]"
            @click="handlePayment"
          >
            <FontAwesomeIcon :icon="['fas', 'credit-card']" class="h-4 w-4 mr-2" />
            {{ isRenewal ? 'Renovar' : 'Contratar' }}
            {{ selectedPlan ? `$${selectedPlan.price.toFixed(2)}` : '' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  useSubscriptionWizard,
  type SubscriptionPlan,
  type AddressData,
} from '../../composables/useSubscriptionWizard';
import PlanSelectionStep from '../../components/SubscriptionRenewalModal/PlanSelectionStep.vue';
import AddressFormStep from '../../components/SubscriptionRenewalModal/AddressFormStep.vue';
import PaymentStep from '../../components/SubscriptionRenewalModal/PaymentStep.vue';

const router = useRouter();
const route = useRoute();

// Determinar si es renovación o nueva contratación basado en la ruta o query params
const isRenewal = computed(() => {
  // Si viene de la ruta 'renew' es renovación, si viene de 'new' o 'subscribe' es nueva contratación
  return route.path.includes('/renew') || route.query.type !== 'new';
});

const {
  currentStep,
  selectedPlan,
  addressData,
  canProceedToNextStep,
  nextStep,
  previousStep,
  resetWizard,
} = useSubscriptionWizard();

const updateSelectedPlan = (plan: SubscriptionPlan | null) => {
  selectedPlan.value = plan;
};

const updateAddressData = (data: AddressData) => {
  Object.assign(addressData.value, data);
};

const goBack = () => {
  resetWizard();
  router.push({ name: 'Profile' });
};

const handlePayment = () => {
  const actionType = isRenewal.value ? 'renovación' : 'contratación';
  alert(`La integración con Stripe se implementará posteriormente. Tipo: ${actionType}`);
};

// Resetear wizard al montar si viene de otra página
onMounted(() => {
  // Opcional: mantener el estado si el usuario navega hacia atrás
  // Por ahora reseteamos para empezar limpio
  if (currentStep.value === 1 && !selectedPlan.value) {
    resetWizard();
  }
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
