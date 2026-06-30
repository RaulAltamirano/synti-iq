import { ref, computed, watch, readonly } from 'vue';
import { useToast } from '@/modules/ui/components';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string[];
}

export default {
  name: 'App',
  components: {
    // ComponentName
  },
  setup() {
    // --- State ---
    const modalOpen = ref(true);
    const currentStep = ref(1);
    const toast = useToast();

    const selectedCarrier = ref<string | null>(null);
    const phoneNumber = ref('');
    const saveContact = ref(false);
    const selectedAmount = ref<number | null>(null);
    const customAmount = ref('');
    const selectedPaymentMethod = ref<string | null>(null);
    const transactionId = ref('');

    // --- Static options ---
    const quickAmounts = readonly([20, 50, 100, 150, 200, 300]);
    const carriers = readonly([
      { id: 'telcel', name: 'Telcel' },
      { id: 'movistar', name: 'Movistar' },
      { id: 'att', name: 'AT&T' },
      { id: 'unefon', name: 'Unefon' },
      { id: 'bait', name: 'BAI' },
      { id: 'virgin', name: 'Virgin Mobile' },
    ]);

    const paymentMethods = readonly<PaymentMethod[]>([
      {
        id: 'credit_card',
        name: 'Tarjeta de crédito/débito',
        description: 'Pago con tarjeta Visa, Mastercard o Amex',
        icon: ['fas', 'credit-card'],
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Paga con tu cuenta PayPal',
        icon: ['fab', 'paypal'],
      },
      {
        id: 'spei',
        name: 'Transferencia SPEI',
        description: 'Pago por transferencia bancaria',
        icon: ['fas', 'building-columns'],
      },
      {
        id: 'oxxo',
        name: 'Pago en OXXO',
        description: 'Paga en efectivo en cualquier OXXO',
        icon: ['fas', 'store'],
      },
    ]);

    // --- Computed ---
    const selectedCarrierName = computed(
      () => carriers.find((c) => c.id === selectedCarrier.value)?.name ?? ''
    );

    const formattedPhoneNumber = computed(() => {
      const digits = phoneNumber.value;
      return digits.length === 10
        ? `+52 ${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
        : '';
    });

    const canProceed = computed(() => {
      const step = currentStep.value;
      if (step === 1) return selectedCarrier.value !== null;
      if (step === 2) return /^\d{10}$/.test(phoneNumber.value);
      if (step === 3) return selectedAmount.value !== null && selectedAmount.value >= 10;
      if (step === 4) return selectedPaymentMethod.value !== null;
      return false;
    });

    // --- Watchers ---
    watch(customAmount, () => {
      const amount = parseInt(customAmount.value);
      selectedAmount.value = !isNaN(amount) && amount >= 10 ? amount : null;
    });

    // --- Methods ---
    const openModal = () => {
      modalOpen.value = true;
      resetForm();
    };

    const closeModal = () => {
      modalOpen.value = false;
      setTimeout(() => (currentStep.value = 1), 300);
    };

    const resetForm = () => {
      selectedCarrier.value = null;
      phoneNumber.value = '';
      saveContact.value = false;
      selectedAmount.value = null;
      customAmount.value = '';
      selectedPaymentMethod.value = null;
      transactionId.value = '';
      currentStep.value = 1;
    };

    const selectCarrier = (carrierId: string) => {
      selectedCarrier.value = carrierId;
    };

    const formatPhoneNumber = () => {
      phoneNumber.value = phoneNumber.value.replace(/\D/g, '').slice(0, 10);
    };

    const selectAmount = (amount: number) => {
      selectedAmount.value = amount;
      customAmount.value = '';
    };

    const selectPaymentMethod = (methodId: string) => {
      selectedPaymentMethod.value = methodId;
    };

    const nextStep = () => {
      if (canProceed.value) currentStep.value++;
    };

    const prevStep = () => {
      currentStep.value = Math.max(1, currentStep.value - 1);
    };

    const confirmRecharge = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        transactionId.value = `TXN-${Math.floor(Math.random() * 1_000_000)
          .toString()
          .padStart(6, '0')}`;
        currentStep.value = 5;
        toast.success(`Recarga de $${selectedAmount.value} aplicada correctamente`);

        if (saveContact.value) saveToHistory();
      } catch {
        toast.error('Error al procesar la recarga');
      }
    };

    const saveToHistory = () => {
      const history = JSON.parse(localStorage.getItem('rechargeHistory') || '[]');
      history.push({
        carrier: selectedCarrier.value,
        phoneNumber: phoneNumber.value,
        amount: selectedAmount.value,
        date: new Date().toISOString(),
        transactionId: transactionId.value,
      });
      localStorage.setItem('rechargeHistory', JSON.stringify(history));
    };

    return {
      // State
      modalOpen,
      currentStep,
      selectedCarrier,
      phoneNumber,
      saveContact,
      quickAmounts,
      selectedAmount,
      customAmount,
      selectedPaymentMethod,
      transactionId,
      carriers,
      paymentMethods,

      // Computed
      selectedCarrierName,
      formattedPhoneNumber,
      canProceed,

      // Methods
      openModal,
      closeModal,
      selectCarrier,
      formatPhoneNumber,
      selectAmount,
      selectPaymentMethod,
      nextStep,
      prevStep,
      confirmRecharge,
    };
  },
};
