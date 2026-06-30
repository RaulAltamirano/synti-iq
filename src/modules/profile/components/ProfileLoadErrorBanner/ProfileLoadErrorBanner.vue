<script setup lang="ts">
import InfoBanner from '@/modules/ui/components/InfoBanner/InfoBanner.vue';
import Button from '@/modules/ui/components/Button/Button.vue';

defineProps<{
  /** Detalle del error (mensaje de API, red, etc.). */
  message: string;
}>();

const emit = defineEmits<{
  retry: [];
}>();
</script>

<template>
  <InfoBanner
    variant="error"
    title="Unable to load this section"
    :description="message"
    :icon="['fas', 'exclamation-circle']"
  >
    <template #actions>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        class="min-h-[44px] cursor-pointer touch-manipulation transition-colors duration-200 sm:min-h-0"
        @click="emit('retry')"
      >
        Retry
      </Button>
    </template>
  </InfoBanner>
</template>
