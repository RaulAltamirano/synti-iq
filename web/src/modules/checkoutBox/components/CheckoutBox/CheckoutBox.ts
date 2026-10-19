import { computed, defineComponent, ref } from 'vue';
import SearchProduct from '../SearchProduct/SearchProduct.vue';
import { useTheme } from '@/modules/shared/composables/useTheme';
import SalesView from '../../page/SalesView/SalesView.vue';

export default defineComponent({
  name: 'CheckoutBox',
  components: {
    SearchProduct,
    SalesView,
  },
  setup() {
    // State
    const { isDark } = useTheme();
    const showPriceChecker = ref(false);
    const carts = ref([{ items: [], discount: 0 }]);
    const currentCartIndex = ref(0);
    const openingBalance = ref(0);
    const closingBalance = ref(0);
    const returnOrderId = ref('');
    const taxRate = ref(10);

    // // Animation
    // const pageTransition = useMotion({
    //   initial: { opacity: 0, y: 20 },
    //   enter: { opacity: 1, y: 0 },
    //   leave: { opacity: 0, y: -20 }
    // })
    const currentCart = computed(() => carts.value[currentCartIndex.value]);
    const currentCartTotal = computed(() => {
      const items = currentCart.value.items;
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * (taxRate.value / 100);
      const discount = currentCart.value.discount || 0;
      return {
        subtotal,
        tax,
        total: subtotal + tax - discount,
      };
    });
    const menuItems = [
      { id: 'sales', label: 'Sales', icon: 'cash-register' },
      { id: 'returns', label: 'Returns', icon: 'undo' },
      { id: 'register', label: 'Cash Register', icon: 'money-bill' },
      { id: 'credits', label: 'Customer Credits', icon: 'credit-card' },
      { id: 'history', label: 'Sales History', icon: 'history' },
      { id: 'inventory', label: 'Inventory', icon: 'boxes' },
    ];

    // Stats data
    const stats = [
      {
        id: 1,
        label: "Today's Sales",
        value: '$1,234.56',
        icon: 'chart-line',
        color: 'text-green-500',
      },
      { id: 2, label: 'Items Sold', value: '45', icon: 'shopping-cart', color: 'text-blue-500' },
      { id: 3, label: 'Returns', value: '2', icon: 'undo', color: 'text-red-500' },
      {
        id: 4,
        label: 'Active Credits',
        value: '$567.89',
        icon: 'credit-card',
        color: 'text-purple-500',
      },
    ];
    const products = ref([
      {
        id: 1,
        name: 'Producto 1',
        price: 19.99,
        stock: 100,
        sku: 'SKU001',
        description: 'Descripción del producto 1',
      },
      {
        id: 2,
        name: 'Producto 2',
        price: 29.99,
        stock: 150,
        sku: 'SKU002',
        description: 'Descripción del producto 2',
      },
      // ... más productos
    ]);

    // Computed values
    const cartSubtotal = computed(() => {
      return currentCart.value.reduce((total, item) => total + item.price * item.quantity, 0);
    });

    const cartTax = computed(() => {
      return (cartSubtotal.value * taxRate.value) / 100;
    });

    const cartTotal = computed(() => {
      return cartSubtotal.value + cartTax.value;
    });

    //  Methods

    const processPayment = async () => {
      // Implement payment processing logic
    };

    const startShift = async () => {
      // Implement shift start logic
    };

    const endShift = async () => {
      // Implement shift end logic
    };

    const searchOrder = async () => {
      // Implement order search logic
    };
    const showReturnsModal = async () => {};
    const showCreditsModal = async () => {};
    const addProductByBarcode = () => {};
    const openScanner = () => {};

    const toggleDarkMode = () => {
      themeStore.toggleTheme();
    };

    const togglePriceChecker = () => {
      showPriceChecker.value = !showPriceChecker.value;
    };

    const showProductPrice = (product) => {
      selectedProduct.value = product;
    };

    const addNewCart = () => {
      carts.value.push({ items: [], discount: 0 });
      currentCartIndex.value = carts.value.length - 1;
    };

    const switchCart = (index) => {
      currentCartIndex.value = index;
    };

    const handleProductSelected = (product) => {
      const existingItem = currentCart.value.items.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        currentCart.value.items.push({
          ...product,
          quantity: 1,
        });
      }
    };

    const increaseQuantity = (item) => {
      item.quantity++;
    };

    const decreaseQuantity = (item) => {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        removeItem(item);
      }
    };

    const removeItem = (item) => {
      const index = currentCart.value.items.findIndex((i) => i.id === item.id);
      if (index > -1) {
        currentCart.value.items.splice(index, 1);
      }
    };

    const applyDiscount = (item) => {
      // Implementar lógica de descuento
    };

    const holdCart = () => {
      // Implementar lógica para pausar venta
    };

    const showPaymentOptions = () => {
      // Implementar modal de opciones de pago
    };

    function logout() {}
    return {
      logout,
      menuItems,
      stats,
      applyDiscount,
      holdCart,
      showPaymentOptions,
      openScanner,
      currentCartTotal,
      handleProductSelected,
      increaseQuantity,
      showReturnsModal,
      showCreditsModal,
      decreaseQuantity,
      addProductByBarcode,
      removeItem,
      processPayment,
      startShift,
      endShift,
      // pageTransition,
      searchOrder,
      isDark,
      currentView,
      currentCart,
      openingBalance,
      closingBalance,
      returnOrderId,
      carts,
      taxRate,
      cartSubtotal,
      cartTax,
      products,
      cartTotal,
      showPriceChecker,
      currentCartIndex,
    };
  },
});
