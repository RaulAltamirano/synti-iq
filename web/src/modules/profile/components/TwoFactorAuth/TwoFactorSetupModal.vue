<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button, Stepper, Spinner, InfoBanner } from '@/modules/ui/components';
import type { StepperStep } from '@/modules/ui/components';
import TotpInput from '@/modules/auth/components/TotpInput/TotpInput.vue';
import { useTheme } from '@/modules/shared/composables/useTheme';
import type { TwoFactorSetupData } from '../../interfaces/twoFactor.types';

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  verify: [code: string];
  copyBackupCodes: [];
  dismiss: [];
  retrySetup: [];
}>();

const WIZARD_STEPS: StepperStep[] = [
  { id: 1, title: 'Scan QR code', shortTitle: 'Scan', icon: 'qrcode' },
  { id: 2, title: 'Verify code', shortTitle: 'Verify', icon: 'key' },
  { id: 3, title: 'Backup codes', shortTitle: 'Backup', icon: 'copy' },
];

interface Props {
  isOpen: boolean;
  setupData: TwoFactorSetupData | null;
  isLoading: boolean;
  isVerifying: boolean;
  error: string | null;
  backupCodes: string[];
}

const { isDark } = useTheme();

const wizardSteps = WIZARD_STEPS;
const currentStep = ref(1);
const verificationCode = ref('');
const showVerifySuccess = ref(false);

watch(
  () => props.backupCodes,
  (codes) => {
    if (codes.length > 0 && currentStep.value === 2) {
      showVerifySuccess.value = true;
      setTimeout(() => {
        showVerifySuccess.value = false;
        currentStep.value = 3;
      }, 900);
    }
  },
  { deep: true }
);

const copySecret = async () => {
  if (!props.setupData?.secret) return;
  try {
    await navigator.clipboard.writeText(props.setupData.secret);
  } catch {
    // Fallback silently
  }
};

const nextStep = () => {
  if (currentStep.value < 3) currentStep.value++;
};

const previousStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

const handleVerify = () => {
  emit('verify', verificationCode.value);
};

const handleCopyBackupCodes = () => {
  emit('copyBackupCodes');
};

const handleDismiss = () => {
  emit('dismiss');
  emit('close');
};

const handleClose = () => {
  emit('close');
};

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') handleClose();
};

