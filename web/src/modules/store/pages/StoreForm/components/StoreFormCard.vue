<script setup lang="ts">
import { Card } from '@/modules/ui';
import { STORE_FORM_SECTION_DIVIDER_CLASSES } from '@/modules/store/composables/store-form-wizard.constants';
</script>

<template>
  <Card variant="default" padding="lg">
    <div :class="STORE_FORM_SECTION_DIVIDER_CLASSES">
      <slot />
    </div>
  </Card>
</template>
