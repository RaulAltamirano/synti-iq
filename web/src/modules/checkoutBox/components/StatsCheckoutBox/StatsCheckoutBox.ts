import { useTheme } from '@/modules/shared/composables/useTheme';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ref } from 'vue';

export default {
  name: 'StatsCheckoutBox',
  components: {
    FontAwesomeIcon,
  },
  setup() {
    const { isDark } = useTheme();
    const showStats = ref(true);
    const stats = ref([
      {
        id: 1,
        label: 'Daily Sales',
        value: '$1,234.56',
        icon: 'fas fa-shopping-cart',
        color: '#10B981', // Verde para representar ventas
      },
      {
        id: 2,
        label: 'Transactions',
        value: '45',
        icon: 'fas fa-exchange-alt',
        color: '#3B82F6', // Azul para transacciones
      },
      {
        id: 3,
        label: 'Returns',
        value: '3',
        icon: 'fas fa-undo',
        color: '#EF4444', // Rojo para devoluciones
      },
      {
        id: 4,
        label: 'Average Sale',
        value: '$89.67',
        icon: 'fas fa-chart-line',
        color: '#F59E0B', // Amarillo/naranja para promedios
      },
    ]);

    return {
      isDark,
      stats,
      showStats,
      toggleStats() {
        showStats.value = !showStats.value;
      },
    };
  },
};
