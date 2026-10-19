import { useTheme } from '@/modules/shared/composables/useTheme';
import { ref, computed, onMounted, watch } from 'vue';

export default {
  name: 'SalesHistory',
  components: {
    // ComponentName
  },
  setup() {
    const { isDark } = useTheme();
    const searchQuery = ref('');
    const periodFilter = ref('all');
    const currentPage = ref(1);
    const itemsPerPage = ref(5);
    const isLoading = ref(false);
    const salesTrend = ref(7.5);

    // Datos simulados - En producción, estos se cargarían desde una API
    const sales = ref([
      {
        id: 'VTA-001',
        date: '2025-02-20T15:30:00',
        total: 156.45,
        customer: 'Juan Pérez',
        status: 'Completada',
        showDetails: false,
        items: [
          { id: 1, name: 'Camisa casual', quantity: 2, price: 45.99 },
          { id: 2, name: 'Pantalón de vestir', quantity: 1, price: 64.47 },
        ],
      },
      {
        id: 'VTA-002',
        date: '2025-02-19T10:15:00',
        total: 89.99,
        customer: 'Ana López',
        status: 'Completada',
        showDetails: false,
        items: [{ id: 3, name: 'Zapatillas deportivas', quantity: 1, price: 89.99 }],
      },
      {
        id: 'VTA-003',
        date: '2025-02-18T16:45:00',
        total: 235.5,
        customer: 'Carlos Gómez',
        status: 'Parcial',
        showDetails: false,
        items: [
          { id: 4, name: 'Chaqueta de cuero', quantity: 1, price: 199.5 },
          { id: 5, name: 'Bufanda', quantity: 1, price: 36.0 },
        ],
      },
      {
        id: 'VTA-004',
        date: '2025-02-17T11:20:00',
        total: 45.75,
        customer: 'María Rodríguez',
        status: 'Completada',
        showDetails: false,
        items: [{ id: 6, name: 'Libro - El código limpio', quantity: 1, price: 45.75 }],
      },
      {
        id: 'VTA-005',
        date: '2025-02-17T09:30:00',
        total: 321.88,
        customer: 'Roberto Sánchez',
        status: 'Cancelada',
        showDetails: false,
        items: [
          { id: 7, name: 'Monitor 24"', quantity: 1, price: 245.99 },
          { id: 8, name: 'Cable HDMI', quantity: 2, price: 37.95 },
        ],
      },
      {
        id: 'VTA-006',
        date: '2025-02-16T14:50:00',
        total: 76.25,
        customer: 'Elena Torres',
        status: 'Completada',
        showDetails: false,
        items: [{ id: 9, name: 'Mochila', quantity: 1, price: 76.25 }],
      },
      {
        id: 'VTA-007',
        date: '2025-02-15T17:10:00',
        total: 184.9,
        customer: 'David Martínez',
        status: 'Completada',
        showDetails: false,
        items: [
          { id: 10, name: 'Tenis running', quantity: 1, price: 124.9 },
          { id: 11, name: 'Calcetines deportivos', quantity: 2, price: 30.0 },
        ],
      },
    ]);

    // Filtrar ventas
    const filteredSales = computed(() => {
      let result = [...sales.value];

      // Filtrar por búsqueda
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (sale) =>
            sale.id.toLowerCase().includes(query) ||
            sale.customer.toLowerCase().includes(query) ||
            sale.items.some((item) => item.name.toLowerCase().includes(query))
        );
      }

      // Filtrar por período
      const now = new Date();
      if (periodFilter.value === 'today') {
        const today = new Date().setHours(0, 0, 0, 0);
        result = result.filter((sale) => new Date(sale.date) >= today);
      } else if (periodFilter.value === 'week') {
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).setHours(0, 0, 0, 0);
        result = result.filter((sale) => new Date(sale.date) >= weekStart);
      } else if (periodFilter.value === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).setHours(0, 0, 0, 0);
        result = result.filter((sale) => new Date(sale.date) >= monthStart);
      }

      return result;
    });

    // Calcular estadísticas
    const totalSales = computed(() => {
      return filteredSales.value.reduce((sum, sale) => sum + sale.total, 0);
    });

    const averageSale = computed(() => {
      return filteredSales.value.length ? totalSales.value / filteredSales.value.length : 0;
    });

    const topProduct = computed(() => {
      const productCounts = {};

      filteredSales.value.forEach((sale) => {
        sale.items.forEach((item) => {
          if (!productCounts[item.name]) {
            productCounts[item.name] = 0;
          }
          productCounts[item.name] += item.quantity;
        });
      });

      let topName = '';
      let topCount = 0;

      for (const [name, count] of Object.entries(productCounts)) {
        if (count > topCount) {
          topName = name;
          topCount = count;
        }
      }

      return { name: topName || 'N/A', count: topCount };
    });

    // Paginación
    const totalPages = computed(() => {
      return Math.ceil(filteredSales.value.length / itemsPerPage.value);
    });

    const paginatedSales = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredSales.value.slice(start, end);
    });

    // Manejadores de eventos
    const toggleDetails = (id) => {
      const index = sales.value.findIndex((sale) => sale.id === id);
      if (index !== -1) {
        sales.value[index].showDetails = !sales.value[index].showDetails;
      }
    };

    const resetFilters = () => {
      searchQuery.value = '';
      periodFilter.value = 'all';
      currentPage.value = 1;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const downloadInvoice = () => {
      isLoading.value = true;
      setTimeout(() => {
        isLoading.value = false;
      }, 1000);
    };

    const sendEmailReceipt = (id) => {
      alert(`Se enviará el comprobante de la venta ${id} por correo electrónico.`);
    };

    const printReceipt = () => {};

    const duplicateSale = (sale) => {
      const newSale = JSON.parse(JSON.stringify(sale));
      newSale.id = `VTA-${String(sales.value.length + 1).padStart(3, '0')}`;
      newSale.date = new Date().toISOString();
      newSale.status = 'Nueva';
      newSale.showDetails = false;

      sales.value.unshift(newSale);
    };

    // Funciones auxiliares
    const formatDate = (dateString) => {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const isRecentSale = (dateString) => {
      const saleDate = new Date(dateString);
      const now = new Date();
      return now - saleDate < 24 * 60 * 60 * 1000; // Menos de 24 horas
    };

    const getSaleStatusClass = (status) => {
      switch (status) {
        case 'Completada':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'Parcial':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'Cancelada':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'Nueva':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      }
    };

    const calculateSubtotal = (items) => {
      return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    };

    const calculateTaxes = (items) => {
      return calculateSubtotal(items) * 0.16; // 16% de impuestos
    };

    // Efectos
    watch(filteredSales, () => {
      // Resetear a la primera página cuando cambian los filtros
      currentPage.value = 1;
    });

    onMounted(() => {
      // Detectar preferencia de tema oscuro
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;

      // Simular carga inicial
      isLoading.value = true;
      setTimeout(() => {
        isLoading.value = false;
      }, 800);
    });

    return {
      isDark,
      searchQuery,
      periodFilter,
      currentPage,
      itemsPerPage,
      isLoading,
      salesTrend,
      sales,
      filteredSales,
      totalSales,
      averageSale,
      topProduct,
      totalPages,
      paginatedSales,
      toggleDetails,
      resetFilters,
      nextPage,
      prevPage,
      downloadInvoice,
      sendEmailReceipt,
      printReceipt,
      duplicateSale,
      formatDate,
      isRecentSale,
      getSaleStatusClass,
      calculateSubtotal,
      calculateTaxes,
    };
  },
};
