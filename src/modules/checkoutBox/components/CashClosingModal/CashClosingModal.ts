import { ref, computed } from 'vue';

import { ModalName, useModalStore } from '@/modules/shared/store/useModalStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import router from '@/router';

export default {
  name: 'CashClosingModal',
  components: {
    FontAwesomeIcon,
  },
  props: {
    // Prop para recibir datos del turno actual
    shiftData: {
      type: Object,
      required: true,
    },
    // Prop para recibir datos del usuario actual
    userData: {
      type: Object,
      required: true,
    },
  },
  setup(props: { shiftData: any; userData: any }, { emit }: any) {
    const isProcessing = ref(false);
    const closingNotes = ref('');
    const showExpenseForm = ref(false);
    const modalStore = useModalStore();
    const showWithdrawalForm = ref(false);

    const modalOpen = computed(() => modalStore.isOpen(ModalName.CLOSE_CASH_DRAWER));

    // Datos del nuevo gasto
    const newExpense = ref({
      description: '',
      amount: 0,
    });

    // Datos del nuevo retiro
    const newWithdrawal = ref({
      description: '',
      amount: 0,
    });

    // Denominaciones de efectivo
    const cashDenominations = ref([
      { value: 1000, count: 0 },
      { value: 500, count: 0 },
      { value: 200, count: 0 },
      { value: 100, count: 0 },
      { value: 50, count: 0 },
      { value: 20, count: 0 },
      { value: 10, count: 0 },
      { value: 5, count: 0 },
      { value: 2, count: 0 },
      { value: 1, count: 0 },
      { value: 0.5, count: 0 },
    ]);

    // Copia local de los datos del turno para modificaciones
    const currentShift = ref(props.shiftData);
    const currentUser = ref(props.userData);

    // Resumen de métodos de pago
    const paymentMethodsSummary = computed(() => [
      {
        name: 'Efectivo',
        icon: ['fas', 'money-bill-wave'],
        amount: currentShift.value.cashAmount,
        transactions: currentShift.value.cashTransactions,
        color: 'text-green-500 dark:text-green-400',
      },
      {
        name: 'Tarjeta',
        icon: ['far', 'credit-card'],
        amount: currentShift.value.cardAmount,
        transactions: currentShift.value.cardTransactions,
        color: 'text-blue-500 dark:text-blue-400',
      },
      {
        name: 'Transferencia',
        icon: ['far', 'building-columns'],
        amount: currentShift.value.transferAmount,
        transactions: currentShift.value.transferTransactions,
        color: 'text-purple-500 dark:text-purple-400',
      },
      {
        name: 'Crédito',
        icon: ['far', 'user'],
        amount: currentShift.value.creditAmount,
        transactions: currentShift.value.creditTransactions,
        color: 'text-orange-500 dark:text-orange-400',
      },
    ]);

    // Totales calculados
    const totalExpenses = computed(() => {
      return currentShift.value.expenses.reduce(
        (sum: any, expense: { amount: any }) => sum + expense.amount,
        0
      );
    });

    const totalWithdrawals = computed(() => {
      return currentShift.value.withdrawals.reduce(
        (sum: any, withdrawal: { amount: any }) => sum + withdrawal.amount,
        0
      );
    });

    const totalCountedCash = computed(() => {
      return cashDenominations.value.reduce((sum, denom) => sum + denom.value * denom.count, 0);
    });

    const cashDifference = computed(() => {
      return (
        totalCountedCash.value - (currentShift.value.initialCash + currentShift.value.cashAmount)
      );
    });

    const initializeCashCount = () => {
      // Esto es un ejemplo - en una aplicación real, podrías tener valores iniciales sugeridos
      // basados en el efectivo esperado o en conteos previos
      cashDenominations.value.forEach((denom) => {
        denom.count = 0;
      });
    };

    const incrementDenomination = (value: number) => {
      const denom = cashDenominations.value.find((d) => d.value === value);
      if (denom) denom.count++;
    };

    const decrementDenomination = (value: number) => {
      const denom = cashDenominations.value.find((d) => d.value === value);
      if (denom && denom.count > 0) denom.count--;
    };

    const addExpense = () => {
      if (newExpense.value.description && newExpense.value.amount > 0) {
        currentShift.value.expenses.push({
          description: newExpense.value.description,
          amount: parseFloat(newExpense.value.amount),
        });

        // Reset form
        newExpense.value = { description: '', amount: 0 };
        showExpenseForm.value = false;
      }
    };

    const removeExpense = (index: any) => {
      currentShift.value.expenses.splice(index, 1);
    };

    const addWithdrawal = () => {
      if (newWithdrawal.value.description && newWithdrawal.value.amount > 0) {
        currentShift.value.withdrawals.push({
          description: newWithdrawal.value.description,
          amount: parseFloat(newWithdrawal.value.amount),
        });

        // Reset form
        newWithdrawal.value = { description: '', amount: 0 };
        showWithdrawalForm.value = false;
      }
    };

    const removeWithdrawal = (index: any) => {
      currentShift.value.withdrawals.splice(index, 1);
    };

    const confirmCashClosing = async () => {
      isProcessing.value = true;

      try {
        // Preparar datos para enviar
        const closingData = {
          shiftId: currentShift.value.id,
          cashCount: cashDenominations.value,
          totalCounted: totalCountedCash.value,
          difference: cashDifference.value,
          expenses: currentShift.value.expenses,
          withdrawals: currentShift.value.withdrawals,
          notes: closingNotes.value,
          closedAt: new Date().toISOString(),
        };

        // Emitir evento para que el componente padre maneje el cierre
        emit('confirm-closing', closingData);

        // Simular una llamada a la API (en una app real, sería una llamada real)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Actualizar estado local
        currentShift.value.status = 'closed';
        currentShift.value.closeTime = new Date().toISOString();

        // Cerrar el modal después de un breve retraso
        setTimeout(() => {
          // isOpen.value = false;
          closeModal();
          isProcessing.value = false;
        }, 500);
        router.push({ name: 'Home' });
      } catch {
        isProcessing.value = false;
      }
    };

    // Funciones de formato
    const formatCurrency = (value: any) => {
      return parseFloat(value || 0).toFixed(2);
    };

    const formatDateTime = (dateString: string | number | Date) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleString();
    };

    const calculateShiftDuration = () => {
      if (!currentShift.value.openTime) return 'N/A';

      const start = new Date(currentShift.value.openTime);
      const end = currentShift.value.closeTime
        ? new Date(currentShift.value.closeTime)
        : new Date();

      const diff = end - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return `${hours}h ${minutes}m`;
    };

    const calculatePercentage = (part: number, total: number) => {
      if (total <= 0) return 0;
      return ((part / total) * 100).toFixed(1);
    };

    const closeModal = () => {
      modalStore.close(ModalName.CLOSE_CASH_DRAWER);
    };

    return {
      isProcessing,
      currentShift,
      currentUser,
      paymentMethodsSummary,
      cashDenominations,
      closeModal,
      totalExpenses,
      totalWithdrawals,
      totalCountedCash,
      cashDifference,
      closingNotes,
      showExpenseForm,
      showWithdrawalForm,
      newExpense,
      newWithdrawal,
      modalOpen,
      incrementDenomination,
      decrementDenomination,
      addExpense,
      removeExpense,
      addWithdrawal,
      removeWithdrawal,
      confirmCashClosing,
      formatCurrency,
      formatDateTime,
      calculateShiftDuration,
      calculatePercentage,
    };
  },
};
