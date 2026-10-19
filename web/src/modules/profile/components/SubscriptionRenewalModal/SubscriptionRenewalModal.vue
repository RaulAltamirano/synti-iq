<script setup lang="ts">
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Stepper, useToast, type StepperStep } from '@/modules/ui';
import {
  useSubscriptionWizard,
  type SubscriptionPlan,
} from '../../composables/useSubscriptionWizard';
import PlanSelectionStep from './PlanSelectionStep.vue';
import PaymentStep from './PaymentStep.vue';
import SubscriptionCheckoutActions from './SubscriptionCheckoutActions.vue';

interface Props {
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const toast = useToast();

const wizardSteps: StepperStep[] = [
  { id: 1, title: 'Seleccionar plan', shortTitle: 'Plan', icon: 'boxes' },
  { id: 2, title: 'Confirmar y pagar', shortTitle: 'Pago', icon: 'credit-card' },
];

const { currentStep, selectedPlan, canProceedToNextStep, nextStep, previousStep, closeModal } =
  useSubscriptionWizard();

const primaryLabel = computed(() => {
  if (!selectedPlan.value) return 'Continuar a Stripe';
  return `Continuar a Stripe · $${selectedPlan.value.price.toFixed(2)}`;
});

const updateSelectedPlan = (plan: SubscriptionPlan | null) => {
  selectedPlan.value = plan;
};

const handleClose = () => {
  closeModal();
  emit('close');
};

const handlePayment = () => {
  toast.info(`Stripe Checkout se conectará pronto (plan: ${selectedPlan.value?.name ?? '—'}).`);
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm"
      aria-hidden="true"
      @click="handleClose"
    />

    <div class="flex min-h-screen items-center justify-center p-4">
      <div
        class="relative mx-4 w-full max-w-4xl overflow-hidden rounded-xl border border-gray-200 bg-[var(--color-bg-default,#fff)] shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-renewal-modal-title"
        @click.stop
      >
        <div
          class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700"
        >
          <h2
            id="subscription-renewal-modal-title"
            class="text-xl font-bold text-gray-800 dark:text-white"
          >
            Renovar suscripción
          </h2>
          <button
            type="button"
            class="min-h-11 min-w-11 rounded-full p-2 text-gray-500 transition-colors hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Cerrar modal"
            @click="handleClose"
          >
            <FontAwesomeIcon :icon="['fas', 'times']" class="h-5 w-5" />
          </button>
        </div>

        <div class="px-6 pt-2">
          <Stepper v-model="currentStep" :steps="wizardSteps" />
        </div>

        <div class="max-h-[calc(100vh-14rem)] overflow-y-auto px-6 py-4">
          <PlanSelectionStep
            v-if="currentStep === 1"
            :selected-plan="selectedPlan"
            @update:selected-plan="updateSelectedPlan"
          />
          <PaymentStep
            v-else-if="currentStep === 2"
            :selected-plan="selectedPlan"
            :is-renewal="true"
          />

          <SubscriptionCheckoutActions
            class="pb-2"
            :current-step="currentStep"
            :total-steps="2"
            :can-proceed="canProceedToNextStep"
            :primary-label="primaryLabel"
            @back="previousStep"
            @cancel="handleClose"
            @next="nextStep"
            @primary="handlePayment"
          />
        </div>
      </div>
    </div>
  </div>
</template>
