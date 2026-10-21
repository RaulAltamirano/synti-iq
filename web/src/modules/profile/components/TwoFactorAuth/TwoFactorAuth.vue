<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, Badge, Skeleton, useToast } from '@/modules/ui/components';
import ProfileLoadErrorBanner from '../ProfileLoadErrorBanner/ProfileLoadErrorBanner.vue';
import TwoFactorSetupModal from './TwoFactorSetupModal.vue';
import TwoFactorDisableModal from './TwoFactorDisableModal.vue';
import TwoFactorBackupCodesModal from './TwoFactorBackupCodesModal.vue';
import { useTwoFactorAuth } from '../../composables/useTwoFactorAuth';
import { useTheme } from '@/modules/shared/composables/useTheme';

const emit = defineEmits<{
  ready: [];
}>();

const toast = useToast();
const { isDark } = useTheme();

const {
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
  startSetup,
  verifyAndEnable,
  disable,
  regenerateBackupCodes,
  dismissBackupCodes,
  clearError,
} = useTwoFactorAuth();

watch(
  isStatusLoading,
  (loading) => {
    if (!loading) emit('ready');
  },
  { immediate: true }
);

const showSetupModal = ref(false);
const currentPassword = ref('');
const showDisableModal = ref(false);
const disableSuccess = ref(false);
const isOpeningSetup = ref(false);
const cardError = ref<string | null>(null);

const showBackupCodesModal = computed(() => showBackupCodes.value && !showSetupModal.value);

const requirePassword = (): boolean => {
  if (currentPassword.value.trim()) return true;
  cardError.value = 'Enter your current password';
  return false;
};

const handleActivate = async () => {
  clearError();
  cardError.value = null;
  if (!requirePassword()) return;
  showSetupModal.value = true;
  isOpeningSetup.value = true;

  try {
    await startSetup(currentPassword.value);
  } finally {
    isOpeningSetup.value = false;
  }
};

const handleRetrySetup = async () => {
  clearError();
  if (!requirePassword()) return;
  await startSetup(currentPassword.value);
};

const handleDisable = () => {
  showDisableModal.value = true;
  clearError();
};

const handleSetupClose = () => {
  showSetupModal.value = false;
  clearError();
  currentPassword.value = '';
};

const handleSetupVerify = async (code: string) => {
  const enabled = await verifyAndEnable(code, currentPassword.value);
  if (enabled) currentPassword.value = '';
};

const handleSetupDismiss = () => {
  dismissBackupCodes();
  showSetupModal.value = false;
  currentPassword.value = '';
  toast.success('Two-factor authentication enabled');
};

const handleDisableClose = () => {
  showDisableModal.value = false;
  disableSuccess.value = false;
  clearError();
};

const handleDisableConfirm = async (code: string) => {
  const success = await disable(code);
  if (success) {
    disableSuccess.value = true;
    setTimeout(() => {
      showDisableModal.value = false;
      disableSuccess.value = false;
      toast.success('Two-factor authentication disabled');
    }, 900);
  }
};

const handleCopyBackupCodes = async () => {
  try {
    await navigator.clipboard.writeText(backupCodes.value.join('\n'));
    toast.success('Backup codes copied to clipboard');
  } catch {
    toast.error('Failed to copy backup codes');
  }
};

const handleBackupCodesClose = () => {
  dismissBackupCodes();
};

const handleBackupCodesDismiss = () => {
  dismissBackupCodes();
};

