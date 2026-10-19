import { ref, computed, watch } from 'vue';

import { useTheme } from '@/modules/shared/composables/useTheme';
import SearchProduct from '../../components/SearchProduct/SearchProduct.vue';
import HeaderCar from '../../components/HeaderCar/HeaderCar.vue';
import StatsCheckoutBox from '../../components/StatsCheckoutBox/StatsCheckoutBox.vue';
import { useCartCashierStore } from '../../stores/useCartStoreCashier';
import { useStatusModal } from '@/modules/shared/composables/useStatusModal';
import PaymentModalDetails from '../../components/PaymentModalDetails/PaymentModalDetails.vue';
import MobileRechargeModal from '../../components/MobileRechargeModal/MobileRechargeModal.vue';
import ServicesModal from '../../components/ServicesModal/ServicesModal.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  name: 'SalesView',
  components: {
    SearchProduct,
    StatsCheckoutBox,
    HeaderCar,
    PaymentModalDetails,
    MobileRechargeModal,
    ServicesModal,
    FontAwesomeIcon,
  },
  setup() {
    // Estado
    const { isDark } = useTheme();
    const currentView = ref('sales');
    const statusModal = useStatusModal();
    const showPriceChecker = ref(false);
    const selectedProduct = ref(null);
    const carts = ref([{ items: [], discount: 0 }]);
    const currentCartIndex = ref(0);
    const showModal = ref(false);

    const taxRate = ref(16);

    // Computed
    const cartCashierStore = useCartCashierStore();

    // Observadores
    watch(
      carts,
      (newCarts) => {
        // Persistir carritos en el store
        // cartStore.updateCarts(newCarts)
      },
      { deep: true }
    );

    const formatCurrency = (value) => {
      return `$${parseFloat(value).toFixed(2)}`;
    };
    const actionButtonClass = (color) => {
      const colors = {
        blue: 'text-blue-500 hover:text-blue-700',
        red: 'text-red-500 hover:text-red-700',
        green: 'text-green-500 hover:text-green-700',
      };

      return `${colors[color] || colors.blue} transition-all duration-200`;
    };
    const quantityButtonClasses = computed(() =>
      isDark.value ? 'hover:bg-gray-700 border-gray-600' : 'hover:bg-gray-200 border-gray-300'
    );

    function showPaymentOptions() {
      showModal.value = true;
      onPaymentSuccess();
    }

    function onPaymentSuccess() {
      statusModal.transaction.success({
        id: 'ORDER-12345',
        amount: '$125.50',
        additionalDetails: {
          paymentMethod: 'Tarjeta de crédito',
          lastFour: '4242',
        },
      });
    }

    const cartTotal = computed(() => cartCashierStore.cartTotal);
    const currentCart = computed(() => cartCashierStore.cartItemsWithDetails || []);
    const cartDiscountTotal = computed(() => cartCashierStore.cartDiscountTotal);
    // const currentCart = computed(() => cartCashierStore.cartItemsWithDetails || []);

    // Referencia al modal para poder abrirlo programáticamente

    return {
      isDark,
      currentView,
      showPriceChecker,
      selectedProduct,
      carts,
      cartDiscountTotal,
      currentCartIndex,
      showPaymentOptions,
      showModal,
      quantityButtonClasses,
      actionButtonClass,
      taxRate,
      currentCart,
      cartTotal,
      formatCurrency,
    };
  },
};
