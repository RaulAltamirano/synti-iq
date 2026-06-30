import { useDebounce } from '@vueuse/core';
import { defineComponent, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useSearchStore } from '../../composables/useSearchStore';
import { useInfiniteScroll } from '../../composables/useInfiniteScroll';
import { useFormatter } from '../../composables/useFormatter';
import { useCartCashierStore } from '../../stores/useCartStoreCashier';

export default defineComponent({
  name: 'SearchProduct',
  emits: ['select'],
  setup(_, { emit }) {
    // Referencias y estado
    const searchQuery = ref('');
    const isFocused = ref(false);
    const showDropdown = ref(false);
    const listContainerRef = ref(null);
    const loadingMoreRef = ref(null);
    const searchStore = useSearchStore();
    const { addProductToCart } = useCartCashierStore();
    const { formatPrice } = useFormatter();

    // Usar debounce para evitar múltiples solicitudes durante la escritura
    const debouncedQuery = useDebounce(searchQuery, 300);

    // Condición para habilitar scroll infinito
    const infiniteScrollEnabled = ref(false);

    // Configurar scroll infinito
    const infiniteScroll = useInfiniteScroll({
      containerRef: listContainerRef,
      triggerRef: loadingMoreRef,
      onIntersect: () => {
        if (searchStore.hasMoreResults && !searchStore.isLoading) {
          searchStore.loadMore();
        }
      },
      enabled: infiniteScrollEnabled,
    });

    // Observador para cambios en la consulta
    watch(debouncedQuery, (newQuery) => {
      const trimmedQuery = newQuery.trim();
      if (trimmedQuery) {
        searchStore.search(trimmedQuery);
        showDropdown.value = true;
      } else {
        searchStore.clearSearch();
        showDropdown.value = false;
      }
    });

    // Observador para el estado de los resultados
    watch(
      [() => searchStore.filteredProducts, () => searchStore.isLoading],
      () => {
        nextTick(() => {
          const hasResults = searchStore.filteredProducts.length > 0;
          const hasQuery = searchQuery.value.trim().length > 0;
          showDropdown.value = hasResults || (hasQuery && !searchStore.isLoading);

          // Actualizar estado para habilitar/deshabilitar scroll infinito
          infiniteScrollEnabled.value = hasResults && showDropdown.value;

          // Refrescar scroll infinito si es necesario
          if (infiniteScrollEnabled.value) {
            infiniteScroll.refresh();
          }
        });
      },
      { deep: true }
    );

    // Manejadores de eventos
    const handleFocus = () => {
      isFocused.value = true;
      if (searchQuery.value && searchStore.filteredProducts.length) {
        showDropdown.value = true;
        nextTick(() => {
          infiniteScroll.refresh();
        });
      }
    };

    const handleBlur = () => {
      isFocused.value = false;
      // Usar un pequeño delay para permitir clicks en los resultados
      setTimeout(() => {
        showDropdown.value = false;
      }, 200);
    };

    const selectProduct = (product) => {
      emit('select', product);
      showDropdown.value = false;
      addProductToCart(product.id, product);
    };

    const clearSearch = () => {
      searchStore.clearSearch();
      searchQuery.value = '';
      showDropdown.value = false;
    };

    // Inicialización y limpieza
    onMounted(() => {
      // Iniciar búsqueda si ya hay una consulta
      if (searchQuery.value.trim()) {
        searchStore.search(searchQuery.value.trim());
      }

      // Inicializar scroll infinito
      infiniteScroll.initialize();
    });

    onBeforeUnmount(() => {
      infiniteScroll.cleanup();
    });

    return {
      searchQuery,
      isFocused,
      showDropdown,
      listContainerRef,
      loadingMoreRef,
      searchStore,
      handleFocus,
      handleBlur,
      selectProduct,
      formatPrice,
      clearSearch,
    };
  },
});
