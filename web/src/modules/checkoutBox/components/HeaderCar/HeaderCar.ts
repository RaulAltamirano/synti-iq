import { ref, nextTick, onMounted, onUnmounted, computed, defineComponent } from 'vue';
import { useTheme } from '@/modules/shared/composables/useTheme';
import SearchProduct from '../SearchProduct/SearchProduct.vue';
import { useCartCashierStore } from '../../stores/useCartStoreCashier';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import CartItemHeader from '../CarItemHeader/CartItemHeader.vue';
import { ModalName, useModalStore } from '@/modules/shared/store/useModalStore';
import ShareCartModal from '../ShareCartModal/ShareCartModal.vue';

export default defineComponent({
  name: 'HeaderCar',
  components: {
    SearchProduct,
    FontAwesomeIcon,
    CartItemHeader,
    ShareCartModal,
  },
  setup() {
    const { isDark } = useTheme();
    const cartStore = useCartCashierStore();
    const modal = useModalStore();

    const editInput = ref<HTMLInputElement | null>(null);
    const draggedItem = ref<number | null>(null);
    const dragOverItem = ref<number | null>(null);

    const carts = computed(() => cartStore.carts);
    const currentCartIndex = computed(() => cartStore.currentCartIndex);
    const isPriceCheckerActive = computed(() => cartStore.isPriceCheckerActive);
    const showPriceChecker = computed(() => cartStore.showPriceChecker);
    const selectedProduct = computed(() => cartStore.selectedProduct);

    const onDragStart = (e: DragEvent, index: number) => {
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        draggedItem.value = index;

        const target = e.target as HTMLElement;
        setTimeout(() => {
          target.classList.add('dragging');
        }, 0);

        target.setAttribute('aria-grabbed', 'true');
      }
    };

    const onDragOver = (e: DragEvent, index: number) => {
      e.preventDefault();
      dragOverItem.value = index;

      const cartElements = document.querySelectorAll('.cart-item');
      cartElements.forEach((el, i) => {
        if (i === index) {
          el.classList.add('drag-over');
        } else {
          el.classList.remove('drag-over');
        }
      });
    };

    const onDragEnd = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      target.classList.remove('dragging');
      target.setAttribute('aria-grabbed', 'false');

      const cartElements = document.querySelectorAll('.cart-item');
      cartElements.forEach((el) => {
        el.classList.remove('drag-over');
      });
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();

      if (
        draggedItem.value !== null &&
        dragOverItem.value !== null &&
        draggedItem.value !== dragOverItem.value
      ) {
        cartStore.moveCart(draggedItem.value, dragOverItem.value);
      }

      draggedItem.value = null;
      dragOverItem.value = null;

      const cartElements = document.querySelectorAll('.cart-item');
      cartElements.forEach((el) => {
        el.classList.remove('drag-over');
      });
    };

    const getCartIcon = (index: number) => {
      const icons = ['shopping-cart', 'shopping-bag', 'store', 'gift'];
      if (index < icons.length) {
        return icons[index];
      }
      return 'shopping-basket';
    };

    const startEditing = async (index: number) => {
      cartStore.startEditing(index);
      await nextTick();
      if (editInput.value) {
        editInput.value.focus();
        editInput.value.select();
      }
    };

    const finishEditing = (index: number) => {
      cartStore.finishEditing(index);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const clickedOutside =
        !e.target ||
        (!(e.target as HTMLElement).closest('.cart-dropdown-trigger') &&
          !(e.target as HTMLElement).closest('.cart-dropdown-menu'));

      if (clickedOutside) {
        cartStore.closeAllDropdowns();
      }
    };

    onMounted(() => {
      cartStore.loadCarts();
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    const getCartItemClasses = (index: number) => {
      const isActive = currentCartIndex.value === index;
      return isActive
        ? isDark
          ? 'bg-blue-700 text-gray-100 shadow-md shadow-blue-900/40'
          : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
        : isDark
          ? 'bg-gray-800 hover:bg-gray-750 text-gray-300 hover:text-gray-200 shadow shadow-gray-900/20'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 shadow shadow-gray-300/30';
    };

    const getInputClasses = () => {
      return isDark
        ? 'bg-gray-800 border-gray-700 focus:border-blue-600 focus:ring-blue-700/30 text-white'
        : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 text-gray-800';
    };

    const handleRightClick = (index: number) => {
      cartStore.toggleDropdown(index);
    };

    const shareCartModal = ref<unknown>(null);

    const currentCartItems = ref([
      { id: 1, name: 'Producto 1', price: 25.99, quantity: 2 },
      { id: 2, name: 'Producto 2', price: 15.5, quantity: 1 },
      { id: 3, name: 'Producto 3', price: 10.0, quantity: 3 },
    ]);

    const openShareModal = () => {
      modal.open(ModalName.SHARE_CART);
    };

    return {
      cartStore,
      editInput,
      draggedItem,
      dragOverItem,
      carts,
      currentCartIndex,
      modal,
      isPriceCheckerActive,
      showPriceChecker,
      selectedProduct,
      onDragStart,
      getCartItemClasses,
      getInputClasses,
      onDragOver,
      onDragEnd,
      isDark,
      onDrop,
      getCartIcon,
      openShareModal,
      currentCartItems,
      startEditing,
      finishEditing,
      shareCartModal,
      handleRightClick,
    };
  },
});
