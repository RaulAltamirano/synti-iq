import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useDebounce } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';
import { useConfirmModal } from '@/modules/shared/composables/useConfirmModal';
import {
  assignCashierToStore,
  getStoreById,
  getStoreCashierAssignmentCandidates,
  getStoreCashiersPaginated,
  removeCashiersFromStore,
} from '@/modules/store/services/storeApi';
import {
  mapCashierApiToView,
  mapCashierProfileToAssignAutocompleteOption,
  mapStoreApiToDetails,
} from '@/modules/store/utils/mapStoreFromApi';
import type { CashierProfileApi } from '@/modules/store/types/store-api.types';
import type { StoreCashier, StoreDetails } from '@/modules/store/types/store-details.types';
import type { AutocompleteOption } from '@/modules/ui/components';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PAGE_SIZE = 10;
const ASSIGN_AUTOCOMPLETE_LIMIT = 25;

function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

function matchesCashierSearch(c: CashierProfileApi, q: string): boolean {
  const qn = q.trim().toLowerCase();
  if (!qn) return true;
  const u = c.user;
  const full = u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim().toLowerCase() : '';
  const email = (u?.email ?? '').toLowerCase();
  const cnum = (c.cashierNumber ?? '').toLowerCase();
  const branch = (c.branchOffice ?? '').toLowerCase();
  return full.includes(qn) || email.includes(qn) || cnum.includes(qn) || branch.includes(qn);
}

async function fetchAllCashiersRaw(storeId: string): Promise<CashierProfileApi[]> {
  const all: CashierProfileApi[] = [];
  let page = 1;
  const limit = 100;
  let hasMore = true;
  while (hasMore) {
    const res = await getStoreCashiersPaginated(storeId, {
      page,
      limit,
      sortBy: 'cashierNumber',
      sortOrder: 'ASC',
    });
    all.push(...res.items);
    hasMore = page < res.totalPages && res.items.length > 0;
    page += 1;
  }
  return all;
}

