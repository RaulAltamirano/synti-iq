<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMotion } from '@vueuse/motion';
import TitleCard from '@/modules/shared/components/TitleCard/TitleCard.vue';
import { useTheme } from '@/modules/shared/composables/useTheme';
import { Stepper, useToast, type StepperStep } from '@/modules/ui';
import {
  useSubscriptionWizard,
  type SubscriptionPlan,
} from '../../composables/useSubscriptionWizard';
import PlanSelectionStep from '../../components/SubscriptionRenewalModal/PlanSelectionStep.vue';
import PaymentStep from '../../components/SubscriptionRenewalModal/PaymentStep.vue';
import SubscriptionCheckoutActions from '../../components/SubscriptionRenewalModal/SubscriptionCheckoutActions.vue';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { isDark } = useTheme();

const pageRef = ref<HTMLElement | null>(null);
useMotion(pageRef, {
  initial: { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
});

const isRenewal = computed(() => {
  return route.path.includes('/renew') || route.query.type !== 'new';
});

const pageTitle = computed(() =>
  isRenewal.value ? 'Renovar suscripción' : 'Contratar suscripción'
);

const wizardSteps: StepperStep[] = [
  { id: 1, title: 'Seleccionar plan', shortTitle: 'Plan', icon: 'boxes' },
  { id: 2, title: 'Confirmar y pagar', shortTitle: 'Pago', icon: 'credit-card' },
];

const { currentStep, selectedPlan, canProceedToNextStep, nextStep, previousStep, resetWizard } =
  useSubscriptionWizard();

const primaryLabel = computed(() => {
  if (!selectedPlan.value) return 'Continuar a Stripe';
  return `Continuar a Stripe · $${selectedPlan.value.price.toFixed(2)}`;
});

const updateSelectedPlan = (plan: SubscriptionPlan | null) => {
  selectedPlan.value = plan;
};

const goBack = () => {
  resetWizard();
  router.push({ name: 'Profile' });
};

const handlePayment = () => {
  const actionType = isRenewal.value ? 'renovación' : 'contratación';
  toast.info(
    `Stripe Checkout se conectará pronto (${actionType}: ${selectedPlan.value?.name ?? '—'}).`
  );
};

onMounted(() => {
  if (currentStep.value === 1 && !selectedPlan.value) {
    resetWizard();
  }
});
</script>

<template>
  <div
    class="min-h-screen w-full px-4 py-8 transition-colors duration-300"
    :class="isDark ? 'text-white' : 'text-gray-800'"
  >
    <div ref="pageRef" class="mx-auto flex w-full max-w-4xl flex-col gap-6 sm:gap-8">
      <TitleCard :title="pageTitle" icon="credit-card" :actions="[]" />

      <Stepper v-model="currentStep" :steps="wizardSteps" :animated="true" />

      <div class="flex flex-col pb-6">
        <PlanSelectionStep
          v-if="currentStep === 1"
          :selected-plan="selectedPlan"
          @update:selected-plan="updateSelectedPlan"
        />
        <PaymentStep
          v-else-if="currentStep === 2"
          :selected-plan="selectedPlan"
          :is-renewal="isRenewal"
        />

        <SubscriptionCheckoutActions
          :current-step="currentStep"
          :total-steps="2"
          :can-proceed="canProceedToNextStep"
          :primary-label="primaryLabel"
          :is-dark="isDark"
          @back="previousStep"
          @cancel="goBack"
          @next="nextStep"
          @primary="handlePayment"
        />
      </div>
    </div>
  </div>
</template>
