import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from '@/modules/shared/composables/useTheme';
import { useToast } from '@/modules/ui/composables/useToast';
import { getStoreById } from '@/modules/store/services/storeApi';
import { mapStoreApiToDetails } from '@/modules/store/utils/mapStoreFromApi';
import type { StoreDetails } from '@/modules/store/types/store-details.types';

export type StoreDetailsSection = 'name' | 'address' | 'salesTargets' | 'schedule';

export type StoreDetailsModalKind = 'identity' | 'salesTargets' | 'schedules';

export function useStoreDetailsPage() {
  const route = useRoute();
  const router = useRouter();
  const { isDark } = useTheme();
  const toast = useToast();

  const store = ref<StoreDetails | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const storeId = computed(() => route.params.id as string);

  const hasAddress = computed(() => {
    const s = store.value;
    if (!s) return false;
    return Boolean(s.address?.trim() || s.location?.fullAddress?.trim());
  });

  const hasSalesTargets = computed(() => {
    const s = store.value;
    if (!s) return false;
    return s.dailySalesTarget != null || s.monthlySalesTarget != null;
  });

  const hasSchedules = computed(() => {
    const s = store.value;
    if (!s) return false;
    return Boolean(s.schedules?.length);
  });

  const activeModal = ref<StoreDetailsModalKind | null>(null);

  function openModal(kind: StoreDetailsModalKind) {
    activeModal.value = kind;
  }

  function closeModal() {
    activeModal.value = null;
  }

  function handleIdentityModalSave() {
    toast.info(
      'Los cambios de identidad aún no se guardan en el servidor. El endpoint de actualización estará disponible próximamente.'
    );
    closeModal();
  }

  function handleSalesTargetsModalSave() {
    toast.info(
      'Las metas de ventas aún no se guardan en el servidor. El endpoint de actualización estará disponible próximamente.'
    );
    closeModal();
  }

  function onSectionAction(section: StoreDetailsSection) {
    if (section === 'address') {
      const locId = store.value?.location?.id;
      if (!locId) {
        toast.info(
          'Aún no hay una ubicación guardada para esta tienda. El alta completa llegará con el endpoint de creación de dirección.'
        );
        return;
      }
      void router.push({
        name: 'LocationEdit',
        params: { locationId: locId },
        query: {
          storeId: storeId.value,
          returnTo: route.fullPath,
        },
      });
      return;
    }
    if (section === 'name') {
      openModal('identity');
      return;
    }
    if (section === 'salesTargets') {
      openModal('salesTargets');
      return;
    }
    if (section === 'schedule') {
      openModal('schedules');
      return;
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

    try {
      const api = await getStoreById(id);
      store.value = mapStoreApiToDetails(api);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar la tienda';
      store.value = null;
    } finally {
      loading.value = false;
    }
  }

  function retry() {
    void loadStore();
  }

  function formatHours(open: string, close: string) {
    return `${open} - ${close}`;
  }

  function formatNumber(n: number) {
    return new Intl.NumberFormat('es-ES', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
  }

  watch(storeId, (newId) => {
    if (newId) void loadStore();
  });

  onMounted(() => {
    void loadStore();
  });

  return {
    store,
    loading,
    error,
    storeId,
    isDark,
    retry,
    formatHours,
    formatNumber,
    router,
    hasAddress,
    hasSalesTargets,
    hasSchedules,
    onSectionAction,
    activeModal,
    closeModal,
    handleIdentityModalSave,
    handleSalesTargetsModalSave,
  };
}
