import { useTheme } from '@/modules/shared/composables/useTheme';
import { computed, ref } from 'vue';

export default {
  name: 'ReportsCheckout',
  components: {
    // ComponentName
  },
  setup() {
    const { isDark } = useTheme();
    const searchQuery = ref('');
    const transactionTypeFilter = ref('all');
    const paymentMethodFilter = ref('all');
    const initialAmount = ref(1000.0);
    const finalAmount = ref(1500.0);
    const totalTransactions = ref(25);
    const transactions = ref([
      // Ejemplo de datos de transacciones
      {
        id: 1,
        type: 'sale',
        amount: 100.0,
        paymentMethod: 'cash',
        customer: 'Cliente 1',
        date: '2023-10-01',
        status: 'completed',
        showDetails: false,
      },
      {
        id: 2,
        type: 'refund',
        amount: -50.0,
        paymentMethod: 'card',
        customer: 'Cliente 2',
        date: '2023-10-02',
        status: 'completed',
        showDetails: false,
      },
      // Más transacciones...
    ]);
    const isLoading = ref(false);
    const itemsPerPage = ref(10);
    const currentPage = ref(1);

    // Computed properties
    const filteredTransactions = computed(() => {
      return transactions.value.filter((transaction) => {
        const matchesSearch =
          transaction.id.toString().includes(searchQuery.value) ||
          transaction.customer.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesType =
          transactionTypeFilter.value === 'all' || transaction.type === transactionTypeFilter.value;
        const matchesPaymentMethod =
          paymentMethodFilter.value === 'all' ||
          transaction.paymentMethod === paymentMethodFilter.value;
        return matchesSearch && matchesType && matchesPaymentMethod;
      });
    });

    const paginatedTransactions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredTransactions.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredTransactions.value.length / itemsPerPage.value);
    });

    // Métodos
    const toggleDetails = (id) => {
      const transaction = transactions.value.find((t) => t.id === id);
      if (transaction) {
        transaction.showDetails = !transaction.showDetails;
      }
    };

    const openCashRegister = () => {
      alert('Caja abierta');
    };

    const closeCashRegister = () => {
      alert('Caja cerrada');
    };

    const generateReport = () => {
      alert('Reporte generado');
    };

    const resetFilters = () => {
      searchQuery.value = '';
      transactionTypeFilter.value = 'all';
      paymentMethodFilter.value = 'all';
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const isRecentTransaction = (date) => {
      const transactionDate = new Date(date);
      const today = new Date();
      return transactionDate.toDateString() === today.toDateString();
    };

    const getTransactionStatusClass = (status) => {
      switch (status) {
        case 'completed':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'cancelled':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString();
    };

    return {
      isDark,
      searchQuery,
      transactionTypeFilter,
      paymentMethodFilter,
      initialAmount,
      finalAmount,
      totalTransactions,
      transactions,
      isLoading,
      itemsPerPage,
      currentPage,
      filteredTransactions,
      paginatedTransactions,
      totalPages,
      toggleDetails,
      openCashRegister,
      closeCashRegister,
      generateReport,
      resetFilters,
      prevPage,
      nextPage,
      isRecentTransaction,
      getTransactionStatusClass,
      formatDate,
    };
  },
};