export function useStoreCashiersPage() {
  const route = useRoute();
  const router = useRouter();

  const store = ref<StoreDetails | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const cashiersLoading = ref(false);
  const cashiersList = ref<StoreCashier[]>([]);
  const cashiersTotal = ref(0);
  const cashiersPage = ref(1);
  const cashierSearchQuery = ref('');
  const debouncedSearch = useDebounce(cashierSearchQuery, 320);
  /** Bumps when store data is refreshed so the list reloads even if store id is unchanged. */
  const cashiersRefreshNonce = ref(0);
  /** Tracks last search string applied to avoid resetting page unnecessarily. */
  const lastAppliedSearch = ref<string | null>(null);

  const cashiersToAssign = ref<AutocompleteOption<string>[]>([]);
  const assignSubmitting = ref(false);
  const removeSubmitting = ref(false);
  const selectedCashierIds = ref<string[]>([]);

  const { confirmDanger, setLoading } = useConfirmModal();

  const storeId = computed(() => route.params.id as string);

  const assignedCashierProfileIds = computed(() => {
    const ids = store.value?.assignedCashierProfileIds;
    if (ids?.length) return ids;
    return (store.value?.cashiers ?? []).map((c) => String(c.id));
  });

  async function loadCashiersList(): Promise<void> {
    const id = storeId.value;
    if (!id || !store.value) return;

    const q = debouncedSearch.value.trim();
    if (lastAppliedSearch.value !== q) {
      lastAppliedSearch.value = q;
      if (cashiersPage.value !== 1) {
        cashiersPage.value = 1;
        return;
      }
    }

    cashiersLoading.value = true;
    try {
      if (!q) {
        const res = await getStoreCashiersPaginated(id, {
          page: cashiersPage.value,
          limit: PAGE_SIZE,
          sortBy: 'cashierNumber',
          sortOrder: 'ASC',
        });
        cashiersList.value = res.items.map(mapCashierApiToView);
        cashiersTotal.value = res.total;
      } else {
        const all = await fetchAllCashiersRaw(id);
        const filtered = all.filter((c) => matchesCashierSearch(c, q));
        cashiersTotal.value = filtered.length;
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        if (cashiersPage.value > totalPages) {
          cashiersPage.value = 1;
        }
        const start = (cashiersPage.value - 1) * PAGE_SIZE;
        cashiersList.value = filtered.slice(start, start + PAGE_SIZE).map(mapCashierApiToView);
      }
    } catch {
      cashiersList.value = [];
      cashiersTotal.value = 0;
    } finally {
      cashiersLoading.value = false;
    }
  }

  async function loadStore() {
    const id = storeId.value;
    if (!id) {
      error.value = 'ID de tienda no encontrado';
      loading.value = false;
      return;
    }

    loading.value = true;
    error.value = null;
    store.value = null;
    cashiersList.value = [];
    cashiersTotal.value = 0;
    lastAppliedSearch.value = null;

    try {
      const api = await getStoreById(id);
      store.value = mapStoreApiToDetails(api);
      selectedCashierIds.value = [];
      cashiersPage.value = 1;
      cashiersRefreshNonce.value += 1;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar la tienda';
      store.value = null;
      selectedCashierIds.value = [];
      cashiersList.value = [];
      cashiersTotal.value = 0;
    } finally {
      loading.value = false;
    }
  }

  function retry() {
    void loadStore();
  }

  const assignedCashiersCount = computed(() => assignedCashierProfileIds.value.length);

  const selectedCount = computed(() => selectedCashierIds.value.length);

  const cashiersTotalPages = computed(() =>
    Math.max(1, Math.ceil(cashiersTotal.value / PAGE_SIZE))
  );

  const paginationStart = computed(() =>
    cashiersTotal.value === 0 ? 0 : (cashiersPage.value - 1) * PAGE_SIZE
  );

  const paginationEnd = computed(() =>
    Math.min(cashiersPage.value * PAGE_SIZE, cashiersTotal.value)
  );

  const allSelected = computed(
    () =>
      cashiersList.value.length > 0 &&
      cashiersList.value.every((c) => selectedCashierIds.value.includes(String(c.id)))
  );

  function isCashierSelected(id: string | number): boolean {
    return selectedCashierIds.value.includes(String(id));
  }

  function toggleCashierSelection(id: string | number): void {
    const sid = String(id);
    const set = new Set(selectedCashierIds.value);
    if (set.has(sid)) set.delete(sid);
    else set.add(sid);
    selectedCashierIds.value = [...set];
  }

  function selectAllCashiers(): void {
    if (!cashiersList.value.length) return;
    selectedCashierIds.value = cashiersList.value.map((c) => String(c.id));
  }

  function clearCashierSelection(): void {
    selectedCashierIds.value = [];
  }

  function toggleSelectAllCashiers(): void {
    if (allSelected.value) clearCashierSelection();
    else selectAllCashiers();
  }

  async function handleRemoveSelectedCashiers(): Promise<void> {
    if (selectedCashierIds.value.length === 0) return;

    const confirmed = await confirmDanger({
      title: 'Quitar cajeros de la tienda',
      message: `Se archivarán ${selectedCashierIds.value.length} cajero(s) y dejarán de aparecer en esta tienda. ¿Continuar?`,
      confirmText: 'Quitar',
      cancelText: 'Cancelar',
      icon: ['fas', 'user-minus'],
    });
    if (!confirmed) return;

    removeSubmitting.value = true;
    setLoading(true);
    try {
      await removeCashiersFromStore(storeId.value, selectedCashierIds.value);
      selectedCashierIds.value = [];
      await loadStore();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo quitar los cajeros');
    } finally {
      setLoading(false);
      removeSubmitting.value = false;
    }
  }

  async function handleAssignCashier() {
    if (cashiersToAssign.value.length === 0) return;

    const invalid = cashiersToAssign.value.filter((o) => !isUuid(String(o.value)));
    if (invalid.length > 0) {
      alert('Todos los cajeros deben tener un UUID de perfil válido.');
      return;
    }

    assignSubmitting.value = true;
    try {
      for (const opt of cashiersToAssign.value) {
        await assignCashierToStore(storeId.value, String(opt.value).trim());
      }
      cashiersToAssign.value = [];
      await loadStore();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo asignar uno o más cajeros');
    } finally {
      assignSubmitting.value = false;
    }
  }

  watch([debouncedSearch, cashiersPage, cashiersRefreshNonce], () => {
    if (!store.value?.id) return;
    void loadCashiersList();
  });

  watch(storeId, (newId) => {
    if (newId) void loadStore();
  });

  onMounted(() => {
    void loadStore();
  });

  function formatShortDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(iso)
      );
    } catch {
      return '—';
    }
  }

  function formatClock(iso: string | null | undefined): string {
    if (!iso) return '—';
    const m = iso.match(/^(\d{1,2}):(\d{2})/);
    if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
    try {
      return new Intl.DateTimeFormat('es', { timeStyle: 'short' }).format(new Date(iso));
    } catch {
      return '—';
    }
  }

  function scrollToAssignSection(): void {
    void nextTick(() => {
      document.getElementById('store-cashiers-assign')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  async function fetchCashierAssignSuggestions(
    query: string
  ): Promise<AutocompleteOption<string>[]> {
    const id = storeId.value;
    const q = query.trim();
    if (!id || q.length < 2) return [];
    try {
      const res = await getStoreCashierAssignmentCandidates(id, {
        q,
        page: 1,
        limit: ASSIGN_AUTOCOMPLETE_LIMIT,
      });
      return res.items.map(mapCashierProfileToAssignAutocompleteOption);
    } catch {
      return [];
    }
  }

  return {
    store,
    loading,
    cashiersLoading,
    error,
    storeId,
    cashiersToAssign,
    assignedCashierProfileIds,
    assignSubmitting,
    removeSubmitting,
    assignedCashiersCount,
    cashiersList,
    cashiersTotal,
    cashiersPage,
    cashiersTotalPages,
    paginationStart,
    paginationEnd,
    cashierSearchQuery,
    selectedCount,
    allSelected,
    selectedCashierIds,
    isCashierSelected,
    toggleCashierSelection,
    selectAllCashiers,
    clearCashierSelection,
    toggleSelectAllCashiers,
    handleRemoveSelectedCashiers,
    retry,
    handleAssignCashier,
    router,
    formatShortDate,
    formatClock,
    scrollToAssignSection,
    fetchCashierAssignSuggestions,
  };
}
