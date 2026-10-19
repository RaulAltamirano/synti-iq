<template>
  <ConfirmModal
    :is-visible="state.isVisible"
    :variant="state.variant"
    :title="state.title"
    :message="state.message"
    :confirm-text="state.confirmText"
    :cancel-text="state.cancelText"
    :loading-text="state.loadingText"
    :loading="state.loading"
    :icon="state.icon"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import ConfirmModal from './ConfirmModal.vue';
import { useConfirmModal } from '../../composables/useConfirmModal';

const { state, handleConfirm, handleCancel } = useConfirmModal();
</script>
