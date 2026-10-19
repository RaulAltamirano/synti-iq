import { defineComponent, computed, ref } from 'vue';
import { useCartCashierStore } from '../../stores/useCartStoreCashier';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useTheme } from '@/modules/shared/composables/useTheme';

export default defineComponent({
  name: 'CartItemHeader',
  components: {
    FontAwesomeIcon,
  },
  props: {
    cart: {
      type: Object as () => any,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    canDelete: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const { isDark } = useTheme();
    const cartStore = useCartCashierStore();
    const editInput = ref<HTMLInputElement | null>(null);
    const originalName = ref('');

    // Configuración de motion
    const motionConfig = {
      initial: { x: -10, opacity: 0 },
      enter: {
        x: 0,
        opacity: 1,
        transition: { duration: 200, delay: props.index * 50 },
      },
    };

    // Computed properties
    const containerClasses = computed(() => [
      'group flex items-center rounded-lg transition-colors duration-200 cart-item',
      props.isCurrent
        ? isDark.value
          ? 'bg-blue-800 text-white'
          : 'bg-blue-600 text-white'
        : isDark.value
          ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800',
      props.cart.showDropdown ? (isDark.value ? 'bg-gray-700' : 'bg-gray-300') : '',
    ]);

    const countBadgeClasses = computed(() => [
      'ml-2 px-2 py-0.5 rounded-full text-xs font-semibold',
      props.isCurrent
        ? isDark.value
          ? 'bg-blue-900 text-blue-100'
          : 'bg-blue-700 text-white'
        : isDark.value
          ? 'bg-gray-900 text-gray-300'
          : 'bg-gray-300 text-gray-700',
    ]);

    const removeButtonClasses = computed(() => [
      'px-2 py-2 opacity-0 group-hover:opacity-100 focus:opacity-100',
      props.isCurrent
        ? 'text-white/80 hover:text-white'
        : isDark.value
          ? 'text-gray-400 hover:text-gray-200'
          : 'text-gray-500 hover:text-gray-700',
      !props.canDelete ? 'opacity-50 cursor-not-allowed' : '',
    ]);

    // Métodos
    const getCartIcon = (index: number): string => {
      if (index === 0) return 'shopping-cart';
      return ['list-alt', 'shopping-basket', 'shopping-bag'][index % 3] || 'shopping-cart';
    };

    const handleRightClick = (index: number): void => {
      cartStore.toggleDropdown(index);
    };

    const startEditing = (index: number): void => {
      originalName.value = props.cart.name;
      cartStore.startEditing(index);
      setTimeout(() => {
        if (editInput.value) {
          editInput.value.focus();
          editInput.value.select();
        }
      });
    };

    const finishEditing = (index: number): void => {
      if (props.cart.name.trim() === '') {
        props.cart.name = originalName.value;
      }
      cartStore.finishEditing(index);
    };

    const cancelEditing = (index: number): void => {
      props.cart.name = originalName.value;
      cartStore.finishEditing(index);
    };

    // Event handlers
    const onDragStart = (e: DragEvent): void => {
      emit('drag-start', e, props.index);
    };

    const onDragOver = (e: DragEvent): void => {
      emit('drag-over', e, props.index);
    };

    const onDragEnd = (e: DragEvent): void => {
      emit('drag-end', e);
    };

    const onDrop = (e: DragEvent): void => {
      emit('drop', e);
    };

    return {
      // Theme
      isDark,

      // Refs
      editInput,
      originalName,

      // Computed
      containerClasses,
      countBadgeClasses,
      removeButtonClasses,

      // Métodos
      getCartIcon,
      handleRightClick,
      startEditing,
      finishEditing,
      cancelEditing,

      // Eventos
      onDragStart,
      onDragOver,
      onDragEnd,
      onDrop,

      // Configs
      motionConfig,
      cartStore,
    };
  },
});
