import { ref, computed } from 'vue';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

export interface AddressData {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export function useSubscriptionWizard() {
  const currentStep = ref<number>(1);
  const selectedPlan = ref<SubscriptionPlan | null>(null);
  const addressData = ref<AddressData>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'México',
  });
  const isModalOpen = ref<boolean>(false);

  // Validaciones
  const isStep1Valid = computed(() => selectedPlan.value !== null);

  const isStep2Valid = computed(() => {
    return (
      addressData.value.street.trim() !== '' &&
      addressData.value.number.trim() !== '' &&
      addressData.value.neighborhood.trim() !== '' &&
      addressData.value.city.trim() !== '' &&
      addressData.value.state.trim() !== '' &&
      addressData.value.postalCode.trim() !== '' &&
      /^\d{5}$/.test(addressData.value.postalCode) &&
      addressData.value.country.trim() !== ''
    );
  });

  const isStep3Valid = computed(() => {
    // Por ahora siempre válido, la validación de Stripe se hará después
    return true;
  });

  const canProceedToNextStep = computed(() => {
    switch (currentStep.value) {
      case 1:
        return isStep1Valid.value;
      case 2:
        return isStep2Valid.value;
      case 3:
        return isStep3Valid.value;
      default:
        return false;
    }
  });

  // Navegación
  const nextStep = () => {
    if (canProceedToNextStep.value && currentStep.value < 3) {
      currentStep.value++;
    }
  };

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 3) {
      currentStep.value = step;
    }
  };

  const resetWizard = () => {
    currentStep.value = 1;
    selectedPlan.value = null;
    addressData.value = {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'México',
    };
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
    // State
    currentStep,
    selectedPlan,
    addressData,
    isModalOpen,

    // Computed
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    canProceedToNextStep,

    // Methods
    nextStep,
    previousStep,
    goToStep,
    resetWizard,
    openModal,
    closeModal,
  };
}
