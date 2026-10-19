<script setup lang="ts">
import { computed } from 'vue';
import Button from '../Button/Button.vue';

export interface PaginationProps {
  modelValue: number;
  totalPages: number;
  maxPagesToShow?: number;
  showCompactOnMobile?: boolean;
  disabled?: boolean;
  onPageChange?: (page: number) => void;
}

const props = withDefaults(defineProps<PaginationProps>(), {
  maxPagesToShow: 5,
  showCompactOnMobile: false,
  disabled: false,
  onPageChange: undefined,
});

const emit = defineEmits<{ 'update:modelValue': [page: number] }>();

const rangeStart = computed(() =>
  Math.max(1, props.modelValue - Math.floor(props.maxPagesToShow / 2))
);
const rangeEnd = computed(() =>
  Math.min(props.totalPages, rangeStart.value + props.maxPagesToShow - 1)
);
const pagesInRange = computed(() =>
  Array.from({ length: rangeEnd.value - rangeStart.value + 1 }, (_, i) => rangeStart.value + i)
);

const goToPage = (page: number) => {
  if (props.disabled) return;
  if (page >= 1 && page <= props.totalPages) {
    emit('update:modelValue', page);
    props.onPageChange?.(page);
    window.scrollTo(0, 0);
  }
};

const isFirstDisabled = computed(() => props.modelValue === 1 || props.disabled);
const isLastDisabled = computed(() => props.modelValue === props.totalPages || props.disabled);
const compactTextClasses = 'text-gray-700 dark:text-gray-300';
</script>

<template>
  <nav
    class="flex flex-wrap items-center justify-center gap-2"
    role="navigation"
    aria-label="Pagination"
  >
    <!-- Full pagination (desktop or when not compact) -->
    <div
      :class="[
        'flex flex-wrap items-center justify-center gap-2',
        showCompactOnMobile ? 'hidden sm:flex' : '',
      ]"
    >
      <!-- First -->
      <Button
        variant="outline"
        size="sm"
        :icon="['fas', 'angles-left']"
        :disabled="isFirstDisabled"
        class="min-h-11 min-w-11 sm:min-w-0 sm:px-3"
        aria-label="First page"
        @click="goToPage(1)"
      >
        <span class="hidden sm:inline">First</span>
      </Button>

      <!-- Previous -->
      <Button
        variant="outline"
        size="sm"
        :icon="['fas', 'chevron-left']"
        :disabled="isFirstDisabled"
        class="min-h-11 min-w-11 sm:min-w-0 sm:px-3"
        aria-label="Previous page"
        @click="goToPage(modelValue - 1)"
      >
        <span class="hidden sm:inline">Previous</span>
      </Button>

      <!-- Ellipsis before -->
      <Button
        v-if="rangeStart > 1"
        variant="outline"
        size="sm"
        class="min-h-11 min-w-11 px-4"
        aria-label="Go to previous page range"
        @click="goToPage(rangeStart - 1)"
      >
        ...
      </Button>

      <!-- Page numbers -->
      <Button
        v-for="page in pagesInRange"
        :key="page"
        :variant="modelValue === page ? 'primary' : 'outline'"
        size="sm"
        class="min-h-11 min-w-11"
        :aria-label="`Page ${page}`"
        :aria-current="modelValue === page ? 'page' : undefined"
        @click="goToPage(page)"
      >
        {{ page }}
      </Button>

      <!-- Ellipsis after -->
      <Button
        v-if="rangeEnd < totalPages"
        variant="outline"
        size="sm"
        class="min-h-11 min-w-11 px-4"
        aria-label="Go to next page range"
        @click="goToPage(rangeEnd + 1)"
      >
        ...
      </Button>

      <!-- Next -->
      <Button
        variant="outline"
        size="sm"
        :icon="['fas', 'chevron-right']"
        icon-position="right"
        :disabled="isLastDisabled"
        class="min-h-11 min-w-11 sm:min-w-0 sm:px-3"
        aria-label="Next page"
        @click="goToPage(modelValue + 1)"
      >
        <span class="hidden sm:inline">Next</span>
      </Button>

      <!-- Last -->
      <Button
        variant="outline"
        size="sm"
        :icon="['fas', 'angles-right']"
        icon-position="right"
        :disabled="isLastDisabled"
        class="min-h-11 min-w-11 sm:min-w-0 sm:px-3"
        aria-label="Last page"
        @click="goToPage(totalPages)"
      >
        <span class="hidden sm:inline">Last</span>
      </Button>
    </div>

    <!-- Compact pagination (mobile only when showCompactOnMobile) -->
    <div v-if="showCompactOnMobile" class="flex gap-2 sm:hidden">
      <Button
        variant="outline"
        size="sm"
        :icon="['fas', 'chevron-left']"
        :disabled="isFirstDisabled"
        class="min-h-11 min-w-11 flex-1"
        aria-label="Previous page"
        @click="goToPage(modelValue - 1)"
      />
      <span
        class="flex min-h-11 items-center justify-center px-4 text-sm font-medium"
        :class="compactTextClasses"
      >
        {{ modelValue }} / {{ totalPages }}
      </span>
      <Button
        variant="outline"
        size="sm"
        :icon="['fas', 'chevron-right']"
        icon-position="right"
        :disabled="isLastDisabled"
        class="min-h-11 min-w-11 flex-1"
        aria-label="Next page"
        @click="goToPage(modelValue + 1)"
      />
    </div>
  </nav>
</template>
