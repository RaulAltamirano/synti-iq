import { useTheme } from '@/modules/shared/composables/useTheme';
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'CashRegister',
  components: {
    // ComponentName
  },
  setup() {
    const { isDark } = useTheme();
    const transactions = ref([
      {
        id: 1,
        type: 'income',
        amount: 1000,
        description: 'Venta de productos',
        date: '2023-10-01',
        showDetails: false,
      },
      {
        id: 2,
        type: 'expense',
        amount: 200,
        description: 'Compra de materiales',
        date: '2023-10-02',
        showDetails: false,
      },
      {
        id: 3,
        type: 'income',
        amount: 500,
        description: 'Pago de cliente',
        date: '2023-10-03',
        showDetails: false,
      },
    ]);

    const searchQuery = ref('');
    const typeFilter = ref('all');
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const isLoading = ref(false);

    // Nueva transacción
    const newTransaction = ref({
      type: 'income',
      amount: 0,
      description: '',
    });

    // Filtrado de transacciones
    const filteredTransactions = computed(() => {
      return transactions.value.filter((transaction) => {
        const matchesSearch = transaction.description
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase());
        const matchesType = typeFilter.value === 'all' || transaction.type === typeFilter.value;
        return matchesSearch && matchesType;
      });
    });

    // Cálculos de totales
    const totalIncome = computed(() => {
      return filteredTransactions.value
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    });

    const totalExpense = computed(() => {
      return filteredTransactions.value
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    });

    // Paginación
    const paginatedTransactions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredTransactions.value.slice(start, end);
    });

    const totalPages = computed(() =>
      Math.ceil(filteredTransactions.value.length / itemsPerPage.value)
    );

    // Funciones auxiliares
    const isRecentTransaction = (date) => {
      const transactionDate = new Date(date);
      const today = new Date();
      return (today - transactionDate) / (1000 * 60 * 60 * 24) <= 7;
    };

    const getTransactionTypeClass = (type) => {
      return type === 'income'
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    };

    const toggleDetails = (id) => {
      const transaction = transactions.value.find((t) => t.id === id);
      if (transaction) {
        transaction.showDetails = !transaction.showDetails;
      }
    };

    const resetFilters = () => {
      searchQuery.value = '';
      typeFilter.value = 'all';
    };

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString();
    };

    const addTransaction = () => {
      const transaction = {
        id: transactions.value.length + 1,
        type: newTransaction.value.type,
        amount: newTransaction.value.amount,
        description: newTransaction.value.description,
        date: new Date().toISOString().split('T')[0],
        showDetails: false,
      };
      transactions.value.push(transaction);
      newTransaction.value = { type: 'income', amount: 0, description: '' }; // Resetear formulario
    };

    const editTransaction = () => {};

    const deleteTransaction = (id) => {
      transactions.value = transactions.value.filter((t) => t.id !== id);
    };

    const printReceipt = () => {};

    const duplicateTransaction = (transaction) => {
      const newTransaction = {
        ...transaction,
        id: transactions.value.length + 1,
        showDetails: false,
      };
      transactions.value.push(newTransaction);
    };

    // Simular carga inicial
    onMounted(() => {
      isLoading.value = true;
      setTimeout(() => {
        isLoading.value = false;
      }, 1000);
    });

    return {
      searchQuery,
      typeFilter,
      currentPage,
      itemsPerPage,
      isLoading,
      isDark,
      transactions,
      filteredTransactions,
      totalIncome,
      totalExpense,
      paginatedTransactions,
      totalPages,
      newTransaction,
      isRecentTransaction,
      getTransactionTypeClass,
      toggleDetails,
      resetFilters,
      prevPage,
      nextPage,
      formatDate,
      addTransaction,
      editTransaction,
      deleteTransaction,
      printReceipt,
      duplicateTransaction,
    };
  },
};
