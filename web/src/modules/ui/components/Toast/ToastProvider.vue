<script setup lang="ts">
import Toast from './Toast.vue';
import { useToast } from '../../composables/useToast';

const toast = useToast();
</script>

<template>
  <slot />
  <Toast
    :message="toast.state.value.message"
    :variant="toast.state.value.variant"
    :icon="toast.state.value.icon"
    :visible="toast.state.value.visible"
    @close="toast.hide"
  />
</template>
