import { ref, computed, reactive, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { watchDebounced } from '@vueuse/core';
import { useConfirmModal } from '@/modules/shared/composables/useConfirmModal';
import { useToast } from '@/modules/ui/composables/useToast';
import { listStores, deleteStore } from '@/modules/store/services/storeApi';
import { mapStoreApiToListItem } from '@/modules/store/utils/mapStoreFromApi';
import type {
  StoreListItem,
  StoreFilters,
  StoreStat,
} from '@/modules/store/types/store-dashboard.types';

const ITEMS_PER_PAGE = 8;

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const TYPE_BADGE_VARIANT: Record<string, 'info' | 'default' | 'success' | 'warning' | 'error'> = {
  RETAIL: 'info',
  RESTAURANT: 'warning',
  GROCERY: 'success',
  CONVENIENCE: 'default',
  DEPARTMENT: 'info',
};

export function useStoreDashboard() {
  const router = useRouter();
  const { confirmDanger, setLoading } = useConfirmModal();
  const toast = useToast();

  const currentPage = ref(1);
  const stores = ref<StoreListItem[]>([]);
  const totalItems = ref(0);
  const totalPagesFromApi = ref(1);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const statsLoading = ref(true);

  const filters = reactive<StoreFilters>({
    search: '',
    status: '',
  });

  const stats = ref<StoreStat[]>([
    { label: 'Total Stores', value: '—', icon: 'store', color: 'text-primary-600' },
    { label: 'Active Stores', value: '—', icon: 'door-open', color: 'text-success-600' },
  ]);

  const statusOptions = STATUS_OPTIONS;

  function mapIsActiveFilter(): boolean | undefined {
    if (filters.status === 'active') return true;
    if (filters.status === 'inactive') return false;
    return undefined;
  }

  async function fetchStores(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const res = await listStores({
        page: currentPage.value,
        limit: ITEMS_PER_PAGE,
        sortBy: 'name',
        sortOrder: 'ASC',
        name: filters.search.trim() || undefined,
        isActive: mapIsActiveFilter(),
      });
      const items = res.items ?? [];
      stores.value = items.map(mapStoreApiToListItem);
      totalItems.value = res.total ?? 0;
      totalPagesFromApi.value = Math.max(1, res.totalPages ?? 1);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Could not load stores';
      stores.value = [];
      totalItems.value = 0;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStats(): Promise<void> {
    statsLoading.value = true;
    try {
      const [all, active] = await Promise.all([
        listStores({ page: 1, limit: 1 }),
        listStores({ page: 1, limit: 1, isActive: true }),
      ]);
      stats.value = [
        { label: 'Total Stores', value: all.total ?? 0, icon: 'store', color: 'text-primary-600' },
        {
          label: 'Active Stores',
          value: active.total ?? 0,
          icon: 'door-open',
          color: 'text-success-600',
        },
      ];
    } catch {
      stats.value = [
        { label: 'Total Stores', value: '—', icon: 'store', color: 'text-primary-600' },
        { label: 'Active Stores', value: '—', icon: 'door-open', color: 'text-success-600' },
      ];
    } finally {
      statsLoading.value = false;
    }
  }

  watchDebounced(
    () => filters.search,
    () => {
      currentPage.value = 1;
      void fetchStores();
    },
    { debounce: 400 }
  );

  watch(
    () => filters.status,
    () => {
      currentPage.value = 1;
      void fetchStores();
    }
  );

  onMounted(() => {
    void fetchStats();
    void fetchStores();
  });

  const paginationStart = computed(() => (currentPage.value - 1) * ITEMS_PER_PAGE);

  const paginationEnd = computed(() => paginationStart.value + stores.value.length);

  const totalPages = computed(() => totalPagesFromApi.value);

  const paginatedStores = computed(() => stores.value);

  function getTypeBadgeVariant(type: string): 'info' | 'default' | 'success' | 'warning' | 'error' {
    const key = type.trim().toUpperCase();
    return TYPE_BADGE_VARIANT[key] ?? 'default';
  }

  const formatHours = (hours: { open: string; close: string } | null) => {
    if (!hours) return '—';
    return `${hours.open} - ${hours.close}`;
  };

  const setPage = (page: number) => {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value));
    void fetchStores();
  };

  const addNewStore = () => {
    router.push({ name: 'AddStore' });
  };

  const viewStoreDetails = (store: StoreListItem) => {
    router.push({ name: 'StoreDetails', params: { id: store.id } });
  };

  const manageCashiers = (store: StoreListItem) => {
    router.push({ name: 'StoreCashiers', params: { id: store.id } });
  };

  const confirmDelete = async (store: StoreListItem) => {
    const confirmed = await confirmDanger({
      title: 'Delete store',
      message: `Are you sure you want to delete ${store.name}? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      icon: ['fas', 'trash'],
    });
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteStore(store.id);
      await Promise.all([fetchStats(), fetchStores()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete the store');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    statsLoading,
    statusOptions,
    filters,
    loading,
    error,
    stores,
    paginatedStores,
    totalItems,
    currentPage,
    totalPages,
    paginationStart,
    paginationEnd,
    getTypeBadgeVariant,
    formatHours,
    setPage,
    addNewStore,
    viewStoreDetails,
    manageCashiers,
    confirmDelete,
  };
}
