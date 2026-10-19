import { ref, computed } from 'vue';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

const MAX_STEP = 2;

export function useSubscriptionWizard() {
  const currentStep = ref<number>(1);
  const selectedPlan = ref<SubscriptionPlan | null>(null);
  const isModalOpen = ref<boolean>(false);

  const isStep1Valid = computed(() => selectedPlan.value !== null);
  const isStep2Valid = computed(() => true);

  const canProceedToNextStep = computed(() => {
    switch (currentStep.value) {
      case 1:
        return isStep1Valid.value;
      case 2:
        return isStep2Valid.value;
      default:
        return false;
    }
  });

  const nextStep = () => {
    if (canProceedToNextStep.value && currentStep.value < MAX_STEP) {
      currentStep.value++;
    }
  };

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= MAX_STEP) {
      currentStep.value = step;
    }
  };

  const resetWizard = () => {
    currentStep.value = 1;
    selectedPlan.value = null;
  };

  const openModal = () => {
    isModalOpen.value = true;
    resetWizard();
  };

  const closeModal = () => {
    isModalOpen.value = false;
    resetWizard();
  };

  return {
    currentStep,
    selectedPlan,
    isModalOpen,
    isStep1Valid,
    isStep2Valid,
    canProceedToNextStep,
    nextStep,
    previousStep,
    goToStep,
    resetWizard,
    openModal,
    closeModal,
  };
}
