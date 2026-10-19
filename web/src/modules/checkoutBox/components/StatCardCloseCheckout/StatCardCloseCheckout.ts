import { useTheme } from '@/modules/shared/composables/useTheme';

export default {
  name: 'StatCardCloseCheckout',
  components: {},
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },

    // Estilo y tema
    isDark: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: 'default',
      validator: (value: string) =>
        ['default', 'success', 'warning', 'error', 'info'].includes(value),
    },

    // Estados
    loading: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '...',
    },

    // Datos de tendencia
    trend: {
      type: Number,
      default: null,
    },
    showTrend: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { isDark } = useTheme();
    // Variantes de color
    const colorVariants = {
      default: 'text-current',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
      info: 'text-blue-500',
    };
    return {
      colorVariants,
      isDark,
    };
  },
};
