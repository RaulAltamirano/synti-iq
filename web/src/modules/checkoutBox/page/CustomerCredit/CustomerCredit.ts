import { useTheme } from '@/modules/shared/composables/useTheme';
import { computed, ref } from 'vue';

export default {
  name: 'CustomerCredit',
  components: {
    // ComponentName
  },
  setup() {
    const { isDark } = useTheme();
    const searchQuery = ref('');
    const statusFilter = ref('all');
    const isLoading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    const credits = ref([
      // Ejemplo de datos de créditos
      {
        id: 1,
        customer: 'Cliente A',
        amount: 1000.0,
        dueDate: '2023-12-31',
        status: 'active',
        items: [
          { id: 1, description: 'Producto 1', amount: 500.0, status: 'pending' },
          { id: 2, description: 'Producto 2', amount: 500.0, status: 'pending' },
        ],
        showDetails: false,
      },
      // Más créditos...
    ]);

    const filteredCredits = computed(() => {
      return credits.value.filter((credit) => {
        const matchesSearch = credit.customer
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase());
        const matchesStatus = statusFilter.value === 'all' || credit.status === statusFilter.value;
        return matchesSearch && matchesStatus;
      });
    });

    const totalCredits = computed(() => {
      return filteredCredits.value.reduce((sum, credit) => sum + credit.amount, 0);
    });

    const activeCredits = computed(() => {
      return filteredCredits.value.filter((credit) => credit.status === 'active');
    });

    const overdueCredits = computed(() => {
      return filteredCredits.value.filter((credit) => isOverdue(credit.dueDate));
    });

    const totalOverdueCredits = computed(() => {
      return overdueCredits.value.reduce((sum, credit) => sum + credit.amount, 0);
    });

    const averageActiveCredit = computed(() => {
      return activeCredits.value.length > 0 ? totalCredits.value / activeCredits.value.length : 0;
    });

    const creditsTrend = computed(() => {
      // Lógica para calcular la tendencia de créditos
      return 0;
    });

    const paginatedCredits = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredCredits.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredCredits.value.length / itemsPerPage.value);
    });

    const toggleDetails = (id) => {
      const credit = credits.value.find((credit) => credit.id === id);
      if (credit) {
        credit.showDetails = !credit.showDetails;
      }
    };

    const viewDetails = (_id: unknown) => {
      // Lógica para ver detalles del crédito
    };

    const sendReminder = (_id: unknown) => {
      // Lógica para enviar recordatorio
    };

    const markAsPaid = (_id: unknown) => {
      // Lógica para marcar como pagado
    };

    const extendDueDate = (_id: unknown) => {
      // Lógica para extender la fecha de vencimiento
    };

    const resetFilters = () => {
      searchQuery.value = '';
      statusFilter.value = 'all';
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

    const isOverdue = (dueDate) => {
      const today = new Date();
      const due = new Date(dueDate);
      return due < today;
    };

    const getCreditStatusClass = (status) => {
      switch (status) {
        case 'active':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'paid':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'overdue':
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
      statusFilter,
      isLoading,
      currentPage,
      itemsPerPage,
      credits,
      filteredCredits,
      totalCredits,
      activeCredits,
      overdueCredits,
      totalOverdueCredits,
      averageActiveCredit,
      creditsTrend,
      paginatedCredits,
      totalPages,
      toggleDetails,
      viewDetails,
      sendReminder,
      markAsPaid,
      extendDueDate,
      resetFilters,
      prevPage,
      nextPage,
      isOverdue,
      getCreditStatusClass,
      formatDate,
    };
  },
};
