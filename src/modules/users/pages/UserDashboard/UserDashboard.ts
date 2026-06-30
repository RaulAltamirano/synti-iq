import { computed, ref } from 'vue';
import TitleCard from '../../../shared/components/TitleCard/TitleCard.vue';
import { useTheme } from '../../../shared/composables/useTheme';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  name: 'UserDashboard',
  components: {
    // Navbar,
    TitleCard,
    FontAwesomeIcon,
  },
  setup() {
    const { isDark } = useTheme();
    const search = ref('');
    const filterType = ref('all');

    const stats = [
      {
        title: 'Ventas Totales',
        value: '$12,345',
        icon: ['fas', 'chart-line'],
        color: 'text-blue-500',
      },
      {
        title: 'Entradas',
        value: '156',
        icon: ['fas', 'arrow-right-to-bracket'],
        color: 'text-green-500',
      },
      {
        title: 'Salidas',
        value: '89',
        icon: ['fas', 'arrow-right-from-bracket'],
        color: 'text-red-500',
      },
    ];

    const activities = ref([
      {
        id: 1,
        type: 'sale',
        title: 'Venta realizada',
        description: 'Venta de productos por $1,234',
        date: new Date(2024, 10, 28),
      },
      {
        id: 1,
        type: 'purchase',
        title: 'Compra realizada',
        description: 'Compra #123 - $245',
        date: '2024-03-24T10:30:00',
      },
      // Añadir más actividades aquí
    ]);

    const filteredActivities = computed(() => {
      return activities.value.filter(
        (activity: { title: string; description: string; type: any }) => {
          const matchesSearch =
            activity.title.toLowerCase().includes(search.value.toLowerCase()) ||
            activity.description.toLowerCase().includes(search.value.toLowerCase());
          const matchesFilter = filterType.value === 'all' || activity.type === filterType.value;
          return matchesSearch && matchesFilter;
        }
      );
    });

    const viewDetails = (activity: any) => {
      // Implementar lógica para ver detalles
    };

    const generateInvoice = (activity: any) => {
      // Implementar lógica para generar factura
    };
    const user = ref({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Premium User',
      joinDate: '2024-01-15',
      lastActive: '2024-03-20',
    });

    const getActivityColor = (type: string, isDark: boolean) =>
      ({
        purchase: isDark ? 'bg-blue-600' : 'bg-gradient-to-r from-blue-500 to-blue-600',
        review: isDark ? 'bg-purple-600' : 'bg-gradient-to-r from-purple-500 to-purple-600',
      })[type] || 'bg-gray-600';

    const getActivityIcon = (type: string) =>
      ({
        purchase: 'cart',
        review: 'star',
      })[type] || 'information';

    const formatDate = (date: string | Date) => {
      return new Date(date).toLocaleDateString();
    };

    return {
      isDark,
      search,
      filterType,
      stats,
      activities,
      filteredActivities,
      getActivityColor,
      getActivityIcon,
      formatDate,
      viewDetails,
      generateInvoice,
      user,
    };

    return {};
  },
};
