<script setup lang="ts">
import { ref, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Button } from '@/modules/ui/components';
import { useTheme } from '@/modules/shared/composables/useTheme';
import type { Store } from '../../types/store-dashboard.types';

const props = defineProps<{
  store: Store;
  onManageCashiers: (store: Store) => void;
  onDelete: (store: Store) => void;
}>();

const { isDark } = useTheme();

interface ActionDef {
  key: string;
  label: string;
  icon: string[];
  handler: () => void;
  variant?: 'default' | 'danger';
}

const dropdownRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const actions: ActionDef[] = [
  {
    key: 'cashiers',
    label: 'Manage cashiers',
    icon: ['fas', 'users'],
    handler: () => props.onManageCashiers(props.store),
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: ['fas', 'trash'],
    handler: () => props.onDelete(props.store),
    variant: 'danger',
  },
];

onClickOutside(dropdownRef, () => {
  isOpen.value = false;
});

watch(
  () => props.store,
  () => {
    isOpen.value = false;
  }
);

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

const handleAction = (action: ActionDef) => {
  action.handler();
  isOpen.value = false;
};
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Mobile: Overflow button -->
    <Button
      variant="ghost"
      size="sm"
      :icon="['fas', 'ellipsis-v']"
      class="sm:hidden min-h-11 min-w-11"
      aria-label="Store actions"
      @click="toggleOpen"
    />
    <!-- Desktop: Visible action buttons -->
    <div class="hidden sm:flex gap-1 flex-shrink-0">
      <Button
        v-for="action in actions"
        :key="action.key"
        variant="ghost"
        size="sm"
        :icon="action.icon"
        :title="action.label"
        class="min-h-11 min-w-11"
        @click="action.handler"
      />
    </div>
    <!-- Mobile dropdown -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="sm:hidden absolute right-0 top-full mt-1 z-50 min-w-[180px] py-1 rounded-lg shadow-lg border overflow-hidden"
        :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'"
      >
        <button
          v-for="action in actions"
          :key="action.key"
          type="button"
          class="w-full px-4 py-3 text-left text-sm flex items-center gap-3 min-h-11 transition-colors"
          :class="isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-800'"
          @click="handleAction(action)"
        >
          <FontAwesomeIcon :icon="action.icon" class="w-4 h-4 flex-shrink-0" />
          {{ action.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
