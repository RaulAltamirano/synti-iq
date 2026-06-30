import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, ref } from 'vue';

import { useStoreDetailsPage } from '@/modules/store/composables/useStoreDetailsPage';
import type { StoreApi } from '@/modules/store/types/store-api.types';

const mocks = vi.hoisted(() => ({
  toastInfo: vi.fn(),
  getStoreById: vi.fn(),
  routerPush: vi.fn(),
}));

vi.mock('@/modules/store/services/storeApi', () => ({
  getStoreById: mocks.getStoreById,
}));

vi.mock('@/modules/ui/composables/useToast', () => ({
  useToast: () => ({
    info: mocks.toastInfo,
    show: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    hide: vi.fn(),
    state: { value: {} },
  }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: 'store-uuid-1' },
    fullPath: '/store/store-uuid-1',
  }),
  useRouter: () => ({ push: mocks.routerPush }),
}));

vi.mock('@/modules/shared/composables/useTheme', () => ({
  useTheme: () => ({
    isDark: ref(false),
    themeStore: {},
  }),
}));

const sampleApi: StoreApi = {
  id: 'store-uuid-1',
  name: 'Downtown',
  businessProfileId: 'bp-1',
  isActive: true,
  storeType: 'RETAIL',
  dailySalesTarget: 100,
  monthlySalesTarget: 2000,
  schedules: [
    {
      id: 's1',
      dayOfWeek: 'monday',
      openTime: '08:00:00',
      closeTime: '18:00:00',
    },
  ],
};

function flushPromises(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function mountUseStoreDetailsPage(): {
  api: ReturnType<typeof useStoreDetailsPage>;
  unmount: () => void;
} {
  const holder: { api: ReturnType<typeof useStoreDetailsPage> | null } = { api: null };
  const app = createApp(
    defineComponent({
      setup() {
        holder.api = useStoreDetailsPage();
        return () => h('div');
      },
    })
  );
  const el = document.createElement('div');
  document.body.appendChild(el);
  app.mount(el);
  if (!holder.api) {
    throw new Error('useStoreDetailsPage did not initialize');
  }
  return {
    api: holder.api,
    unmount: () => {
      app.unmount();
      el.remove();
    },
  };
}

describe('useStoreDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getStoreById.mockResolvedValue(sampleApi);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('opens identity modal when section name is triggered', async () => {
    const { api, unmount } = mountUseStoreDetailsPage();
    await flushPromises();
    expect(api.store.value).not.toBeNull();

    api.onSectionAction('name');
    expect(api.activeModal.value).toBe('identity');

    api.handleIdentityModalSave();
    expect(mocks.toastInfo).toHaveBeenCalledWith(expect.stringContaining('identidad'));
    expect(api.activeModal.value).toBeNull();

    unmount();
  });

  it('opens sales targets modal and save shows toast without refetching store', async () => {
    const { api, unmount } = mountUseStoreDetailsPage();
    await flushPromises();
    mocks.getStoreById.mockClear();

    api.onSectionAction('salesTargets');
    expect(api.activeModal.value).toBe('salesTargets');

    api.handleSalesTargetsModalSave();
    expect(mocks.toastInfo).toHaveBeenCalledWith(expect.stringContaining('metas'));
    expect(api.activeModal.value).toBeNull();
    expect(mocks.getStoreById).not.toHaveBeenCalled();

    unmount();
  });

  it('opens schedules modal for schedule section', async () => {
    const { api, unmount } = mountUseStoreDetailsPage();
    await flushPromises();

    api.onSectionAction('schedule');
    expect(api.activeModal.value).toBe('schedules');

    api.closeModal();
    expect(api.activeModal.value).toBeNull();

    unmount();
  });
});
