import { ref, defineComponent } from 'vue';

export default defineComponent({
  name: 'Cart',
  setup() {
    const activeTab = ref('cart');

    // Sample data - Replace with your actual data store
    const cartItems = ref([
      {
        id: 1,
        name: 'Producto de Ejemplo 1',
        description: 'Descripción corta del producto',
        price: 99.99,
        quantity: 2,
        image: '/api/placeholder/200/200',
      },
      // Add more items...
    ]);

    const wishlistItems = ref([
      {
        id: 2,
        name: 'Producto de Ejemplo 2',
        description: 'Descripción corta del producto',
        price: 149.99,
        addedDate: '2024-03-20',
        image: '/api/placeholder/200/200',
      },
      // Add more items...
    ]);

    // Cart functions
    const calculateSubtotal = () => {
      return cartItems.value
        .reduce((total, item) => total + item.price * item.quantity, 0)
        .toFixed(2);
    };

    const calculateTax = () => {
      return (parseFloat(calculateSubtotal()) * 0.16).toFixed(2);
    };

    const calculateTotal = () => {
      return (parseFloat(calculateSubtotal()) + parseFloat(calculateTax())).toFixed(2);
    };

    const increaseQuantity = (item: { quantity: number }) => {
      item.quantity++;
    };

    const decreaseQuantity = (item: { quantity: number }) => {
      if (item.quantity > 1) {
        item.quantity--;
      }
    };

    const removeFromCart = (item: { id: number }) => {
      cartItems.value = cartItems.value.filter((i) => i.id !== item.id);
    };

    const addToCart = (item: {
      id: number;
      name: string;
      description: string;
      price: number;
      quantity: number;
      image: string;
    }) => {
      const existingItem = cartItems.value.find((i) => i.id === item.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cartItems.value.push({
          ...item,
          quantity: 1,
        });
      }
      removeFromWishlist(item);
    };

    // Wishlist functions
    const removeFromWishlist = (item: { id: number }) => {
      wishlistItems.value = wishlistItems.value.filter((i) => i.id !== item.id);
    };
    return {
      calculateTotal,
      calculateSubtotal,
      calculateTax,
      removeFromWishlist,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      addToCart,
      activeTab,
      cartItems,
      wishlistItems,
    };
  },
});
