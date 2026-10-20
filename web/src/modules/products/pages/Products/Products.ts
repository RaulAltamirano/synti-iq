import { defineComponent, ref, computed } from 'vue';
// import { FaSearch } from "react-icons/fa";
// import QuickView from "./QuickView.vue";
// import Pagination from "../../shared/components/Pagination.vue";
import ProductCard from '../../components/ProductCard/ProductCard.vue';
import Pagination from '../../../shared/components/Pagination/Pagination.vue';
import QuickView from '../../components/QuickView/QuickView.vue';
import generateProducts from '../../composables/generateProducts';

interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
  description: string;
}

// Simulación de productos (mock data)
const productsData: Product[] = generateProducts(50);

export default defineComponent({
  name: 'Products',
  components: { ProductCard, QuickView, Pagination },
  setup() {
    const searchQuery = ref('');
    const sortOrder = ref('default');
    const currentPage = ref(1);
    const itemsPerPage = 8;
    const selectedProduct = ref<Product | null>(null);
    const isQuickViewOpen = ref(false);
    const hideFilterBar = ref(false);
    // Filtros y Ordenamiento
    const filteredProducts = computed(() => {
      let results = productsData.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
      if (sortOrder.value === 'price-asc') {
        results = results.sort((a, b) => a.price - b.price);
      } else if (sortOrder.value === 'price-desc') {
        results = results.sort((a, b) => b.price - a.price);
      } else if (sortOrder.value === 'rating') {
        results = results.sort((a, b) => b.rating - a.rating);
      }
      return results;
    });

    const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage));

    const paginatedProducts = computed(() =>
      filteredProducts.value.slice(
        (currentPage.value - 1) * itemsPerPage,
        currentPage.value * itemsPerPage
      )
    );

    const openQuickView = (product: Product) => {
      selectedProduct.value = product;
      isQuickViewOpen.value = true;
    };

    const closeQuickView = () => {
      selectedProduct.value = null;
      isQuickViewOpen.value = false;
    };
    const handleAddToCart = (_product: Product) => {};

    const goToPage = (pageNumber: number) => {
      currentPage.value = pageNumber;
      window.scrollTo(0, 0);
    };

    return {
      searchQuery,
      sortOrder,
      currentPage,
      itemsPerPage,
      totalPages,
      filteredProducts,
      paginatedProducts,
      selectedProduct,
      openQuickView,
      closeQuickView,
      goToPage,
      isQuickViewOpen,
      hideFilterBar,
      handleAddToCart,
    };
  },
});
