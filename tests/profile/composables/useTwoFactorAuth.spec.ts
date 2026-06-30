import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h } from 'vue';
import { useTwoFactorAuth } from '@/modules/profile/composables/useTwoFactorAuth';
import * as twoFactorApi from '@/modules/profile/services/twoFactorApi';

vi.mock('@/modules/profile/services/twoFactorApi', async (importOriginal) => {
  const mod = await importOriginal<
    typeof import('@/modules/profile/services/twoFactorApi')
  >();
  return {
    ...mod,
    fetchStatus: vi.fn(),
    startSetup: vi.fn(),
    verifyAndEnable: vi.fn(),
    disable: vi.fn(),
    regenerateBackupCodes: vi.fn(),
  };
});

async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function mountTwoFactorAuth() {
  let result: ReturnType<typeof useTwoFactorAuth> | null = null;
  const app = createApp(
    defineComponent({
      setup() {
        result = useTwoFactorAuth();
        return () => h('div');
      },
    })
  );
  const el = document.createElement('div');
  document.body.appendChild(el);
  app.mount(el);
  return {
    get composable() {
      return result!;
    },
    unmount: () => {
      app.unmount();
      el.remove();
    },
  };
}

describe('useTwoFactorAuth', () => {
  const mockStatus = {
    enabled: false,
    method: null as string | null,
    backupCodesRemaining: 0,
  };

  const mockSetupData = {
    secret: 'JBSWY3DPEHPK3PXP',
    qrCode: 'data:image/png;base64,abc123',
  };

  const mockBackupCodes = ['ABCD-1234-EFGH', 'IJKL-5678-MNOP'];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(twoFactorApi.fetchStatus).mockResolvedValue(mockStatus);
  });

  describe('loadStatus', () => {
    it('fetches status on mount', async () => {
      const wrapper = mountTwoFactorAuth();
      await flushPromises();
      expect(twoFactorApi.fetchStatus).toHaveBeenCalled();
      wrapper.unmount();
    });

    it('sets status from API on successful load', async () => {
      vi.mocked(twoFactorApi.fetchStatus).mockResolvedValue({
        enabled: true,
        method: 'authenticator',
        backupCodesRemaining: 5,
      });

      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { status } = wrapper.composable;
      expect(status.value).toMatchObject({
        enabled: true,
        method: 'authenticator',
        backupCodesRemaining: 5,
      });
      wrapper.unmount();
    });

    it('sets default status on load error', async () => {
      vi.mocked(twoFactorApi.fetchStatus).mockRejectedValue(new Error('Network error'));

      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { status } = wrapper.composable;
      expect(status.value).toMatchObject({
        enabled: false,
        method: null,
      });
      wrapper.unmount();
    });
  });

  describe('startSetup', () => {
    it('returns setup data on success', async () => {
      vi.mocked(twoFactorApi.startSetup).mockResolvedValue(mockSetupData);

      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { startSetup, setupData } = wrapper.composable;
      const result = await startSetup();

      expect(result).toEqual(mockSetupData);
      expect(setupData.value).toEqual(mockSetupData);
      expect(twoFactorApi.startSetup).toHaveBeenCalled();
      wrapper.unmount();
    });

    it('sets error and returns null on failure', async () => {
      vi.mocked(twoFactorApi.startSetup).mockRejectedValue(new Error('Setup failed'));

      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { startSetup, error, setupData } = wrapper.composable;
      const result = await startSetup();

      expect(result).toBeNull();
      expect(error.value).toBeTruthy();
      expect(setupData.value).toBeNull();
      wrapper.unmount();
    });
  });

  describe('verifyAndEnable', () => {
    it('enables 2FA and shows backup codes on valid TOTP', async () => {
      vi.mocked(twoFactorApi.verifyAndEnable).mockResolvedValue({
        backupCodes: mockBackupCodes,
      });

      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { verifyAndEnable, status, backupCodes, showBackupCodes } = wrapper.composable;
      const success = await verifyAndEnable('123456');

      expect(success).toBe(true);
      expect(status.value).toMatchObject({ enabled: true, method: 'authenticator' });
      expect(backupCodes.value).toEqual(mockBackupCodes);
      expect(showBackupCodes.value).toBe(true);
      expect(twoFactorApi.verifyAndEnable).toHaveBeenCalledWith('123456');
      wrapper.unmount();
    });

    it('returns false and sets error for invalid code format', async () => {
      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { verifyAndEnable, error } = wrapper.composable;
      const success = await verifyAndEnable('12');

      expect(success).toBe(false);
      expect(error.value).toContain('6-digit');
      expect(twoFactorApi.verifyAndEnable).not.toHaveBeenCalled();
      wrapper.unmount();
    });

    it('returns false on API error', async () => {
      vi.mocked(twoFactorApi.verifyAndEnable).mockRejectedValue(
        new Error('Invalid TOTP code')
      );

      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { verifyAndEnable, error } = wrapper.composable;
      const success = await verifyAndEnable('123456');

      expect(success).toBe(false);
      expect(error.value).toBeTruthy();
      wrapper.unmount();
    });
  });

  describe('disable', () => {
    it('disables 2FA with valid TOTP code', async () => {
      vi.mocked(twoFactorApi.disable).mockResolvedValue({ message: '2FA disabled' });

      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { status, disable } = wrapper.composable;
      (status as { value: object }).value = {
        enabled: true,
        method: 'authenticator',
        backupCodesRemaining: 2,
      };

      const success = await disable('123456');

      expect(success).toBe(true);
      expect(status.value).toMatchObject({ enabled: false, method: null });
      expect(twoFactorApi.disable).toHaveBeenCalledWith('123456');
      wrapper.unmount();
    });

    it('disables 2FA with valid backup code', async () => {
      vi.mocked(twoFactorApi.disable).mockResolvedValue({ message: '2FA disabled' });

      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { status, disable } = wrapper.composable;
      (status as { value: object }).value = {
        enabled: true,
        method: 'authenticator',
        backupCodesRemaining: 2,
      };

      const success = await disable('ABCD-1234-EFGH');

      expect(success).toBe(true);
      expect(twoFactorApi.disable).toHaveBeenCalledWith('ABCD-1234-EFGH');
      wrapper.unmount();
    });

    it('returns false for invalid code format', async () => {
      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { disable, error } = wrapper.composable;
      const success = await disable('invalid');

      expect(success).toBe(false);
      expect(error.value).toContain('6-digit');
      expect(twoFactorApi.disable).not.toHaveBeenCalled();
      wrapper.unmount();
    });

    it('returns false on API error', async () => {
      vi.mocked(twoFactorApi.disable).mockRejectedValue(
        new Error('Invalid TOTP or backup code')
      );

      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { status, disable } = wrapper.composable;
      (status as { value: object }).value = {
        enabled: true,
        method: 'authenticator',
        backupCodesRemaining: 2,
      };

      const success = await disable('123456');

      expect(success).toBe(false);
      wrapper.unmount();
    });
  });

  describe('regenerateBackupCodes', () => {
    it('returns new backup codes on success', async () => {
      vi.mocked(twoFactorApi.regenerateBackupCodes).mockResolvedValue(mockBackupCodes);

      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { status, regenerateBackupCodes, backupCodes, showBackupCodes } =
        wrapper.composable;
      (status as { value: object }).value = {
        enabled: true,
        method: 'authenticator',
        backupCodesRemaining: 1,
      };

      const result = await regenerateBackupCodes();

      expect(result).toEqual(mockBackupCodes);
      expect(backupCodes.value).toEqual(mockBackupCodes);
      expect(showBackupCodes.value).toBe(true);
      expect((status as { value: object }).value).toMatchObject({
        backupCodesRemaining: mockBackupCodes.length,
      });
      expect(twoFactorApi.regenerateBackupCodes).toHaveBeenCalled();
      wrapper.unmount();
    });

    it('returns empty array and sets error on failure', async () => {
      vi.mocked(twoFactorApi.regenerateBackupCodes).mockRejectedValue(
        new Error('2FA not enabled')
      );

      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { regenerateBackupCodes, error } = wrapper.composable;
      const result = await regenerateBackupCodes();

      expect(result).toEqual([]);
      expect(error.value).toBeTruthy();
      wrapper.unmount();
    });
  });

  describe('dismissBackupCodes and clearError', () => {
    it('dismissBackupCodes sets showBackupCodes to false', async () => {
      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { showBackupCodes, dismissBackupCodes } = wrapper.composable;
      showBackupCodes.value = true;
      dismissBackupCodes();
      expect(showBackupCodes.value).toBe(false);
      wrapper.unmount();
    });

    it('clearError sets error to null', async () => {
      const wrapper = mountTwoFactorAuth();
      await flushPromises();

      const { error, clearError } = wrapper.composable;
      error.value = 'Some error';
      clearError();
      expect(error.value).toBeNull();
      wrapper.unmount();
    });
  });
});
