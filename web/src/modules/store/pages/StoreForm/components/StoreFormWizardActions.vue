<script setup lang="ts">
import { Button } from '@/modules/ui';

interface Props {
  currentStep: number;
  totalSteps: number;
  isSubmitting?: boolean;
  isDark?: boolean;
}

withDefaults(defineProps<Props>(), {
  isSubmitting: false,
  isDark: false,
});

const emit = defineEmits<{
  back: [];
  cancel: [];
}>();
</script>

<template>
  <div class="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
    <Button
      v-if="currentStep > 1"
      type="button"
      variant="secondary"
      class="min-h-11 w-full touch-manipulation sm:w-auto"
      @click="emit('back')"
    >
      Back
    </Button>

    <Button
      v-if="currentStep === 1"
      type="button"
      variant="ghost"
      class="min-h-11 w-full touch-manipulation sm:order-first sm:w-auto"
      @click="emit('cancel')"
    >
      Cancel
    </Button>

    <div class="flex flex-1 gap-3 sm:justify-end">
      <Button
        v-if="currentStep < totalSteps"
        type="submit"
        variant="primary"
        class="min-h-11 flex-1 touch-manipulation sm:flex-none"
      >
        Next
      </Button>
      <Button
        v-else
        type="submit"
        variant="primary"
        class="min-h-11 flex-1 touch-manipulation sm:flex-none"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        Create store
      </Button>
    </div>
  </div>

  <button
    v-if="currentStep > 1"
    type="button"
    class="mt-3 min-h-11 rounded text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation sm:mt-2 sm:min-h-0"
    :class="isDark ? 'text-gray-400' : 'text-gray-500'"
    @click="emit('cancel')"
  >
    Cancel
  </button>
</template>
