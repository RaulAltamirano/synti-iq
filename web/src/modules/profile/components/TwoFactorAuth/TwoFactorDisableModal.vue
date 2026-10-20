<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button } from '@/modules/ui/components';
import TotpInput from '@/modules/auth/components/TotpInput/TotpInput.vue';
import { useTheme } from '@/modules/shared/composables/useTheme';

const props = withDefaults(defineProps<Props>(), {
  showSuccess: false,
});
const emit = defineEmits<{
  close: [];
  confirm: [code: string];
}>();
const TOTP_REGEX = /^\d{6}$/;
const BACKUP_CODE_REGEX = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;

interface Props {
  isOpen: boolean;
  isVerifying: boolean;
  error: string | null;
  showSuccess?: boolean;
}

const { isDark } = useTheme();

const disableCode = ref('');

const isDisableCodeValid = computed(() => {
  const code = disableCode.value.trim();
  return TOTP_REGEX.test(code) || BACKUP_CODE_REGEX.test(code);
});

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
      disableCode.value = '';
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

const handleConfirm = () => {
  emit('confirm', disableCode.value.trim());
};

const handleComplete = () => {
  if (isDisableCodeValid.value) {
    handleConfirm();
  }
};
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
          aria-labelledby="two-factor-disable-modal-title"
          tabindex="-1"
          @click.stop
        >
          <div
            class="px-6 py-4 border-b flex items-center justify-between"
            :class="isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'"
          >
            <div class="flex items-center gap-3">
              <FontAwesomeIcon :icon="['fas', 'shield-alt']" class="h-5 w-5 text-red-500" />
              <h2
                id="two-factor-disable-modal-title"
                class="text-xl font-bold"
                :class="isDark ? 'text-white' : 'text-gray-800'"
              >
                Disable two-factor authentication
              </h2>
            </div>
            <button
              type="button"
              class="p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              :class="
                isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              "
              aria-label="Close dialog"
              @click="handleClose"
            >
              <FontAwesomeIcon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- Success feedback -->
            <div
              v-if="showSuccess"
              v-motion="{
                initial: { opacity: 0, scale: 0.9 },
                enter: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
                },
              }"
              class="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <div
                v-motion="{
                  initial: { scale: 0 },
                  enter: {
                    scale: 1,
                    transition: {
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                      mass: 0.5,
                    },
                  },
                }"
                class="w-16 h-16 rounded-full flex items-center justify-center"
                :class="isDark ? 'bg-green-500/20' : 'bg-green-100'"
              >
                <FontAwesomeIcon
                  :icon="['fas', 'check']"
                  class="w-8 h-8"
                  :class="isDark ? 'text-green-400' : 'text-green-600'"
                />
              </div>
              <p
                class="text-lg font-semibold"
                :class="isDark ? 'text-green-400' : 'text-green-700'"
              >
                Disabled successfully
              </p>
            </div>

            <template v-else>
              <div
                class="p-4 rounded-lg border"
                :class="isDark ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'"
              >
                <p class="text-sm" :class="isDark ? 'text-red-300' : 'text-red-700'">
                  To disable two-factor authentication, enter the 6-digit code from your
                  authenticator app or a backup code (XXXX-XXXX-XXXX):
                </p>
              </div>

              <TotpInput
                v-model="disableCode"
                placeholder="000000 o XXXX-XXXX-XXXX"
                :disabled="isVerifying"
                :error="error"
                :accept-backup-code="true"
                :auto-submit-lengths="[6, 14]"
                @complete="handleComplete"
              />

              <div class="flex gap-3">
                <Button variant="ghost" class="flex-1" @click="handleClose"> Cancel </Button>
                <Button
                  variant="danger"
                  class="flex-1"
                  :disabled="!isDisableCodeValid || isVerifying"
                  :loading="isVerifying"
                  @click="handleConfirm"
                >
                  Disable
                </Button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
