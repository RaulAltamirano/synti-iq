import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h } from 'vue';

import { useStoreDashboard } from '@/modules/store/composables/useStoreDashboard';
import type { StoreListItem } from '@/modules/store/types/store-dashboard.types';

const dashboardMocks = vi.hoisted(() => ({
  confirmDanger: vi.fn(),
  setLoading: vi.fn(),
  toastError: vi.fn(),
  deleteStore: vi.fn(),
  listStores: vi.fn(),
  routerPush: vi.fn(),
}));

vi.mock('@/modules/store/services/storeApi', () => ({
  listStores: dashboardMocks.listStores,
  deleteStore: dashboardMocks.deleteStore,
}));

vi.mock('@/modules/shared/composables/useConfirmModal', () => ({
  useConfirmModal: () => ({
    confirmDanger: dashboardMocks.confirmDanger,
    setLoading: dashboardMocks.setLoading,
  }),
}));

vi.mock('@/modules/ui/composables/useToast', () => ({
  useToast: () => ({
    error: dashboardMocks.toastError,
    show: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    hide: vi.fn(),
    state: { value: {} },
  }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: dashboardMocks.routerPush }),
}));

const sampleStore: StoreListItem = {
  id: 'store-uuid-1',
  name: 'Downtown',
  storeType: 'RETAIL',
  address: '123 Main',
  isActive: true,
  openingHours: null,
  cashiersCount: 0,
};

function flushPromises(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function mountUseStoreDashboard(): {
  api: ReturnType<typeof useStoreDashboard>;
  unmount: () => void;
} {
  const holder: { api: ReturnType<typeof useStoreDashboard> | null } = { api: null };
  const app = createApp(
    defineComponent({
      setup() {
        holder.api = useStoreDashboard();
        return () => h('div');
      },
    })
  );
  const el = document.createElement('div');
  document.body.appendChild(el);
  app.mount(el);
  if (!holder.api) {
    throw new Error('useStoreDashboard did not initialize');
  }
  return {
    api: holder.api,
    unmount: () => {
      app.unmount();
      el.remove();
    },
  };
}

describe('useStoreDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dashboardMocks.listStores.mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 1,
    });
    dashboardMocks.confirmDanger.mockResolvedValue(false);
    dashboardMocks.deleteStore.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('confirmDelete', () => {
    it('does not call deleteStore when the user cancels the modal', async () => {
      dashboardMocks.confirmDanger.mockResolvedValueOnce(false);
      const { api, unmount } = mountUseStoreDashboard();
      await flushPromises();

      await api.confirmDelete(sampleStore);

      expect(dashboardMocks.deleteStore).not.toHaveBeenCalled();
      unmount();
    });

    it('calls deleteStore and refreshes list data when the user confirms', async () => {
      dashboardMocks.confirmDanger.mockResolvedValueOnce(true);
      const { api, unmount } = mountUseStoreDashboard();
      await flushPromises();
      const listCallsAfterMount = dashboardMocks.listStores.mock.calls.length;

      await api.confirmDelete(sampleStore);

      expect(dashboardMocks.confirmDanger).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Delete store',
          confirmText: 'Delete',
          cancelText: 'Cancel',
        })
      );
      expect(dashboardMocks.deleteStore).toHaveBeenCalledWith('store-uuid-1');
      expect(dashboardMocks.setLoading).toHaveBeenCalledWith(true);
      expect(dashboardMocks.setLoading).toHaveBeenCalledWith(false);
      expect(dashboardMocks.listStores.mock.calls.length).toBeGreaterThan(listCallsAfterMount);
      unmount();
    });

    it('shows a toast when deleteStore fails', async () => {
      dashboardMocks.confirmDanger.mockResolvedValueOnce(true);
      dashboardMocks.deleteStore.mockRejectedValueOnce(new Error('Network error'));
      const { api, unmount } = mountUseStoreDashboard();
      await flushPromises();

      await api.confirmDelete(sampleStore);

      expect(dashboardMocks.toastError).toHaveBeenCalledWith('Network error');
      expect(dashboardMocks.setLoading).toHaveBeenCalledWith(false);
      unmount();
    });
  });
});
