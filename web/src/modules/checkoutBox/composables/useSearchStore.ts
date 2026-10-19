import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ProductFilterDto } from '../interfaces/ProductFilterDto';
import { ApiService } from '@/modules/services/api-service';
const apiService = ApiService.getInstance();

// Definición de tipos
interface SearchState {
  query: string;
  results: any[];
  page: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  abortController: AbortController | null;
}

const MAX_RESULTS_IN_MEMORY = 500;

export const useSearchStore = defineStore('search', () => {
  const state = ref<SearchState>({
    query: '',
    results: [],
    page: 1,
    totalPages: 0,
    loading: false,
    error: null,
    hasMore: true,
    abortController: null,
  });

  // Computed
  const filteredProducts = computed(() => state.value.results);
  const isLoading = computed(() => state.value.loading);
  const hasMoreResults = computed(() => state.value.hasMore);
  const currentQuery = computed(() => state.value.query);

  // Resetear abortController existente
  function cancelOngoingRequest() {
    if (state.value.abortController) {
      state.value.abortController.abort();
      state.value.abortController = null;
    }
  }

  async function search(query: string) {
    cancelOngoingRequest();
    state.value.loading = true;
    state.value.query = query;
    state.value.page = 1;
    state.value.results = [];
    state.value.error = null;

    const abortController = new AbortController();
    state.value.abortController = abortController;

    try {
      const response = await fetchProducts(
        {
          name: query,
          page: 1,
          limit: 20,
        },
        abortController.signal
      );

      if (!response) throw new Error('Error de respuesta');

      state.value.results = response.products;
      state.value.totalPages = response.totalPages;
      state.value.hasMore = state.value.page < response.totalPages;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        state.value.error = error;
      }
    } finally {
      state.value.loading = false;
      state.value.abortController = null;
    }
  }

  function clearSearch() {
    cancelOngoingRequest();

    state.value = {
      query: '',
      results: [],
      page: 1,
      totalPages: 0,
      loading: false,
      error: null,
      hasMore: true,
      abortController: null,
    };
  }

  async function loadMore() {
    if (!state.value.hasMore || state.value.loading) return;

    if (state.value.results.length >= MAX_RESULTS_IN_MEMORY) {
      state.value.hasMore = false;
      return;
    }

    const nextPage = state.value.page + 1;
    state.value.loading = true;

    const abortController = new AbortController();
    state.value.abortController = abortController;

    try {
      const response = await fetchProducts(
        {
          name: state.value.query,
          page: nextPage,
          limit: 20,
        },
        abortController.signal
      );

      if (!response) throw new Error('Error de respuesta');

      const uniqueProducts = response.products.filter(
        (product: any) => !state.value.results.some((p: any) => p.id === product.id)
      );

      state.value.results.push(...uniqueProducts);
      state.value.page = nextPage;
      state.value.totalPages = response.totalPages;
      state.value.hasMore =
        nextPage < response.totalPages && state.value.results.length < MAX_RESULTS_IN_MEMORY;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        state.value.error = error;
      }
    } finally {
      state.value.loading = false;
      state.value.abortController = null;
    }
  }

  async function fetchProducts(
    filters: ProductFilterDto,
    signal?: AbortSignal
  ): Promise<any | undefined> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((val) => params.append(key, val.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await apiService.api.get<any>(`/product?${params.toString()}`, { signal });
      const paginatedPayload = response?.data?.data;
      if (!response || !response.data || !Array.isArray(paginatedPayload?.items)) {
        throw new Error('Respuesta inesperada de la API');
      }

      return {
        products: paginatedPayload.items,
        totalPages: paginatedPayload.totalPages ?? 1,
      };
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        state.value.error = error;
      }
    }
  }

  return {
    filteredProducts,
    isLoading,
    hasMoreResults,
    currentQuery,
    search,
    loadMore,
    clearSearch,
  };
});
