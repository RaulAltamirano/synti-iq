import { ref, computed, onMounted } from 'vue';
import type { TwoFactorStatus, TwoFactorSetupData } from '../interfaces/twoFactor.types';
import * as twoFactorApi from '../services/twoFactorApi';

const TOTP_REGEX = /^\d{6}$/;
const BACKUP_CODE_REGEX = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;

function isValidCode(code: string, acceptBackupCode: boolean): boolean {
  if (TOTP_REGEX.test(code)) return true;
  if (acceptBackupCode && BACKUP_CODE_REGEX.test(code)) return true;
  return false;
}

export function useTwoFactorAuth() {
  const status = ref<TwoFactorStatus>({
    enabled: false,
    method: null,
    backupCodesRemaining: 0,
  });

  const isLoading = ref(false);
  const isStatusLoading = ref(true);
  const isVerifying = ref(false);
  const error = ref<string | null>(null);
  const setupData = ref<TwoFactorSetupData | null>(null);
  const showBackupCodes = ref(false);
  const backupCodes = ref<string[]>([]);

  const loadStatus = async (): Promise<void> => {
    isStatusLoading.value = true;
    try {
      const data = await twoFactorApi.fetchStatus();
      status.value = {
        enabled: data.enabled,
        method: data.method,
        backupCodesRemaining: data.backupCodesRemaining,
      };
    } catch {
      status.value = {
        enabled: false,
        method: null,
        backupCodesRemaining: 0,
      };
    } finally {
      isStatusLoading.value = false;
    }
  };

  const startSetup = async (password: string): Promise<TwoFactorSetupData | null> => {
    isLoading.value = true;
    error.value = null;
    setupData.value = null;

    try {
      const data = await twoFactorApi.startSetup(password);
      setupData.value = data;
      return data;
    } catch (err) {
      error.value = twoFactorApi.getErrorMessage(err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const verifyAndEnable = async (code: string, password: string): Promise<boolean> => {
    if (!TOTP_REGEX.test(code)) {
      error.value = 'Enter a 6-digit verification code';
      return false;
    }

    isVerifying.value = true;
    error.value = null;

    try {
      const result = await twoFactorApi.verifyAndEnable(code, password);
      backupCodes.value = result.backupCodes ?? [];
      showBackupCodes.value = true;
      status.value = {
        enabled: true,
        method: 'authenticator',
        backupCodesRemaining: backupCodes.value.length,
      };
      setupData.value = null;
      return true;
    } catch (err) {
      error.value = twoFactorApi.getErrorMessage(err);
      return false;
    } finally {
      isVerifying.value = false;
    }
  };

  const disable = async (code: string): Promise<boolean> => {
    if (!isValidCode(code, true)) {
      error.value = 'Enter a 6-digit code or a backup code (XXXX-XXXX-XXXX)';
      return false;
    }

    isVerifying.value = true;
    error.value = null;

    try {
      await twoFactorApi.disable(code);
      status.value = {
        enabled: false,
        method: null,
        backupCodesRemaining: 0,
      };
      setupData.value = null;
      backupCodes.value = [];
      showBackupCodes.value = false;
      return true;
    } catch (err) {
      error.value = twoFactorApi.getErrorMessage(err);
      return false;
    } finally {
      isVerifying.value = false;
    }
  };

  const regenerateBackupCodes = async (password: string): Promise<string[]> => {
    isLoading.value = true;
    error.value = null;

    try {
      const codes = await twoFactorApi.regenerateBackupCodes(password);
      backupCodes.value = codes;
      showBackupCodes.value = true;
      status.value = {
        ...status.value,
        backupCodesRemaining: codes.length,
      };
      return codes;
    } catch (err) {
      error.value = twoFactorApi.getErrorMessage(err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const dismissBackupCodes = (): void => {
    showBackupCodes.value = false;
  };

  const clearError = (): void => {
    error.value = null;
  };

  const isEnabled = computed(() => status.value.enabled);
  const methodLabel = computed(() =>
    status.value.method === 'authenticator' ? 'Authenticator app' : 'Not configured'
  );

  onMounted(() => {
    loadStatus();
  });

  return {
    status,
    isLoading,
    isStatusLoading,
    isVerifying,
    error,
    setupData,
    showBackupCodes,
    backupCodes,
    isEnabled,
    methodLabel,
    loadStatus,
    startSetup,
    verifyAndEnable,
    disable,
    regenerateBackupCodes,
    dismissBackupCodes,
    clearError,
  };
}
