import { useTheme } from '@/modules/shared/composables/useTheme';
import { ref, onMounted, computed } from 'vue';

export default {
  name: 'ReturnsView',
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
    const returns = ref<unknown>([]);

    const filteredReturns = computed(() => {
      let filtered = returns.value;

      if (searchQuery.value) {
        filtered = filtered.filter(
          (returnItem: { id: { toString: () => string | string[] }; customer: string }) =>
            returnItem.id.toString().includes(searchQuery.value) ||
            returnItem.customer.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }

      if (statusFilter.value !== 'all') {
        filtered = filtered.filter(
          (returnItem: { status: string }) => returnItem.status === statusFilter.value
        );
      }

      return filtered;
    });

    const totalReturns = computed(() => {
      return filteredReturns.value.reduce(
        (total: unknown, returnItem: { total: unknown }) => total + returnItem.total,
        0
      );
    });

    const averageReturn = computed(() => {
      return filteredReturns.value.length > 0
        ? totalReturns.value / filteredReturns.value.length
        : 0;
    });

    const topReturnedProduct = computed(() => {
      const productCounts = {};

      // Recorrer todas las devoluciones filtradas
      filteredReturns.value.forEach((returnItem) => {
        returnItem.items.forEach((item) => {
          if (productCounts[item.name]) {
            productCounts[item.name] += item.quantity;
          } else {
            productCounts[item.name] = item.quantity;
          }
        });
      });

      // Obtener las claves (nombres de productos) del objeto productCounts
      const productNames = Object.keys(productCounts);

      // Verificar si hay productos antes de usar reduce
      if (productNames.length === 0) {
        return { name: 'No hay productos devueltos', count: 0 };
      }

      // Encontrar el producto más devuelto
      const topProduct = productNames.reduce((a, b) =>
        productCounts[a] > productCounts[b] ? a : b
      );

      return { name: topProduct, count: productCounts[topProduct] };
    });

    const paginatedReturns = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredReturns.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredReturns.value.length / itemsPerPage.value);
    });

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

    const resetFilters = () => {
      searchQuery.value = '';
      statusFilter.value = 'all';
    };

    const toggleDetails = (id: unknown) => {
      const returnItem = returns.value.find((returnItem: { id: unknown }) => returnItem.id === id);
      if (returnItem) {
        returnItem.showDetails = !returnItem.showDetails;
      }
    };

    const getReturnStatusClass = (status: unknown) => {
      switch (status) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'approved':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'rejected':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      }
    };

    const isRecentReturn = (date: string | number | Date) => {
      const returnDate = new Date(date);
      const now = new Date();
      const diffTime = Math.abs(now - returnDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    };

    const formatDate = (date: string | number | Date) => {
      return new Date(date).toLocaleDateString();
    };

    const calculateSubtotal = (items: unknown[]) => {
      return items.reduce(
        (total: number, item: { quantity: number; price: number }) =>
          total + item.quantity * item.price,
        0
      );
    };

    const calculateTaxes = (items: unknown) => {
      return calculateSubtotal(items) * 0.16;
    };

    const downloadReturnSlip = () => {};

    const sendEmailReturnSlip = () => {};

    const printReturnSlip = () => {};

    const approveReturn = (returnItem: { status: string; id: unknown }) => {
      returnItem.status = 'approved';
    };

    const rejectReturn = (returnItem: { status: string; id: unknown }) => {
      returnItem.status = 'rejected';
    };

    onMounted(async () => {
      isLoading.value = true;
      // Simular una carga de datos
      setTimeout(() => {
        returns.value = [
          {
            id: 1,
            customer: 'Juan Pérez',
            date: '2023-10-01',
            total: 150.0,
            status: 'pending',
            items: [
              { id: 1, name: 'Producto A', quantity: 2, price: 50.0 },
              { id: 2, name: 'Producto B', quantity: 1, price: 50.0 },
            ],
            showDetails: false,
          },
          {
            id: 2,
            customer: 'Ana Gómez',
            date: '2023-10-05',
            total: 200.0,
            status: 'approved',
            items: [{ id: 3, name: 'Producto C', quantity: 4, price: 50.0 }],
            showDetails: false,
          },
        ];
        isLoading.value = false;
      }, 1000);
    });

    return {
      isDark,
      searchQuery,
      statusFilter,
      isLoading,
      currentPage,
      itemsPerPage,
      returns,
      filteredReturns,
      totalReturns,
      averageReturn,
      paginatedReturns,
      totalPages,
      prevPage,
      nextPage,
      resetFilters,
      toggleDetails,
      getReturnStatusClass,
      isRecentReturn,
      formatDate,
      calculateSubtotal,
      calculateTaxes,
      downloadReturnSlip,
      sendEmailReturnSlip,
      printReturnSlip,
      topReturnedProduct,
      approveReturn,
      rejectReturn,
    };
  },
};
