<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  useSubscriptionWizard,
  type SubscriptionPlan,
  type AddressData,
} from '../../composables/useSubscriptionWizard';
import PlanSelectionStep from './PlanSelectionStep.vue';
import AddressFormStep from './AddressFormStep.vue';
import PaymentStep from './PaymentStep.vue';

interface Props {
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const {
  currentStep,
  selectedPlan,
  addressData,
  canProceedToNextStep,
  nextStep,
  previousStep,
  closeModal,
} = useSubscriptionWizard();

const updateSelectedPlan = (plan: SubscriptionPlan | null) => {
  selectedPlan.value = plan;
};

const updateAddressData = (data: AddressData) => {
  Object.assign(addressData.value, data);
};

const handleClose = () => {
  closeModal();
  emit('close');
};

const handlePayment = () => {
  alert('La integración con Stripe se implementará posteriormente');
};
</script>

<template>
  <!-- Modal Overlay -->
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Overlay Background -->
    <div
      v-motion="{
        initial: { opacity: 0 },
        enter: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
        leave: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
      }"
      class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
      @click="handleClose"
    ></div>

    <!-- Modal Container -->
    <div class="flex items-center justify-center min-h-screen p-4">
      <div
        v-motion="{
          initial: { opacity: 0, y: 20, scale: 0.98 },
          enter: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
          },
          leave: {
            opacity: 0,
            y: 20,
            scale: 0.98,
            transition: { duration: 0.2, ease: [0.36, 0.66, 0.04, 1] },
          },
        }"
        class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-renewal-modal-title"
        @click.stop
      >
        <!-- Modal Header -->
        <div
          class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between"
        >
          <div class="flex items-center space-x-3">
            <FontAwesomeIcon :icon="['fas', 'credit-card']" class="h-5 w-5 text-purple-500" />
            <h2
              id="subscription-renewal-modal-title"
              class="text-xl font-bold text-gray-800 dark:text-white"
            >
              Renovar Suscripción
            </h2>
          </div>
          <button
            class="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            aria-label="Cerrar modal"
            @click="handleClose"
          >
            <FontAwesomeIcon :icon="['fas', 'times']" class="h-5 w-5" />
          </button>
        </div>

        <!-- Stepper Indicator -->
        <div
          class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30"
        >
          <div class="flex items-center justify-between max-w-2xl mx-auto">
            <!-- Step 1 -->
            <div class="flex items-center flex-1">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300"
                :class="
                  currentStep >= 1
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                "
              >
                <span v-if="currentStep > 1" class="text-white">
                  <FontAwesomeIcon :icon="['fas', 'check']" class="h-4 w-4" />
                </span>
                <span v-else>1</span>
              </div>
              <span
                class="ml-3 text-sm font-medium hidden sm:block"
                :class="
                  currentStep >= 1
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 dark:text-gray-400'
                "
              >
                Plan
              </span>
            </div>

            <!-- Connector Line 1 -->
            <div
              class="flex-1 h-0.5 mx-4 transition-all duration-300"
              :class="currentStep >= 2 ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'"
            ></div>

            <!-- Step 2 -->
            <div class="flex items-center flex-1">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300"
                :class="
                  currentStep >= 2
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                "
              >
                <span v-if="currentStep > 2" class="text-white">
                  <FontAwesomeIcon :icon="['fas', 'check']" class="h-4 w-4" />
                </span>
                <span v-else>2</span>
              </div>
              <span
                class="ml-3 text-sm font-medium hidden sm:block"
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
              class="flex-1 h-0.5 mx-4 transition-all duration-300"
              :class="currentStep >= 3 ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'"
            ></div>

            <!-- Step 3 -->
            <div class="flex items-center flex-1">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300"
                :class="
                  currentStep >= 3
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                "
              >
                3
              </div>
              <span
                class="ml-3 text-sm font-medium hidden sm:block"
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

        <!-- Modal Content -->
        <div class="overflow-y-auto max-h-[calc(100vh-16rem)]">
          <div class="p-6">
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
            />
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 justify-between"
        >
          <button
            v-if="currentStep > 1"
            class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium flex items-center justify-center"
            @click="previousStep"
          >
            <FontAwesomeIcon :icon="['fas', 'arrow-left']" class="h-4 w-4 mr-2" />
            Anterior
          </button>
          <div v-else></div>

          <div class="flex gap-3">
            <button
              class="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              @click="handleClose"
            >
              Cancelar
            </button>
            <button
              v-if="currentStep < 3"
              :disabled="!canProceedToNextStep"
              :class="[
                'px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center',
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
                'px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center',
                canProceedToNextStep
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed',
              ]"
              @click="handlePayment"
            >
              <FontAwesomeIcon :icon="['fas', 'credit-card']" class="h-4 w-4 mr-2" />
              Pagar {{ selectedPlan ? `$${selectedPlan.price.toFixed(2)}` : '' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
