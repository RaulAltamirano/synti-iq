import { useTheme } from '@/modules/shared/composables/useTheme';
import { ref, computed } from 'vue';

export default {
  name: 'InventoryManagement',
  components: {
    // ComponentName
  },
  setup() {
    const { isDark } = useTheme();
    const searchQuery = ref('');
    const averageProductValue = ref(12213);
    const totalInventoryValue = ref(2313);
    const topSellingProduct = ref({ name: 'Hola name' });
    const inventory = ref([
      {
        id: 1,
        name: 'Laptop Gamer',
        sku: 'LP12345',
        category: 'Electrónica',
        stock: 15,
        price: 1200.5,
        image: 'https://via.placeholder.com/40',
      },
      {
        id: 2,
        name: 'Smartphone Pro',
        sku: 'SP67890',
        category: 'Electrónica',
        stock: 8,
        price: 800.0,
        image: 'https://via.placeholder.com/40',
      },
      {
        id: 3,
        name: 'Teclado Mecánico',
        sku: 'TK54321',
        category: 'Accesorios',
        stock: 4,
        price: 75.99,
        image: '',
      },
      {
        id: 4,
        name: 'Monitor 27"',
        sku: 'MN98765',
        category: 'Electrónica',
        stock: 12,
        price: 300.0,
        image: 'https://via.placeholder.com/40',
      },
      {
        id: 5,
        name: 'Mouse Inalámbrico',
        sku: 'MS45678',
        category: 'Accesorios',
        stock: 20,
        price: 25.5,
        image: 'https://via.placeholder.com/40',
      },
      {
        id: 6,
        name: 'Auriculares Bluetooth',
        sku: 'AH23456',
        category: 'Accesorios',
        stock: 3,
        price: 50.0,
        image: '',
      },
      {
        id: 7,
        name: 'Impresora Multifunción',
        sku: 'IM78901',
        category: 'Oficina',
        stock: 7,
        price: 150.75,
        image: 'https://via.placeholder.com/40',
      },
      {
        id: 8,
        name: 'Tablet 10"',
        sku: 'TB34567',
        category: 'Electrónica',
        stock: 10,
        price: 250.0,
        image: 'https://via.placeholder.com/40',
      },
      {
        id: 9,
        name: 'Cargador Portátil',
        sku: 'CP89012',
        category: 'Accesorios',
        stock: 25,
        price: 40.0,
        image: '',
      },
      {
        id: 10,
        name: 'Disco Duro Externo',
        sku: 'DD12345',
        category: 'Almacenamiento',
        stock: 6,
        price: 90.0,
        image: 'https://via.placeholder.com/40',
      },
    ]);

    const filteredProducts = computed(() =>
      inventory.value.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );

    const refreshInventory = () => {
      alert('Inventario actualizado');
    };

    const exportProduct = (id: unknown) => {
      alert(`Exportando detalles del producto #${id}`);
    };

    const tableMotion = {
      initial: { opacity: 0, y: 20 },
      enter: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return {
      isDark,
      averageProductValue,
      searchQuery,
      inventory,
      totalInventoryValue,
      filteredProducts,
      refreshInventory,
      exportProduct,
      tableMotion,
      topSellingProduct,
      getCategoryClass(category: unknown) {
        switch (category) {
          case 'Electrónica':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
          case 'Accesorios':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
          case 'Oficina':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
          case 'Almacenamiento':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
          default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
      },
      getStockBarColor(stock) {
        if (stock < 5) {
          return 'bg-red-500'; // Rojo para stock bajo
        } else if (stock >= 5 && stock <= 10) {
          return 'bg-yellow-500'; // Amarillo para stock medio
        } else {
          return 'bg-green-500'; // Verde para stock alto
        }
      },
      getStockPercentage(stock) {
        const maxStock = 20; // Define el stock máximo para calcular el porcentaje
        return (stock / maxStock) * 100;
      },
    };
  },
};