watch(
  () => props.isOpen,
  (open) => {
    if (!open) {
      currentStep.value = 1;
      verificationCode.value = '';
    }
    if (open) {
      globalThis.addEventListener('keydown', handleEscape);
    } else {
      globalThis.removeEventListener('keydown', handleEscape);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  globalThis.removeEventListener('keydown', handleEscape);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] overflow-y-auto">
      <div
        v-motion="{
          initial: { opacity: 0 },
          enter: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
          leave: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
        }"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm"
        @click="handleClose"
      />

      <div class="flex items-center justify-center min-h-screen p-4">
        <div
          v-motion="{
            initial: { opacity: 0, y: 20, scale: 0.98 },
            enter: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
            },
            leave: {
              opacity: 0,
              y: 20,
              scale: 0.98,
              transition: { duration: 0.2, ease: [0.36, 0.66, 0.04, 1] },
            },
          }"
          class="relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden mx-4"
          :class="isDark ? 'bg-gray-800' : 'bg-white'"
          role="dialog"
          aria-modal="true"
          aria-labelledby="two-factor-setup-modal-title"
          tabindex="-1"
          @click.stop
        >
          <div
            class="px-6 py-4 border-b flex items-center justify-between"
            :class="isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'"
          >
            <div class="flex items-center gap-3">
              <FontAwesomeIcon :icon="['fas', 'shield-alt']" class="h-5 w-5 text-purple-500" />
              <h2
                id="two-factor-setup-modal-title"
                class="text-xl font-bold"
                :class="isDark ? 'text-white' : 'text-gray-800'"
              >
                Enable two-factor authentication
              </h2>
            </div>
            <button
              type="button"
              class="p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              :class="
                isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              "
              aria-label="Close dialog"
              @click="handleClose"
            >
              <FontAwesomeIcon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <!-- Stepper -->
          <div
            class="px-6 py-4 border-b"
            :class="isDark ? 'border-gray-700 bg-gray-900/30' : 'border-gray-200 bg-gray-50'"
          >
            <Stepper v-model="currentStep" :steps="wizardSteps" :animated="true" />
          </div>

          <div class="overflow-y-auto max-h-[calc(100vh-14rem)]">
            <div class="p-6 space-y-4">
              <!-- Success feedback: check animation after verify -->
              <div
                v-if="showVerifySuccess"
                v-motion="{
                  initial: { opacity: 0, scale: 0.8 },
                  enter: {
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
                  },
                }"
                class="flex flex-col items-center justify-center py-16 space-y-4"
              >
                <div
                  class="w-20 h-20 rounded-full flex items-center justify-center"
                  :class="isDark ? 'bg-green-500/20' : 'bg-green-100'"
                >
                  <FontAwesomeIcon
                    :icon="['fas', 'check']"
                    class="w-10 h-10"
                    :class="isDark ? 'text-green-400' : 'text-green-600'"
                  />
                </div>
                <p
                  class="text-lg font-semibold"
                  :class="isDark ? 'text-green-400' : 'text-green-700'"
                >
                  Verified!
                </p>
                <p class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                  Finishing setup...
                </p>
              </div>

              <!-- Step 2: Verify -->
              <div v-else-if="currentStep === 2" class="space-y-4">
                <label
                  for="totp-verify-input"
                  class="block text-sm font-medium"
                  :class="isDark ? 'text-gray-300' : 'text-gray-700'"
                >
                  Enter the 6-digit verification code from your authenticator app:
                </label>
                <TotpInput
                  id="totp-verify-input"
                  v-model="verificationCode"
                  placeholder="000000"
                  :disabled="isVerifying"
                  :error="error"
                  :auto-submit-lengths="[6]"
                  @complete="handleVerify"
                />
              </div>

              <!-- Step 3: Backup codes -->
              <div
                v-else-if="currentStep === 3 && backupCodes.length > 0"
                v-motion="{
                  initial: { opacity: 0, y: 12 },
                  enter: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.3 },
                  },
                }"
                class="space-y-4"
              >
                <div
                  class="p-4 rounded-lg border"
                  :class="
                    isDark
                      ? 'bg-yellow-900/20 border-yellow-700/50'
                      : 'bg-yellow-50 border-yellow-200'
                  "
                >
                  <div class="flex items-start gap-3">
                    <FontAwesomeIcon
                      :icon="['fas', 'exclamation-triangle']"
                      class="w-5 h-5 shrink-0 mt-0.5"
                      :class="isDark ? 'text-yellow-400' : 'text-yellow-600'"
                    />
                    <div>
                      <p
                        class="font-medium text-sm"
                        :class="isDark ? 'text-yellow-300' : 'text-yellow-800'"
                      >
                        Save these backup codes
                      </p>
                      <p
                        class="text-xs mt-1"
                        :class="isDark ? 'text-yellow-400/80' : 'text-yellow-700'"
                      >
                        Use them if you lose access to your authenticator. Each code works only
                        once.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  class="grid grid-cols-2 gap-2 p-4 rounded-lg font-mono text-sm"
                  :class="isDark ? 'bg-gray-700/50' : 'bg-gray-100'"
                >
                  <div
                    v-for="code in backupCodes"
                    :key="code"
                    class="py-1.5 px-2 rounded text-center"
                    :class="isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'"
                  >
                    {{ code }}
                  </div>
                </div>
              </div>

              <!-- Step 1: QR + Secret -->
              <div v-else-if="currentStep === 1" class="space-y-4">
                <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 gap-3">
                  <Spinner size="md" />
                  <span class="text-sm" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                    Preparing setup...
                  </span>
                </div>

                <div v-else-if="error && !setupData" class="py-4">
                  <InfoBanner
                    variant="error"
                    title="Could not start setup"
                    :description="error"
                    :icon="['fas', 'exclamation-circle']"
                  >
                    <template #actions>
                      <Button variant="secondary" size="sm" @click="emit('retrySetup')">
                        Try again
                      </Button>
                    </template>
                  </InfoBanner>
                </div>

                <template v-else-if="setupData">
                  <p class="text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy,
                    etc.):
                  </p>
                  <div class="flex justify-center w-full">
                    <div
                      class="flex items-center justify-center p-4 rounded-lg shrink-0"
                      :class="isDark ? 'bg-white' : 'bg-white border border-gray-200'"
                    >
                      <img :src="setupData.qrCode" alt="Authenticator QR code" class="w-40 h-40" />
                    </div>
                  </div>
                  <div
                    class="flex items-center gap-3 p-3 rounded-lg"
                    :class="isDark ? 'bg-gray-700/50' : 'bg-gray-100'"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                        Or enter this code manually:
                      </p>
                      <code
                        class="font-mono text-sm font-bold tracking-wider block mt-1 truncate"
                        :class="isDark ? 'text-gray-200' : 'text-gray-800'"
                      >
                        {{ setupData.secret }}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      :icon="['fas', 'copy']"
                      aria-label="Copy secret code"
                      @click="copySecret"
                    >
                      Copy
                    </Button>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <div
            class="px-6 py-4 border-t flex flex-col sm:flex-row gap-3 justify-between"
            :class="isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'"
          >
            <Button
              v-if="currentStep > 1 && currentStep < 3"
              variant="ghost"
              :icon="['fas', 'arrow-left']"
              @click="previousStep"
            >
              Back
            </Button>
            <div v-else />
            <div class="flex gap-3">
              <Button v-if="currentStep < 3" variant="ghost" @click="handleClose"> Cancel </Button>
              <template v-if="currentStep === 1">
                <Button variant="primary" :disabled="!setupData || isLoading" @click="nextStep">
                  Continue
                </Button>
              </template>
              <template v-else-if="currentStep === 2">
                <Button
                  variant="primary"
                  :disabled="verificationCode.length !== 6 || isVerifying"
                  :loading="isVerifying"
                  @click="handleVerify"
                >
                  Verify
                </Button>
              </template>
              <template v-else-if="currentStep === 3">
                <Button variant="outline" :icon="['fas', 'copy']" @click="handleCopyBackupCodes">
                  Copy codes
                </Button>
                <Button variant="primary" @click="handleDismiss"> Done </Button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