const handleRegenerateBackupCodes = async () => {
  cardError.value = null;
  if (!requirePassword()) return;
  const codes = await regenerateBackupCodes(currentPassword.value);
  if (codes.length > 0) currentPassword.value = '';
  if (codes.length === 0 && error.value) {
    cardError.value = error.value;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="isStatusLoading"
      class="p-4 rounded-xl border"
      :class="isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white'"
      aria-hidden="true"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-start gap-4 flex-1 min-w-0">
          <Skeleton variant="rectangular" :width="48" :height="48" class="rounded-xl shrink-0" />
          <div class="space-y-2 flex-1 min-w-0">
            <Skeleton variant="text" :height="16" class="w-44" />
            <Skeleton variant="text" :height="14" class="w-full max-w-sm" />
          </div>
        </div>
        <Skeleton variant="rectangular" :height="44" class="w-36 rounded-lg shrink-0" />
      </div>
    </div>

    <div
      v-else
      class="rounded-xl border overflow-hidden"
      :class="isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white'"
    >
      <div class="p-4 sm:p-5 space-y-4">
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            :class="
              isEnabled
                ? isDark
                  ? 'bg-success-500/10'
                  : 'bg-success-50'
                : isDark
                  ? 'bg-gray-700'
                  : 'bg-gray-100'
            "
          >
            <FontAwesomeIcon
              :icon="isEnabled ? ['fas', 'shield-check'] : ['fas', 'shield-halved']"
              class="w-6 h-6"
              :class="
                isEnabled
                  ? isDark
                    ? 'text-success-400'
                    : 'text-success-600'
                  : isDark
                    ? 'text-gray-500'
                    : 'text-gray-400'
              "
            />
          </div>

          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <h4
                class="font-semibold text-base"
                :class="isDark ? 'text-gray-100' : 'text-gray-900'"
              >
                Two-Factor Authentication
              </h4>
              <Badge :variant="isEnabled ? 'success' : 'default'" size="sm">
                {{ isEnabled ? 'Enabled' : 'Disabled' }}
              </Badge>
            </div>
            <p class="text-sm leading-relaxed" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
              {{
                isEnabled
                  ? `${methodLabel}. Your account requires a verification code when signing in.`
                  : 'Add an extra layer of security by requiring a code from your authenticator app at sign-in.'
              }}
            </p>
          </div>
        </div>

        <ProfileLoadErrorBanner
          v-if="cardError"
          :message="cardError"
          @retry="handleRegenerateBackupCodes"
        />

        <label class="block space-y-1 text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-700'">
          Current password
          <input
            v-model="currentPassword"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-lg border px-3 py-2"
            :class="
              isDark
                ? 'border-gray-600 bg-gray-900 text-gray-100'
                : 'border-gray-300 bg-white text-gray-900'
            "
          />
        </label>

        <div class="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            v-if="!isEnabled"
            variant="primary"
            size="md"
            :full-width="true"
            :icon="['fas', 'shield-alt']"
            icon-position="left"
            :loading="isOpeningSetup"
            @click="handleActivate"
          >
            Enable Two-Factor Authentication
          </Button>

          <template v-else>
            <Button
              variant="outline"
              size="md"
              :full-width="true"
              :icon="['fas', 'key']"
              icon-position="left"
              :loading="isLoading"
              @click="handleRegenerateBackupCodes"
            >
              Regenerate Backup Codes
            </Button>
            <Button
              variant="danger"
              size="md"
              :full-width="true"
              :icon="['fas', 'power-off']"
              icon-position="left"
              @click="handleDisable"
            >
              Disable 2FA
            </Button>
          </template>
        </div>
      </div>

      <div
        v-if="isEnabled"
        class="px-4 sm:px-5 py-3 border-t flex items-center gap-2 text-sm"
        :class="
          isDark
            ? 'border-gray-700 bg-gray-900/20 text-gray-400'
            : 'border-gray-100 bg-gray-50 text-gray-600'
        "
      >
        <FontAwesomeIcon :icon="['fas', 'key']" class="w-4 h-4 shrink-0" />
        <span
          >{{ status.backupCodesRemaining }} backup code{{
            status.backupCodesRemaining !== 1 ? 's' : ''
          }}
          remaining</span
        >
      </div>
    </div>

    <TwoFactorSetupModal
      :is-open="showSetupModal"
      :setup-data="setupData"
      :is-loading="isLoading"
      :is-verifying="isVerifying"
      :error="error"
      :backup-codes="backupCodes"
      @close="handleSetupClose"
      @verify="handleSetupVerify"
      @copy-backup-codes="handleCopyBackupCodes"
      @dismiss="handleSetupDismiss"
      @retry-setup="handleRetrySetup"
    />

    <TwoFactorDisableModal
      :is-open="showDisableModal"
      :is-verifying="isVerifying"
      :error="error"
      :show-success="disableSuccess"
      @close="handleDisableClose"
      @confirm="handleDisableConfirm"
    />

    <TwoFactorBackupCodesModal
      :is-open="showBackupCodesModal"
      :backup-codes="backupCodes"
      @close="handleBackupCodesClose"
      @copy="handleCopyBackupCodes"
      @dismiss="handleBackupCodesDismiss"
    />
  </div>
</template>
