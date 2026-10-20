<script setup lang="ts">
import { watch, onUnmounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button } from '@/modules/ui/components';
import { useTheme } from '@/modules/shared/composables/useTheme';

interface Props {
  isOpen: boolean;
  backupCodes: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  copy: [];
  dismiss: [];
}>();

const { isDark } = useTheme();

const handleClose = () => {
  emit('close');
};

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') handleClose();
};

watch(
  () => props.isOpen,
  (open) => {
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

const handleCopy = () => {
  emit('copy');
};

const handleDismiss = () => {
  emit('dismiss');
  emit('close');
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
          aria-labelledby="two-factor-backup-codes-modal-title"
          tabindex="-1"
          @click.stop
        >
          <div
            class="px-6 py-4 border-b flex items-center justify-between"
            :class="isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'"
          >
            <div class="flex items-center gap-3">
              <FontAwesomeIcon :icon="['fas', 'key']" class="h-5 w-5 text-yellow-500" />
              <h2
                id="two-factor-backup-codes-modal-title"
                class="text-xl font-bold"
                :class="isDark ? 'text-white' : 'text-gray-800'"
              >
                Backup codes
              </h2>
            </div>
            <button
              type="button"
              class="p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
            <div
              class="p-4 rounded-lg border"
              :class="
                isDark ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50 border-yellow-200'
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
                    Use them if you lose access to your authenticator. Each code works only once.
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

            <div class="flex gap-3">
              <Button variant="outline" :icon="['fas', 'copy']" class="flex-1" @click="handleCopy">
                Copy codes
              </Button>
              <Button variant="primary" class="flex-1" @click="handleDismiss"> Done </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
